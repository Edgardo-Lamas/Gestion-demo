import React from 'react';
import { Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

const Inventory = ({ productos, stock_actual, compras, onUpdate }) => {
    const { addToast } = useToast();

    const handlePriceChange = async (id, newPrice) => {
        const val = parseFloat(newPrice);
        const finalVal = isNaN(val) ? 0 : val;

        const { error } = await supabase.from('productos')
            .update({ precio_catalogo: finalVal })
            .eq('id', id);

        if (error) {
            addToast('Error actualizando precio', 'error');
            return;
        }

        if (onUpdate) onUpdate();
    };

    const toggleCatalogVisibility = async (id, currentOculto) => {
        const newOculto = currentOculto === true ? false : true;

        const { error } = await supabase.from('productos')
            .update({ oculto_catalogo: newOculto })
            .eq('id', id);

        if (error) {
            addToast('Error actualizando visibilidad', 'error');
            return;
        }

        addToast('Visibilidad del catálogo actualizada', 'info');
        if (onUpdate) onUpdate();
    };

    const handleDeleteProducto = async (id, nombre) => {
        // Contar registros relacionados para informar al usuario
        const [{ count: cCompras }, { count: cVentas }, { count: cDist }] = await Promise.all([
            supabase.from('compras').select('id', { count: 'exact', head: true }).eq('producto_id', id),
            supabase.from('ventas').select('id', { count: 'exact', head: true }).eq('producto_id', id),
            supabase.from('distribuciones').select('id', { count: 'exact', head: true }).eq('producto_id', id),
        ]);

        const detalles = [
            cCompras > 0 && `${cCompras} compra(s)`,
            cVentas > 0 && `${cVentas} venta(s)`,
            cDist > 0 && `${cDist} distribución(es)`,
        ].filter(Boolean).join(', ');

        const mensaje = detalles
            ? `¿Eliminar "${nombre}" y todos sus registros relacionados (${detalles})?\n\nEsta acción no se puede deshacer.`
            : `¿Eliminar el producto "${nombre}"? Esta acción no se puede deshacer.`;

        if (!window.confirm(mensaje)) return;

        // Borrado en cascada manual
        const errores = [];
        if (cDist > 0) {
            const { error } = await supabase.from('distribuciones').delete().eq('producto_id', id);
            if (error) errores.push('distribuciones');
        }
        if (cVentas > 0) {
            const { error } = await supabase.from('ventas').delete().eq('producto_id', id);
            if (error) errores.push('ventas');
        }
        if (cCompras > 0) {
            const { error } = await supabase.from('compras').delete().eq('producto_id', id);
            if (error) errores.push('compras');
        }

        if (errores.length > 0) {
            addToast(`Error eliminando registros de: ${errores.join(', ')}`, 'error');
            return;
        }

        const { error } = await supabase.from('productos').delete().eq('id', id);
        if (error) {
            addToast(`Error eliminando el producto: ${error.message}`, 'error');
            return;
        }

        addToast(`Producto "${nombre}" y todos sus registros eliminados`, 'info');
        if (onUpdate) onUpdate();
    };

    return (
        <div className="inventory-view">
            <section className="glass-card">
                <h3>Stock Actual por Producto</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Stock Total (kg)</th>
                                <th>Precio Catálogo B2B ($/kg)</th>
                                <th>Visible Catálogo</th>
                                <th>Próximo Lote a Vender (FIFO)</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {productos.map(p => {
                                const stock = stock_actual[p.id] || 0;
                                const proximo_lote = compras
                                    .filter(c => c.producto_id === p.id && c.cantidad_disponible > 0)
                                    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];

                                return (
                                    <tr key={p.id}>
                                        <td><strong>{p.nombre}</strong></td>
                                        <td style={{ fontWeight: 'bold' }}>
                                            <span style={{ color: stock === 0 ? 'var(--error)' : stock < 10 ? '#f59e0b' : 'var(--secondary)' }}>
                                                {stock.toFixed(2)} kg
                                            </span>
                                            {stock > 0 && stock < 10 && (
                                                <span style={{ marginLeft: '0.5rem', background: 'rgba(245,158,11,0.12)', color: '#b45309', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.3)' }}>
                                                    ⚠ Stock bajo
                                                </span>
                                            )}
                                            {stock === 0 && (
                                                <span style={{ marginLeft: '0.5rem', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                    Sin stock
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="input-wrapper" style={{ width: '120px' }}>
                                                <span style={{ position: 'absolute', left: '8px', color: '#64748b', fontSize: '0.9em' }}>$</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    defaultValue={p.precio_catalogo || ''}
                                                    onBlur={(e) => {
                                                        if (parseFloat(e.target.value) !== (p.precio_catalogo || 0)) {
                                                            handlePriceChange(p.id, e.target.value);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handlePriceChange(p.id, e.target.value);
                                                    }}
                                                    placeholder="0.00"
                                                    style={{ width: '100%', padding: '0.4rem 0.4rem 0.4rem 1.5rem', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none' }}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => toggleCatalogVisibility(p.id, p.oculto_catalogo)}
                                                style={{
                                                    padding: '0.3rem 0.6rem',
                                                    borderRadius: '20px',
                                                    border: 'none',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    background: p.oculto_catalogo ? 'rgba(100,116,139,0.1)' : 'rgba(16,185,129,0.1)',
                                                    color: p.oculto_catalogo ? '#64748b' : '#10b981'
                                                }}
                                            >
                                                {p.oculto_catalogo ? 'Mostrar' : 'Ocultar'}
                                            </button>
                                        </td>
                                        <td>
                                            {proximo_lote
                                                ? `${proximo_lote.cantidad_disponible.toFixed(2)} kg @ $${proximo_lote.costo_unitario.toFixed(2)} (${proximo_lote.fecha})`
                                                : 'Sin stock'}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteProducto(p.id, p.nombre)}
                                                title="Eliminar producto"
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-muted)',
                                                    padding: '0.35rem',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="glass-card" style={{ marginTop: '2rem' }}>
                <h3>Detalle de Lotes Disponibles (Compras)</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Fecha Compra</th>
                                <th>Cantidad Disponible (kg)</th>
                                <th>Costo Unitario (kg)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {compras
                                .filter(c => c.cantidad_disponible > 0)
                                .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                                .map(c => (
                                    <tr key={c.id}>
                                        <td>{productos.find(p => p.id === c.producto_id)?.nombre}</td>
                                        <td>{c.fecha}</td>
                                        <td>{c.cantidad_disponible.toFixed(2)} kg</td>
                                        <td>${c.costo_unitario.toFixed(2)}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Inventory;
