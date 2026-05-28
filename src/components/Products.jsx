import React, { useState } from 'react';
import { Trash2, Plus, Pencil, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const Products = ({ productos, stock_actual, clientes = [], descuentos = [], onUpdate }) => {
    const { addToast } = useToast();

    // Modal crear
    const [showCrear, setShowCrear] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoCosto, setNuevoCosto] = useState('');
    const [nuevoPrecioB2B, setNuevoPrecioB2B] = useState('');
    const [nuevoVisibleCatalogo, setNuevoVisibleCatalogo] = useState(false);
    const [creando, setCreando] = useState(false);

    // Modal editar
    const [showEditar, setShowEditar] = useState(false);
    const [editando, setEditando] = useState(false);
    const [editProducto, setEditProducto] = useState(null);
    const [editNombre, setEditNombre] = useState('');
    const [editCosto, setEditCosto] = useState('');
    const [editPrecioB2B, setEditPrecioB2B] = useState('');
    const [editVisibleCatalogo, setEditVisibleCatalogo] = useState(false);
    const [editDescuentos, setEditDescuentos] = useState([]); // [{cliente_id, margen_ganancia}]
    const [addDescClienteId, setAddDescClienteId] = useState('');
    const [addDescMargen, setAddDescMargen] = useState('');

    const abrirEditar = (p) => {
        setEditProducto(p);
        setEditNombre(p.nombre);
        setEditCosto(p.costo_referencia != null ? String(p.costo_referencia) : '');
        setEditPrecioB2B(p.precio_catalogo != null ? String(p.precio_catalogo) : '');
        setEditVisibleCatalogo(p.visible_catalogo === true);
        setEditDescuentos(descuentos.filter(d => d.producto_id === p.id).map(d => ({ cliente_id: d.cliente_id, margen_ganancia: d.margen_ganancia })));
        setAddDescClienteId('');
        setAddDescMargen('');
        setShowEditar(true);
    };

    const handleGuardarEdicion = async (e) => {
        e.preventDefault();
        if (!editNombre.trim()) return;
        setEditando(true);

        const { error } = await supabase.from('productos').update({
            nombre: editNombre.trim(),
            costo_referencia: parseFloat(editCosto) || 0,
            precio_catalogo: parseFloat(editPrecioB2B) || 0,
            visible_catalogo: editVisibleCatalogo,
        }).eq('id', editProducto.id);

        setEditando(false);
        if (error) {
            addToast('Error al guardar: ' + error.message, 'error');
            return;
        }

        // Guardar descuentos por cliente: borrar los anteriores e insertar los nuevos
        await supabase.from('descuentos_cliente_producto').delete().eq('producto_id', editProducto.id);
        if (editDescuentos.length > 0) {
            await supabase.from('descuentos_cliente_producto').insert(
                editDescuentos.map(d => ({ producto_id: editProducto.id, cliente_id: d.cliente_id, margen_ganancia: parseFloat(d.margen_ganancia) || 0 }))
            );
        }

        addToast('Producto actualizado', 'success');
        setShowEditar(false);
        if (onUpdate) onUpdate();
    };

    const handleCrear = async (e) => {
        e.preventDefault();
        if (!nuevoNombre.trim()) return;
        setCreando(true);

        const { error } = await supabase.from('productos').insert([{
            nombre: nuevoNombre.trim(),
            costo_referencia: parseFloat(nuevoCosto) || 0,
            precio_catalogo: parseFloat(nuevoPrecioB2B) || 0,
            visible_catalogo: nuevoVisibleCatalogo,
            oculto_catalogo: false,
        }]);

        setCreando(false);
        if (error) {
            addToast('Error al crear: ' + error.message, 'error');
            return;
        }

        addToast(`"${nuevoNombre.trim()}" creado`, 'success');
        setNuevoNombre('');
        setNuevoCosto('');
        setNuevoPrecioB2B('');
        setNuevoVisibleCatalogo(false);
        setShowCrear(false);
        if (onUpdate) onUpdate();
    };

    const handleEliminar = async (id, nombre) => {
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
            : `¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`;

        if (!window.confirm(mensaje)) return;

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
            addToast(`Error eliminando: ${errores.join(', ')}`, 'error');
            return;
        }

        const { error } = await supabase.from('productos').delete().eq('id', id);
        if (error) {
            addToast('Error al eliminar: ' + error.message, 'error');
            return;
        }

        addToast(`"${nombre}" eliminado`, 'info');
        if (onUpdate) onUpdate();
    };

    return (
        <>
            <style>{`
                .products-modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    padding: 1.25rem 1.5rem;
                    border-top: 1px solid var(--border);
                }
                .products-secondary-btn {
                    background: white;
                    color: var(--text);
                    border: 1px solid var(--border);
                    padding: 0.75rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .products-secondary-btn:hover {
                    background: #f8fafc;
                    border-color: var(--primary);
                    color: var(--primary);
                }
                .prod-action-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0.4rem;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    transition: all 0.2s;
                    color: var(--text-muted);
                }
                .prod-action-btn:hover { background: rgba(59,122,87,0.1); color: var(--primary); }
                .prod-action-btn.danger:hover { background: rgba(239,68,68,0.1); color: var(--error); }
                .prod-form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                @media (max-width: 480px) {
                    .prod-form-grid { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="products-view">
                <section className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h3 style={{ margin: 0 }}>Gestión de Productos</h3>
                            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Creá, editá y eliminá productos. El costo de referencia se usa cuando no hay compras cargadas.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCrear(true)}
                            className="primary-btn"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
                        >
                            <Plus size={16} />
                            Nuevo producto
                        </button>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Costo referencia ($)</th>
                                    <th>Precio catálogo B2B ($)</th>
                                    <th>Stock actual</th>
                                    <th style={{ textAlign: 'center' }}>B2B</th>
                                    <th style={{ width: '90px', textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                            No hay productos. Creá el primero con el botón de arriba.
                                        </td>
                                    </tr>
                                )}
                                {productos.map(p => {
                                    const stock = stock_actual?.[p.id] || 0;
                                    return (
                                        <tr key={p.id}>
                                            <td><strong>{p.nombre}</strong></td>
                                            <td>
                                                {p.costo_referencia
                                                    ? <span style={{ color: 'var(--text)' }}>${Number(p.costo_referencia).toLocaleString('es-AR')}</span>
                                                    : <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Sin definir</span>
                                                }
                                            </td>
                                            <td>
                                                {p.precio_catalogo
                                                    ? <span>${Number(p.precio_catalogo).toLocaleString('es-AR')}</span>
                                                    : <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Sin definir</span>
                                                }
                                            </td>
                                            <td>
                                                <span style={{
                                                    fontWeight: 600,
                                                    color: stock === 0 ? 'var(--error)' : stock < 10 ? '#f59e0b' : 'var(--secondary)',
                                                }}>
                                                    {stock.toFixed(2)} kg
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {p.visible_catalogo
                                                    ? <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.6rem', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.25)' }}>✓ B2B</span>
                                                    : <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>
                                                }
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                                                    <button
                                                        className="prod-action-btn"
                                                        onClick={() => abrirEditar(p)}
                                                        title="Editar"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        className="prod-action-btn danger"
                                                        onClick={() => handleEliminar(p.id, p.nombre)}
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* ─── Modal Crear ─── */}
            {showCrear && (
                <div className="modal-overlay" onClick={() => setShowCrear(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                        <div className="modal-header">
                            <h2>Nuevo producto</h2>
                            <button className="icon-btn delete" onClick={() => setShowCrear(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCrear}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={labelStyle}>Nombre *</label>
                                    <input
                                        type="text"
                                        value={nuevoNombre}
                                        onChange={e => setNuevoNombre(e.target.value)}
                                        placeholder="Ej: Yerba mate, Miel, Aceite esencial..."
                                        required
                                        autoFocus
                                        style={fieldStyle}
                                    />
                                </div>
                                <div className="prod-form-grid">
                                    <div>
                                        <label style={labelStyle}>Costo referencia ($)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="10"
                                            value={nuevoCosto}
                                            onChange={e => setNuevoCosto(e.target.value)}
                                            placeholder="0"
                                            style={fieldStyle}
                                        />
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.4rem 0 0' }}>
                                            Fallback si no hay compras
                                        </p>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Precio catálogo B2B ($)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="10"
                                            value={nuevoPrecioB2B}
                                            onChange={e => setNuevoPrecioB2B(e.target.value)}
                                            placeholder="0"
                                            style={fieldStyle}
                                        />
                                    </div>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none' }}>
                                    <input
                                        type="checkbox"
                                        checked={nuevoVisibleCatalogo}
                                        onChange={e => setNuevoVisibleCatalogo(e.target.checked)}
                                        style={{ width: '16px', height: '16px', accentColor: '#10b981', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>
                                        Disponible en catálogo
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        (aparece en catálogo B2B)
                                    </span>
                                </label>
                            </div>
                            <div className="products-modal-actions">
                                <button type="button" className="products-secondary-btn" onClick={() => setShowCrear(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="primary-btn" disabled={creando || !nuevoNombre.trim()}>
                                    {creando ? 'Creando...' : 'Crear producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Modal Editar ─── */}
            {showEditar && editProducto && (
                <div className="modal-overlay" onClick={() => setShowEditar(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                        <div className="modal-header">
                            <h2>Editar producto</h2>
                            <button className="icon-btn delete" onClick={() => setShowEditar(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleGuardarEdicion}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={labelStyle}>Nombre *</label>
                                    <input
                                        type="text"
                                        value={editNombre}
                                        onChange={e => setEditNombre(e.target.value)}
                                        required
                                        autoFocus
                                        style={fieldStyle}
                                    />
                                </div>
                                <div className="prod-form-grid">
                                    <div>
                                        <label style={labelStyle}>Costo referencia ($)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="10"
                                            value={editCosto}
                                            onChange={e => setEditCosto(e.target.value)}
                                            placeholder="0"
                                            style={fieldStyle}
                                        />
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.4rem 0 0' }}>
                                            Se usa cuando no hay compras cargadas
                                        </p>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Precio catálogo B2B ($)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="10"
                                            value={editPrecioB2B}
                                            onChange={e => setEditPrecioB2B(e.target.value)}
                                            placeholder="0"
                                            style={fieldStyle}
                                        />
                                    </div>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none' }}>
                                    <input
                                        type="checkbox"
                                        checked={editVisibleCatalogo}
                                        onChange={e => setEditVisibleCatalogo(e.target.checked)}
                                        style={{ width: '16px', height: '16px', accentColor: '#10b981', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>
                                        Disponible en catálogo
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        (aparece en catálogo B2B)
                                    </span>
                                </label>

                                {/* ── Descuentos por cliente ── */}
                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                                    <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>Descuentos por cliente (%)</label>

                                    {editDescuentos.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                            {editDescuentos.map((d, i) => {
                                                const cli = clientes.find(c => c.id === d.cliente_id);
                                                return (
                                                    <div key={d.cliente_id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.6rem' }}>
                                                        <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 600 }}>{cli?.nombre || '—'}</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.5"
                                                            value={d.margen_ganancia}
                                                            onChange={e => {
                                                                const copy = [...editDescuentos];
                                                                copy[i] = { ...copy[i], margen_ganancia: e.target.value };
                                                                setEditDescuentos(copy);
                                                            }}
                                                            style={{ width: '70px', padding: '0.3rem 0.5rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.88rem', textAlign: 'right' }}
                                                        />
                                                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>%</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditDescuentos(editDescuentos.filter((_, idx) => idx !== i))}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
                                                            title="Quitar"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Agregar nuevo cliente */}
                                    {clientes.filter(c => !editDescuentos.find(d => d.cliente_id === c.id)).length > 0 && (
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <select
                                                value={addDescClienteId}
                                                onChange={e => setAddDescClienteId(e.target.value)}
                                                style={{ flex: 1, padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', background: 'var(--surface)' }}
                                            >
                                                <option value="">+ Cliente...</option>
                                                {clientes.filter(c => !editDescuentos.find(d => d.cliente_id === c.id)).map(c => (
                                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                placeholder="%"
                                                value={addDescMargen}
                                                onChange={e => setAddDescMargen(e.target.value)}
                                                style={{ width: '70px', padding: '0.4rem 0.5rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'right' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!addDescClienteId || addDescMargen === '') return;
                                                    setEditDescuentos([...editDescuentos, { cliente_id: addDescClienteId, margen_ganancia: addDescMargen }]);
                                                    setAddDescClienteId('');
                                                    setAddDescMargen('');
                                                }}
                                                style={{ padding: '0.4rem 0.75rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
                                            >
                                                Agregar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="products-modal-actions">
                                <button type="button" className="products-secondary-btn" onClick={() => setShowEditar(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="primary-btn" disabled={editando || !editNombre.trim()}>
                                    {editando ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

const fieldStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontSize: '0.95rem',
    outline: 'none',
    background: 'var(--surface)',
    color: 'var(--text)',
    boxSizing: 'border-box',
};

const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
};

export default Products;
