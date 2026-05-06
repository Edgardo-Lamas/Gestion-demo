import React, { useState, useMemo } from 'react';
import { BadgeDollarSign, Trash2, Plus, Search, Calendar, Package, Percent, Info, TrendingUp } from 'lucide-react';
import { ejecutarAlgoritmoVentaFIFO } from '../utils/fifo';
import Modal from './ui/Modal';
import { useToast } from '../context/ToastContext';

import { supabase } from '../lib/supabase';

const Sales = ({ productos, compras, ventas, stock_actual, costoPromedio, clientes = [], descuentos = [], onUpdate }) => {
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [clienteFilter, setClienteFilter] = useState('');

    // Paginación simple
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [nuevaVenta, setNuevaVenta] = useState({
        producto_id: '',
        cantidad_vendida: '',
        precio_venta_unitario: '',
        margen_ganancia: '',
        cliente_id: '',
        fecha: new Date().toISOString().split('T')[0]
    });

    // Info del producto seleccionado para el panel de contexto
    const productoSeleccionado = useMemo(() => {
        if (!nuevaVenta.producto_id) return null;
        const prod = productos.find(p => p.id === nuevaVenta.producto_id);
        const costo = costoPromedio[nuevaVenta.producto_id] || 0;
        const precioCatalogo = parseFloat(prod?.precio_catalogo) || 0;
        const precioBase = precioCatalogo > 0 ? precioCatalogo : costo;
        const usandoCatalogo = precioCatalogo > 0;
        const ultimaVenta = ventas.find(v => v.producto_id === nuevaVenta.producto_id);
        const lotes = compras
            .filter(c => c.producto_id === nuevaVenta.producto_id && c.cantidad_disponible > 0)
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        return { prod, costo, precioCatalogo, precioBase, usandoCatalogo, ultimaVenta, lotes };
    }, [nuevaVenta.producto_id, productos, costoPromedio, ventas, compras]);

    const clienteGenerico = clientes.find(c => c.es_generico);

    // Precio base del producto: precio_catalogo si está definido, sino costoPromedio
    const getPrecioBase = (producto_id) => {
        const prod = productos.find(p => p.id === producto_id);
        const catalogo = parseFloat(prod?.precio_catalogo) || 0;
        return catalogo > 0 ? catalogo : (costoPromedio[producto_id] || 0);
    };

    // Margen efectivo: descuento específico cliente+producto, o margen general del cliente
    const getMargenEfectivo = (cliente_id, producto_id) => {
        const especifico = descuentos.find(d => d.cliente_id === cliente_id && d.producto_id === producto_id);
        if (especifico != null) return { margen: especifico.margen_ganancia, esEspecifico: true };
        const cliente = clientes.find(c => c.id === cliente_id);
        if (cliente?.margen_ganancia != null) return { margen: cliente.margen_ganancia, esEspecifico: false };
        return null;
    };

    // Precio final para un cliente: base × (1 + margen / 100)
    const getPrecioCliente = (cliente_id, producto_id) => {
        if (!cliente_id || !producto_id) return null;
        const result = getMargenEfectivo(cliente_id, producto_id);
        if (!result) return null;
        const base = getPrecioBase(producto_id);
        if (base <= 0) return null;
        return base * (1 + parseFloat(result.margen) / 100);
    };

    // Al seleccionar un producto, autocompletar precio y margen
    const handleProductoChange = (producto_id) => {
        if (!producto_id) {
            setNuevaVenta({ ...nuevaVenta, producto_id: '', precio_venta_unitario: '', margen_ganancia: '' });
            return;
        }

        const base = getPrecioBase(producto_id);
        const ultimaVenta = ventas.find(v => v.producto_id === producto_id);

        // Si hay cliente seleccionado con margen, aplicarlo sobre el precio catálogo
        const precioCliente = getPrecioCliente(nuevaVenta.cliente_id, producto_id);
        if (precioCliente) {
            const result = getMargenEfectivo(nuevaVenta.cliente_id, producto_id);
            setNuevaVenta({ ...nuevaVenta, producto_id, precio_venta_unitario: precioCliente.toFixed(2), margen_ganancia: result?.margen ?? '' });
            return;
        }

        // Sin cliente: usar precio_catalogo directo, o la última venta como fallback
        let precio = base > 0 ? base.toFixed(2) : '';
        if (!precio && ultimaVenta) {
            precio = ultimaVenta.precio_venta_unitario.toString();
        }

        setNuevaVenta({ ...nuevaVenta, producto_id, precio_venta_unitario: precio, margen_ganancia: '' });
    };

    // Al seleccionar cliente, recalcular precio sobre precio_catalogo
    const handleClienteChange = (cliente_id) => {
        const precioCliente = getPrecioCliente(cliente_id, nuevaVenta.producto_id);
        if (precioCliente) {
            const result = getMargenEfectivo(cliente_id, nuevaVenta.producto_id);
            setNuevaVenta({ ...nuevaVenta, cliente_id, precio_venta_unitario: precioCliente.toFixed(2), margen_ganancia: result?.margen ?? '' });
        } else {
            setNuevaVenta({ ...nuevaVenta, cliente_id });
        }
    };

    // Al cambiar el margen manualmente, recalcular precio desde precio_catalogo
    const handleMargenChange = (margenStr) => {
        const base = getPrecioBase(nuevaVenta.producto_id);
        let precio = nuevaVenta.precio_venta_unitario;

        if (margenStr && base > 0) {
            const margen = parseFloat(margenStr);
            if (!isNaN(margen)) {
                precio = (base * (1 + margen / 100)).toFixed(2);
            }
        }

        setNuevaVenta({ ...nuevaVenta, margen_ganancia: margenStr, precio_venta_unitario: precio });
    };

    // Al cambiar el precio manualmente, recalcular el margen respecto al precio_catalogo
    const handlePrecioChange = (precioStr) => {
        const base = getPrecioBase(nuevaVenta.producto_id);
        let margen = nuevaVenta.margen_ganancia;

        if (precioStr && base > 0) {
            const precio = parseFloat(precioStr);
            if (!isNaN(precio)) {
                margen = (((precio - base) / base) * 100).toFixed(1);
            }
        }

        setNuevaVenta({ ...nuevaVenta, precio_venta_unitario: precioStr, margen_ganancia: margen });
    };

    const handleVenta = async (e) => {
        e.preventDefault();

        if (!nuevaVenta.producto_id || !nuevaVenta.cantidad_vendida || !nuevaVenta.precio_venta_unitario) {
            addToast('Por favor completa todos los campos', 'error');
            return;
        }

        const cantidad_vendida = parseFloat(nuevaVenta.cantidad_vendida);
        const precio_venta_unitario = parseFloat(nuevaVenta.precio_venta_unitario);

        // Validar stock antes de procesar
        if (!stock_actual[nuevaVenta.producto_id] || stock_actual[nuevaVenta.producto_id] < cantidad_vendida) {
            addToast(`Stock insuficiente. Disponible: ${stock_actual[nuevaVenta.producto_id]?.toFixed(2) || 0} kg`, 'error');
            return;
        }

        // 2. Buscar compras (FIFO)
        const compras_producto = compras
            .filter(c => c.producto_id === nuevaVenta.producto_id && c.cantidad_disponible > 0)
            .sort((a, b) => {
                const fechaA = new Date(a.fecha);
                const fechaB = new Date(b.fecha);
                if (fechaA - fechaB !== 0) return fechaA - fechaB;
                return (a.creado_en || 0) - (b.creado_en || 0);
            });

        try {
            const { lotes_actualizados, costo_total } = ejecutarAlgoritmoVentaFIFO(cantidad_vendida, compras_producto);
            const ingreso_total = cantidad_vendida * precio_venta_unitario;
            const ganancia = ingreso_total - costo_total;

            const registro_venta = {
                producto_id: nuevaVenta.producto_id,
                producto_nombre: productos.find(p => p.id === nuevaVenta.producto_id)?.nombre,
                fecha: nuevaVenta.fecha,
                cantidad_vendida: cantidad_vendida,
                precio_venta_unitario: precio_venta_unitario,
                ingreso_total: ingreso_total,
                costo_calculado: costo_total,
                ganancia: ganancia,
                cliente_id: nuevaVenta.cliente_id || null
            };

            // Ejecutar las peticiones a Supabase

            // 1. Actualizar lotes descontados
            if (lotes_actualizados.length > 0) {
                // Supabase upsert por id para modificar la cantidad_disponible
                const comprasParaUpsert = lotes_actualizados.map(la => ({
                    id: la.id,
                    producto_id: la.producto_id,
                    cantidad_kg: la.cantidad_kg,
                    cantidad_disponible: la.cantidad_disponible,
                    costo_unitario: la.costo_unitario,
                    fecha: la.fecha,
                    creado_en: la.creado_en
                }));

                const { error: errCompras } = await supabase.from('compras').upsert(comprasParaUpsert);
                if (errCompras) throw errCompras;
            }

            // Persistir margen en el producto solo si la venta es sin cliente
            // (el margen del cliente no debe contaminar el margen base del producto)
            if (nuevaVenta.margen_ganancia && !nuevaVenta.cliente_id) {
                const { error: errProd } = await supabase.from('productos')
                    .update({ margen_ganancia: parseFloat(nuevaVenta.margen_ganancia) })
                    .eq('id', nuevaVenta.producto_id);
                if (errProd) throw errProd;
            }

            // 3. Registrar Venta
            const { error: errVenta } = await supabase.from('ventas').insert([registro_venta]);
            if (errVenta) throw errVenta;

            addToast('Venta registrada exitosamente', 'success');
            setIsModalOpen(false);

            // Reset form
            setNuevaVenta({
                producto_id: '',
                cantidad_vendida: '',
                precio_venta_unitario: '',
                margen_ganancia: '',
                cliente_id: '',
                fecha: new Date().toISOString().split('T')[0]
            });

            if (onUpdate) onUpdate();
        } catch (err) {
            addToast(err.message, 'error');
        }
    };

    const deleteVenta = async (venta) => {
        const prod = productos.find(p => p.id === venta.producto_id);
        const msg = `¿Anular la venta de ${venta.cantidad_vendida} kg de ${prod?.nombre || 'este producto'}?\n\nSe restaurará el stock automáticamente.`;
        if (!window.confirm(msg)) return;

        // Restaurar stock en orden FIFO inverso: devolver kilos a los lotes
        // más antiguos primero (los mismos que se consumieron al vender)
        const lotesProducto = compras
            .filter(c => c.producto_id === venta.producto_id)
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        let aRestaurar = parseFloat(venta.cantidad_vendida);
        const actualizaciones = [];

        for (const lote of lotesProducto) {
            if (aRestaurar <= 0) break;
            const consumido = lote.cantidad_kg - lote.cantidad_disponible;
            if (consumido <= 0) continue;
            const devolver = Math.min(aRestaurar, consumido);
            actualizaciones.push({ id: lote.id, cantidad_disponible: lote.cantidad_disponible + devolver });
            aRestaurar -= devolver;
        }

        for (const upd of actualizaciones) {
            const { error } = await supabase.from('compras')
                .update({ cantidad_disponible: upd.cantidad_disponible })
                .eq('id', upd.id);
            if (error) {
                addToast('Error restaurando stock: ' + error.message, 'error');
                return;
            }
        }

        const { error } = await supabase.from('ventas').delete().eq('id', venta.id);
        if (error) {
            addToast('Error eliminando venta', 'error');
            return;
        }

        addToast(`Venta anulada y stock restaurado (${venta.cantidad_vendida} kg devueltos)`, 'success');
        if (onUpdate) onUpdate();
    };

    // Filter and Pagination Logic
    const filteredVentas = ventas.filter(v => {
        const matchSearch = !searchTerm ||
            v.producto_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.fecha.includes(searchTerm);
        const matchCliente = !clienteFilter || v.cliente_id === clienteFilter;
        let matchDate = true;
        if (dateFilter !== 'all') {
            const now = new Date();
            const vDate = new Date(v.fecha + 'T00:00:00');
            if (dateFilter === 'week') {
                const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
                matchDate = vDate >= weekAgo;
            } else if (dateFilter === 'month') {
                matchDate = vDate.getMonth() === now.getMonth() && vDate.getFullYear() === now.getFullYear();
            }
        }
        return matchSearch && matchCliente && matchDate;
    });

    const totalPages = Math.ceil(filteredVentas.length / itemsPerPage);
    const paginatedVentas = filteredVentas.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="sales-view">
            <div className="view-header">
                <div className="search-bar glass-card">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por producto o fecha..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="primary-btn pulse" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> Nueva Venta
                </button>
            </div>

            <div className="filter-row">
                <div className="date-pills">
                    {[['all','Todo'],['week','Esta semana'],['month','Este mes']].map(([val, label]) => (
                        <button key={val} className={`filter-pill ${dateFilter === val ? 'active' : ''}`}
                            onClick={() => { setDateFilter(val); setCurrentPage(1); }}>
                            {label}
                        </button>
                    ))}
                </div>
                {clientes.length > 0 && (
                    <select className="client-filter-select" value={clienteFilter}
                        onChange={e => { setClienteFilter(e.target.value); setCurrentPage(1); }}>
                        <option value="">Todos los clientes</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                )}
            </div>

            <section className="glass-card table-section">
                <div className="table-header-row">
                    <h3>Historial de Ventas</h3>
                    <span className="badge">{filteredVentas.length} registros</span>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Producto</th>
                                <th>Cliente</th>
                                <th>Cantidad (kg)</th>
                                <th>Precio (kg)</th>
                                <th>Total</th>
                                <th>Ganancia</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedVentas.length > 0 ? (
                                paginatedVentas.map(v => {
                                    const cliente = clientes.find(c => c.id === v.cliente_id);
                                    return (
                                    <tr key={v.id}>
                                        <td>
                                            <div className="date-badge">
                                                <Calendar size={14} />
                                                {new Date(v.fecha + 'T00:00:00').toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="fw-600">{v.producto_nombre}</td>
                                        <td>
                                            {cliente
                                                ? <span className="cliente-badge">{cliente.nombre}</span>
                                                : <span className="sin-cliente">—</span>
                                            }
                                        </td>
                                        <td>{v.cantidad_vendida} kg</td>
                                        <td>${v.precio_venta_unitario}</td>
                                        <td className="fw-700 text-primary">${v.ingreso_total.toFixed(2)}</td>
                                        <td>
                                            <span className={`profit-badge ${v.ganancia >= 0 ? 'positive' : 'negative'}`}>
                                                ${v.ganancia.toFixed(2)}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="icon-btn delete"
                                                onClick={() => deleteVenta(v)}
                                                title="Eliminar venta"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="empty-state">
                                        No se encontraron ventas
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            Anterior
                        </button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </section>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Registrar Nueva Venta"
            >
                <form onSubmit={handleVenta} className="modal-form">
                    {/* Selector de cliente */}
                    <div className="form-group">
                        <label>Cliente</label>
                        <div className="select-wrapper">
                            <select
                                value={nuevaVenta.cliente_id}
                                onChange={(e) => handleClienteChange(e.target.value)}
                            >
                                <option value="">— Venta sin cliente —</option>
                                {clienteGenerico && (
                                    <option value={clienteGenerico.id}>
                                        ⭐ {clienteGenerico.nombre} (predeterminado{clienteGenerico.margen_ganancia != null ? ` · +${clienteGenerico.margen_ganancia}%` : ''})
                                    </option>
                                )}
                                {clientes.filter(c => !c.es_generico).map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.nombre}{c.margen_ganancia != null ? ` (+${c.margen_ganancia}%)` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {nuevaVenta.cliente_id && (() => {
                            const result = nuevaVenta.producto_id
                                ? getMargenEfectivo(nuevaVenta.cliente_id, nuevaVenta.producto_id)
                                : null;
                            const cli = clientes.find(c => c.id === nuevaVenta.cliente_id);
                            if (result?.esEspecifico) return (
                                <small className="field-hint" style={{ color: '#10b981', fontStyle: 'normal', fontWeight: 600 }}>
                                    ✓ Descuento específico para este corte: +{result.margen}%
                                </small>
                            );
                            if (cli?.margen_ganancia != null) return (
                                <small className="field-hint" style={{ color: 'var(--secondary)', fontStyle: 'normal', fontWeight: 600 }}>
                                    ✓ Margen general de {cli.nombre}: +{cli.margen_ganancia}%
                                </small>
                            );
                            return null;
                        })()}
                    </div>

                    <div className="form-group">
                        <label>Producto</label>
                        <div className="select-wrapper">
                            <Package size={18} className="input-icon" />
                            <select
                                value={nuevaVenta.producto_id}
                                onChange={(e) => handleProductoChange(e.target.value)}
                                required
                            >
                                <option value="">Seleccionar producto...</option>
                                {productos.map(p => (
                                    <option key={p.id} value={p.id} disabled={!stock_actual[p.id] || stock_actual[p.id] <= 0}>
                                        {p.nombre} (Stock: {stock_actual[p.id]?.toFixed(2) || 0} kg)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Panel de contexto de costos */}
                    {productoSeleccionado && productoSeleccionado.precioBase > 0 && (
                        <div className="cost-context-panel">
                            <div className="context-header">
                                <Info size={16} />
                                <span>Info de precio — {productoSeleccionado.prod?.nombre}</span>
                            </div>
                            <div className="context-metrics">
                                {productoSeleccionado.usandoCatalogo ? (
                                    <div className="context-metric highlight">
                                        <span className="metric-label">✓ Precio catálogo</span>
                                        <span className="metric-value accent">${productoSeleccionado.precioCatalogo.toFixed(2)}/kg</span>
                                    </div>
                                ) : (
                                    <div className="context-metric">
                                        <span className="metric-label">Costo promedio stock (sin precio catálogo)</span>
                                        <span className="metric-value">${productoSeleccionado.costo.toFixed(2)}/kg</span>
                                    </div>
                                )}
                                {productoSeleccionado.usandoCatalogo && productoSeleccionado.costo > 0 && (
                                    <div className="context-metric">
                                        <span className="metric-label">Costo real stock</span>
                                        <span className="metric-value">${productoSeleccionado.costo.toFixed(2)}/kg</span>
                                    </div>
                                )}
                                {productoSeleccionado.ultimaVenta && (
                                    <div className="context-metric">
                                        <span className="metric-label">Último precio venta</span>
                                        <span className="metric-value">${productoSeleccionado.ultimaVenta.precio_venta_unitario.toFixed(2)}/kg</span>
                                    </div>
                                )}
                                {nuevaVenta.margen_ganancia && (
                                    <div className="context-metric highlight">
                                        <span className="metric-label">Margen cliente</span>
                                        <span className="metric-value accent">{parseFloat(nuevaVenta.margen_ganancia).toFixed(1)}%</span>
                                    </div>
                                )}
                            </div>
                            {productoSeleccionado.lotes.length > 1 && (
                                <div className="context-lotes">
                                    <span className="lotes-title">⚠ {productoSeleccionado.lotes.length} lotes con costos distintos:</span>
                                    {productoSeleccionado.lotes.map((l, i) => (
                                        <div key={i} className="lote-item">
                                            <span>Lote {new Date(l.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}:</span>
                                            <span>${l.costo_unitario.toFixed(2)}/kg ({l.cantidad_disponible.toFixed(2)} kg disp.)</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label>Fecha</label>
                            <input
                                type="date"
                                value={nuevaVenta.fecha}
                                onChange={(e) => setNuevaVenta({ ...nuevaVenta, fecha: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Cantidad (kg)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                value={nuevaVenta.cantidad_vendida}
                                onChange={(e) => setNuevaVenta({ ...nuevaVenta, cantidad_vendida: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Margen de ganancia (%)</label>
                            <div className="input-wrapper">
                                <Percent size={16} className="input-icon-small" />
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    placeholder="Ej: 30"
                                    value={nuevaVenta.margen_ganancia}
                                    onChange={(e) => handleMargenChange(e.target.value)}
                                    className="margin-input"
                                />
                            </div>
                            <small className="field-hint">Se recuerda para futuras ventas</small>
                        </div>
                        <div className="form-group">
                            <label>Precio de Venta Unitario ($)</label>
                            <div className="input-wrapper">
                                <span className="currency-symbol">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={nuevaVenta.precio_venta_unitario}
                                    onChange={(e) => handlePrecioChange(e.target.value)}
                                    required
                                />
                            </div>
                            {nuevaVenta.precio_venta_unitario && nuevaVenta.cantidad_vendida && (
                                <small className="field-hint total-hint">
                                    <TrendingUp size={12} /> Total: ${(parseFloat(nuevaVenta.precio_venta_unitario) * parseFloat(nuevaVenta.cantidad_vendida || 0)).toFixed(2)}
                                </small>
                            )}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="primary-btn">
                            <BadgeDollarSign size={18} /> Registrar Venta
                        </button>
                    </div>
                </form>
            </Modal>

            <style jsx>{`
                .view-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .filter-row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                }
                .date-pills {
                    display: flex;
                    gap: 0.4rem;
                }
                .filter-pill {
                    padding: 0.4rem 0.9rem;
                    border-radius: 20px;
                    border: 1px solid var(--border);
                    background: white;
                    color: var(--text-muted);
                    font-size: 0.82rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .filter-pill.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }
                .filter-pill:hover:not(.active) {
                    border-color: var(--primary);
                    color: var(--primary);
                }
                .client-filter-select {
                    padding: 0.4rem 0.75rem;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    background: white;
                    font-size: 0.85rem;
                    color: var(--text);
                    cursor: pointer;
                    padding-left: 0.75rem !important;
                }
                .client-filter-select:focus {
                    outline: none;
                    border-color: var(--primary);
                }

                .search-bar {
                    flex: 1;
                    min-width: 250px;
                    display: flex;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    gap: 0.75rem;
                }

                .search-bar input {
                    border: none;
                    background: transparent;
                    width: 100%;
                    outline: none;
                    font-size: 0.95rem;
                    color: var(--text);
                }

                .search-icon {
                    color: var(--text-muted);
                }

                .primary-btn {
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.3);
                }

                .primary-btn:hover {
                    background: var(--primary-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.4);
                }

                .pulse {
                    animation: pulse-shadow 2s infinite;
                }

                @keyframes pulse-shadow {
                    0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
                }

                .secondary-btn {
                    background: #f1f5f9;
                    color: var(--text);
                    border: 1px solid var(--border);
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .secondary-btn:hover {
                    background: #e2e8f0;
                }

                .table-section {
                    padding: 0;
                }

                .table-header-row {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .badge {
                    background: #f1f5f9;
                    color: var(--text-muted);
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .date-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                .fw-600 { font-weight: 600; }
                .fw-700 { font-weight: 700; }
                .text-primary { color: var(--primary); }

                .cliente-badge {
                    display: inline-block;
                    background: rgba(249, 115, 22, 0.08);
                    color: var(--primary);
                    border: 1px solid rgba(249, 115, 22, 0.2);
                    padding: 0.2rem 0.6rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .sin-cliente {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                .profit-badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 0.85rem;
                }
                .profit-badge.positive {
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--secondary);
                }
                .profit-badge.negative {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--error);
                }

                .icon-btn.delete {
                    color: var(--text-muted);
                    padding: 0.4rem;
                    border-radius: 6px;
                    transition: all 0.2s;
                }
                .icon-btn.delete:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--error);
                }

                .pagination {
                    padding: 1rem;
                    border-top: 1px solid var(--border);
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 1rem;
                }
                .pagination button {
                    background: transparent;
                    border: 1px solid var(--border);
                    padding: 0.4rem 0.8rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.85rem;
                }
                .pagination button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .empty-state {
                    text-align: center;
                    padding: 3rem;
                    color: var(--text-muted);
                }

                /* Modal Form Styles */
                .modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-group label {
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: var(--text);
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .select-wrapper, .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon, .currency-symbol {
                    position: absolute;
                    left: 1rem;
                    color: var(--text-muted);
                    pointer-events: none;
                }
                
                .currency-symbol {
                    font-weight: 600;
                }

                select, input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    padding-left: 2.5rem; /* Space for icon */
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    font-size: 0.95rem;
                    transition: border-color 0.2s;
                    background: #f8fafc;
                }
                
                input[type="date"] {
                    padding-left: 1rem;
                }

                select:focus, input:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: white;
                }

                .input-wrapper input {
                    padding-left: 2rem;
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 1rem;
                }

                /* Cost Context Panel */
                .cost-context-panel {
                    background: linear-gradient(135deg, rgba(249, 115, 22, 0.04), rgba(59, 130, 246, 0.04));
                    border: 1px solid rgba(249, 115, 22, 0.15);
                    border-radius: 12px;
                    padding: 1rem;
                    animation: fadeIn 0.3s ease;
                }

                .context-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--primary);
                    margin-bottom: 0.75rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid rgba(249, 115, 22, 0.1);
                }

                .context-metrics {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 0.75rem;
                    margin-bottom: 0.5rem;
                }

                .context-metric {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                    padding: 0.5rem 0.75rem;
                    background: rgba(255, 255, 255, 0.7);
                    border-radius: 8px;
                    border-left: 3px solid var(--border);
                }

                .context-metric.highlight {
                    border-left-color: var(--primary);
                    background: rgba(249, 115, 22, 0.06);
                }

                .metric-label {
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }

                .metric-value {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: var(--text);
                }

                .metric-value.accent {
                    color: var(--primary);
                }

                .context-lotes {
                    margin-top: 0.5rem;
                    padding-top: 0.5rem;
                    border-top: 1px dashed rgba(249, 115, 22, 0.15);
                }

                .lotes-title {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #f59e0b;
                    display: block;
                    margin-bottom: 0.25rem;
                }

                .lote-item {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    padding: 0.2rem 0;
                }

                /* Margin field */
                .input-icon-small {
                    position: absolute;
                    left: 0.75rem;
                    color: var(--text-muted);
                    pointer-events: none;
                }

                .margin-input {
                    padding-left: 2rem !important;
                }

                .field-hint {
                    font-size: 0.72rem;
                    color: var(--text-muted);
                    font-style: italic;
                }

                .total-hint {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    color: var(--primary);
                    font-weight: 600;
                    font-style: normal;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 640px) {
                    .view-header {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    .context-metrics {
                        grid-template-columns: 1fr;
                    }
                    .lote-item {
                        flex-direction: column;
                        gap: 0.1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Sales;
