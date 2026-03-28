import React, { useState, useMemo } from 'react';
import { Users, Plus, Search, Trash2, Eye, Zap, Edit3, Phone, MapPin, Tag, Calendar, Package, ArrowLeft, ShoppingBag, TrendingUp, Clock, X, ChevronDown } from 'lucide-react';
import Modal from './ui/Modal';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { ejecutarAlgoritmoVentaFIFO } from '../utils/fifo';

const CATEGORIAS = [
    { value: 'carniceria', label: '🥩 Carnicería' },
    { value: 'restaurante', label: '🍽️ Restaurante' },
    { value: 'mayorista', label: '📦 Mayorista' },
    { value: 'minorista', label: '🛒 Minorista' },
];

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n || 0);

const ClientProfiles = ({ clientes = [], clienteProductos = [], productos = [], compras = [], ventas = [], stock_actual = {}, costoPromedio = {}, onUpdate }) => {
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isCobrarModalOpen, setIsCobrarModalOpen] = useState(false);
    const [cobrarItems, setCobrarItems] = useState([]);
    const [cobrarLoading, setCobrarLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        nombre: '', telefono: '', direccion: '', notas: '', categoria: 'mayorista'
    });
    const [formProducts, setFormProducts] = useState([]);

    // Filtered clients
    const filteredClients = clientes.filter(c =>
        c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Products for a specific client
    const getClientProducts = (clienteId) =>
        clienteProductos.filter(cp => cp.cliente_id === clienteId).map(cp => {
            const prod = productos.find(p => p.id === cp.producto_id);
            const costo = costoPromedio[cp.producto_id] || 0;
            const precioFinal = cp.precio_fijo > 0 ? cp.precio_fijo : (costo > 0 && cp.margen_personalizado ? costo * (1 + cp.margen_personalizado / 100) : costo);
            return { ...cp, producto: prod, costo, precioFinal };
        });

    // Client sales history
    const getClientSales = (clienteId) =>
        ventas.filter(v => v.cliente_id === clienteId).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Client stats
    const getClientStats = (clienteId) => {
        const sales = getClientSales(clienteId);
        const totalComprado = sales.reduce((sum, v) => sum + v.ingreso_total, 0);
        const ultimaCompra = sales.length > 0 ? sales[0].fecha : null;
        const antiguedad = clientes.find(c => c.id === clienteId);
        const dias = antiguedad ? Math.floor((new Date() - new Date(antiguedad.fecha_alta)) / (1000 * 60 * 60 * 24)) : 0;
        return { totalComprado, ultimaCompra, totalVentas: sales.length, diasAntiguedad: dias };
    };

    // Open create modal
    const openCreateModal = () => {
        setEditingClient(null);
        setFormData({ nombre: '', telefono: '', direccion: '', notas: '', categoria: 'mayorista' });
        setFormProducts([]);
        setIsModalOpen(true);
    };

    // Open edit modal
    const openEditModal = (client) => {
        setEditingClient(client);
        setFormData({
            nombre: client.nombre, telefono: client.telefono || '',
            direccion: client.direccion || '', notas: client.notas || '', categoria: client.categoria || 'mayorista'
        });
        const prods = clienteProductos.filter(cp => cp.cliente_id === client.id).map(cp => ({
            producto_id: cp.producto_id, cantidad_kg: cp.cantidad_kg,
            margen_personalizado: cp.margen_personalizado || '', precio_fijo: cp.precio_fijo || ''
        }));
        setFormProducts(prods);
        setIsModalOpen(true);
    };

    // Add product row to form
    const addProductRow = () => {
        setFormProducts([...formProducts, { producto_id: '', cantidad_kg: 1, margen_personalizado: '', precio_fijo: '' }]);
    };

    // Remove product row
    const removeProductRow = (idx) => {
        setFormProducts(formProducts.filter((_, i) => i !== idx));
    };

    // Update product row
    const updateProductRow = (idx, field, value) => {
        const updated = [...formProducts];
        updated[idx] = { ...updated[idx], [field]: value };
        setFormProducts(updated);
    };

    // Save client
    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.nombre.trim()) { addToast('El nombre es obligatorio', 'error'); return; }

        try {
            let clientId;
            if (editingClient) {
                const { error } = await supabase.from('clientes').update(formData).eq('id', editingClient.id);
                if (error) throw error;
                clientId = editingClient.id;
                // Delete old products and re-insert
                await supabase.from('cliente_productos').delete().eq('cliente_id', clientId);
            } else {
                const { data, error } = await supabase.from('clientes').insert([{ ...formData, fecha_alta: new Date().toISOString().split('T')[0] }]).select();
                if (error) throw error;
                clientId = data[0].id;
            }

            // Insert products
            if (formProducts.length > 0) {
                const prodsToInsert = formProducts.filter(p => p.producto_id).map(p => ({
                    cliente_id: clientId, producto_id: p.producto_id,
                    cantidad_kg: parseFloat(p.cantidad_kg) || 1,
                    margen_personalizado: p.margen_personalizado ? parseFloat(p.margen_personalizado) : null,
                    precio_fijo: p.precio_fijo ? parseFloat(p.precio_fijo) : null
                }));
                if (prodsToInsert.length > 0) {
                    const { error } = await supabase.from('cliente_productos').insert(prodsToInsert);
                    if (error) throw error;
                }
            }

            addToast(editingClient ? 'Cliente actualizado' : 'Cliente creado exitosamente', 'success');
            setIsModalOpen(false);
            if (onUpdate) onUpdate();
        } catch (err) {
            addToast('Error: ' + err.message, 'error');
        }
    };

    // Delete client
    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este cliente y sus productos precargados?')) return;
        try {
            const { error } = await supabase.from('clientes').delete().eq('id', id);
            if (error) throw error;
            addToast('Cliente eliminado', 'info');
            if (selectedClient?.id === id) setSelectedClient(null);
            if (onUpdate) onUpdate();
        } catch (err) {
            addToast('Error: ' + err.message, 'error');
        }
    };

    // Open cobrar preview
    const openCobrar = (client) => {
        const items = getClientProducts(client.id).map(cp => ({
            ...cp, cantidad_cobrar: cp.cantidad_kg, incluir: true
        }));
        if (items.length === 0) { addToast('Este cliente no tiene productos precargados', 'error'); return; }
        setCobrarItems(items);
        setSelectedClient(client);
        setIsCobrarModalOpen(true);
    };

    // Execute cobro
    const ejecutarCobro = async () => {
        setCobrarLoading(true);
        const itemsToCharge = cobrarItems.filter(i => i.incluir && i.cantidad_cobrar > 0);
        if (itemsToCharge.length === 0) { addToast('No hay productos seleccionados', 'error'); setCobrarLoading(false); return; }

        try {
            for (const item of itemsToCharge) {
                const cantidad = parseFloat(item.cantidad_cobrar);
                const stockDisp = stock_actual[item.producto_id] || 0;
                if (stockDisp < cantidad) {
                    addToast(`Stock insuficiente de ${item.producto?.nombre}. Disponible: ${stockDisp.toFixed(2)} kg`, 'error');
                    setCobrarLoading(false);
                    return;
                }

                const compras_producto = compras
                    .filter(c => c.producto_id === item.producto_id && c.cantidad_disponible > 0)
                    .sort((a, b) => {
                        const diff = new Date(a.fecha) - new Date(b.fecha);
                        return diff !== 0 ? diff : (a.creado_en || 0) - (b.creado_en || 0);
                    });

                const { lotes_actualizados, costo_total } = ejecutarAlgoritmoVentaFIFO(cantidad, compras_producto);
                const ingreso_total = cantidad * item.precioFinal;
                const ganancia = ingreso_total - costo_total;

                // Update lots
                if (lotes_actualizados.length > 0) {
                    const comprasUpsert = lotes_actualizados.map(la => ({
                        id: la.id, producto_id: la.producto_id, cantidad_kg: la.cantidad_kg,
                        cantidad_disponible: la.cantidad_disponible, costo_unitario: la.costo_unitario,
                        fecha: la.fecha, creado_en: la.creado_en
                    }));
                    const { error } = await supabase.from('compras').upsert(comprasUpsert);
                    if (error) throw error;
                }

                // Register sale
                const registro = {
                    producto_id: item.producto_id,
                    producto_nombre: item.producto?.nombre,
                    fecha: new Date().toISOString().split('T')[0],
                    cantidad_vendida: cantidad,
                    precio_venta_unitario: item.precioFinal,
                    ingreso_total, costo_calculado: costo_total, ganancia,
                    cliente_id: selectedClient.id
                };
                const { error } = await supabase.from('ventas').insert([registro]);
                if (error) throw error;
            }

            const totalCobro = itemsToCharge.reduce((s, i) => s + (parseFloat(i.cantidad_cobrar) * i.precioFinal), 0);
            addToast(`Cobro registrado: ${fmt(totalCobro)} — ${itemsToCharge.length} producto(s)`, 'success');
            setIsCobrarModalOpen(false);
            if (onUpdate) onUpdate();
        } catch (err) {
            addToast('Error en cobro: ' + err.message, 'error');
        } finally {
            setCobrarLoading(false);
        }
    };

    // =============== DETAIL VIEW ===============
    if (selectedClient && !isCobrarModalOpen) {
        const clientProds = getClientProducts(selectedClient.id);
        const clientSales = getClientSales(selectedClient.id);
        const stats = getClientStats(selectedClient.id);
        const catLabel = CATEGORIAS.find(c => c.value === selectedClient.categoria)?.label || selectedClient.categoria;

        return (
            <div className="client-profiles">
                <button className="back-btn" onClick={() => setSelectedClient(null)}>
                    <ArrowLeft size={18} /> Volver a Clientes
                </button>

                <div className="detail-header">
                    <div className="detail-avatar">{selectedClient.nombre?.charAt(0).toUpperCase()}</div>
                    <div className="detail-info">
                        <h2>{selectedClient.nombre}</h2>
                        <span className="cat-tag">{catLabel}</span>
                    </div>
                    <div className="detail-actions">
                        <button className="edit-btn" onClick={() => openEditModal(selectedClient)}><Edit3 size={16} /> Editar</button>
                        <button className="cobrar-btn-lg" onClick={() => openCobrar(selectedClient)}><Zap size={18} /> Cobrar</button>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-row">
                    <div className="stat-card"><ShoppingBag size={20} /><div><span className="stat-value">{stats.totalVentas}</span><span className="stat-label">Compras</span></div></div>
                    <div className="stat-card"><TrendingUp size={20} /><div><span className="stat-value">{fmt(stats.totalComprado)}</span><span className="stat-label">Total Facturado</span></div></div>
                    <div className="stat-card"><Clock size={20} /><div><span className="stat-value">{stats.diasAntiguedad} días</span><span className="stat-label">Antigüedad</span></div></div>
                    <div className="stat-card"><Calendar size={20} /><div><span className="stat-value">{stats.ultimaCompra ? new Date(stats.ultimaCompra).toLocaleDateString('es-AR') : '—'}</span><span className="stat-label">Última Compra</span></div></div>
                </div>

                {/* Client info */}
                <div className="detail-contact glass-card">
                    <h4>Datos de Contacto</h4>
                    <div className="contact-grid">
                        {selectedClient.telefono && <div className="contact-item"><Phone size={16} /> {selectedClient.telefono}</div>}
                        {selectedClient.direccion && <div className="contact-item"><MapPin size={16} /> {selectedClient.direccion}</div>}
                        {selectedClient.notas && <div className="contact-item note"><Tag size={16} /> {selectedClient.notas}</div>}
                    </div>
                </div>

                {/* Preloaded products */}
                <div className="glass-card">
                    <div className="section-header">
                        <h4><Package size={18} /> Productos Precargados</h4>
                        <span className="badge">{clientProds.length} productos</span>
                    </div>
                    {clientProds.length > 0 ? (
                        <div className="products-list">
                            {clientProds.map(cp => (
                                <div key={cp.id} className="product-row">
                                    <div className="pr-info">
                                        <span className="pr-name">{cp.producto?.nombre || 'Producto eliminado'}</span>
                                        <span className="pr-detail">{cp.cantidad_kg} kg · Costo: {fmt(cp.costo)}/kg</span>
                                    </div>
                                    <div className="pr-price">
                                        <span className="pr-price-val">{fmt(cp.precioFinal)}/kg</span>
                                        {cp.margen_personalizado && <span className="pr-margin">+{cp.margen_personalizado}%</span>}
                                        {cp.precio_fijo > 0 && <span className="pr-fixed">Precio fijo</span>}
                                    </div>
                                    <span className="pr-total">{fmt(cp.precioFinal * cp.cantidad_kg)}</span>
                                </div>
                            ))}
                            <div className="products-total">
                                <span>Total estimado por cobro:</span>
                                <strong>{fmt(clientProds.reduce((s, cp) => s + cp.precioFinal * cp.cantidad_kg, 0))}</strong>
                            </div>
                        </div>
                    ) : <p className="empty-msg">No hay productos precargados. Editá el perfil para agregarlos.</p>}
                </div>

                {/* Sales history */}
                <div className="glass-card">
                    <div className="section-header">
                        <h4><ShoppingBag size={18} /> Historial de Compras</h4>
                        <span className="badge">{clientSales.length} registros</span>
                    </div>
                    {clientSales.length > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead><tr><th>Fecha</th><th>Producto</th><th>Cant.</th><th>Precio</th><th>Total</th><th>Ganancia</th></tr></thead>
                                <tbody>
                                    {clientSales.slice(0, 20).map(v => (
                                        <tr key={v.id}>
                                            <td>{new Date(v.fecha).toLocaleDateString('es-AR')}</td>
                                            <td className="fw-600">{v.producto_nombre}</td>
                                            <td>{v.cantidad_vendida} kg</td>
                                            <td>{fmt(v.precio_venta_unitario)}</td>
                                            <td className="fw-700">{fmt(v.ingreso_total)}</td>
                                            <td><span className={`profit-badge ${v.ganancia >= 0 ? 'positive' : 'negative'}`}>{fmt(v.ganancia)}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="empty-msg">Este cliente aún no tiene compras registradas.</p>}
                </div>

                {renderStyles()}
            </div>
        );
    }

    // =============== LIST VIEW ===============
    return (
        <div className="client-profiles">
            <div className="view-header">
                <div className="search-bar glass-card">
                    <Search size={20} className="search-icon" />
                    <input type="text" placeholder="Buscar cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <button className="primary-btn pulse" onClick={openCreateModal}><Plus size={20} /> Nuevo Cliente</button>
            </div>

            {filteredClients.length === 0 ? (
                <div className="empty-state-box glass-card">
                    <Users size={48} />
                    <h3>No hay clientes cargados</h3>
                    <p>Creá el primer perfil de cliente para empezar a usar el cobro automático.</p>
                    <button className="primary-btn" onClick={openCreateModal}><Plus size={18} /> Crear Cliente</button>
                </div>
            ) : (
                <div className="clients-grid">
                    {filteredClients.map(client => {
                        const prods = getClientProducts(client.id);
                        const stats = getClientStats(client.id);
                        const catLabel = CATEGORIAS.find(c => c.value === client.categoria)?.label || client.categoria;
                        return (
                            <div key={client.id} className="client-card glass-card">
                                <div className="cc-top">
                                    <div className="cc-avatar">{client.nombre?.charAt(0).toUpperCase()}</div>
                                    <div className="cc-info">
                                        <h4>{client.nombre}</h4>
                                        <span className="cc-cat">{catLabel}</span>
                                    </div>
                                    <button className="icon-btn delete" onClick={() => handleDelete(client.id)} title="Eliminar"><Trash2 size={16} /></button>
                                </div>
                                <div className="cc-stats">
                                    <div className="cc-stat"><span>{prods.length}</span> productos</div>
                                    <div className="cc-stat"><span>{stats.totalVentas}</span> compras</div>
                                    <div className="cc-stat"><span>{stats.diasAntiguedad}d</span> antigüedad</div>
                                </div>
                                {prods.length > 0 && (
                                    <div className="cc-total">
                                        Cobro estimado: <strong>{fmt(prods.reduce((s, cp) => s + cp.precioFinal * cp.cantidad_kg, 0))}</strong>
                                    </div>
                                )}
                                <div className="cc-actions">
                                    <button className="outline-btn" onClick={() => setSelectedClient(client)}><Eye size={16} /> Ver Perfil</button>
                                    <button className="cobrar-btn" onClick={() => openCobrar(client)} disabled={prods.length === 0}><Zap size={16} /> Cobrar</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CREATE/EDIT MODAL */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}>
                <form onSubmit={handleSave} className="modal-form">
                    <div className="form-group">
                        <label>Nombre del Cliente / Negocio *</label>
                        <input type="text" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} placeholder="Ej: Carnicería Don Pedro" required />
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label>Teléfono</label><input type="text" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} placeholder="11-1234-5678" /></div>
                        <div className="form-group">
                            <label>Categoría</label>
                            <select value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })}>
                                {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group"><label>Dirección</label><input type="text" value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })} placeholder="Dirección de entrega" /></div>
                    <div className="form-group"><label>Notas</label><textarea value={formData.notas} onChange={e => setFormData({ ...formData, notas: e.target.value })} placeholder="Observaciones..." rows={2}></textarea></div>

                    {/* Products section */}
                    <div className="form-section">
                        <div className="form-section-header">
                            <h4><Package size={16} /> Productos Frecuentes</h4>
                            <button type="button" className="add-product-btn" onClick={addProductRow}><Plus size={14} /> Agregar</button>
                        </div>
                        {formProducts.map((fp, idx) => {
                            const costo = costoPromedio[fp.producto_id] || 0;
                            const precioCalc = fp.precio_fijo ? parseFloat(fp.precio_fijo) : (costo > 0 && fp.margen_personalizado ? costo * (1 + parseFloat(fp.margen_personalizado) / 100) : costo);
                            return (
                                <div key={idx} className="fp-row">
                                    <select value={fp.producto_id} onChange={e => updateProductRow(idx, 'producto_id', e.target.value)}>
                                        <option value="">Seleccionar...</option>
                                        {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                    </select>
                                    <input type="number" step="0.1" min="0.1" placeholder="Kg" value={fp.cantidad_kg} onChange={e => updateProductRow(idx, 'cantidad_kg', e.target.value)} className="fp-qty" />
                                    <input type="number" step="0.1" placeholder="Margen %" value={fp.margen_personalizado} onChange={e => updateProductRow(idx, 'margen_personalizado', e.target.value)} className="fp-margin" />
                                    <input type="number" step="0.01" placeholder="Precio fijo $" value={fp.precio_fijo} onChange={e => updateProductRow(idx, 'precio_fijo', e.target.value)} className="fp-price" />
                                    {precioCalc > 0 && <span className="fp-calc">= {fmt(precioCalc)}/kg</span>}
                                    <button type="button" className="fp-del" onClick={() => removeProductRow(idx)}><X size={14} /></button>
                                </div>
                            );
                        })}
                        {formProducts.length === 0 && <p className="empty-products-hint">Sin productos. Agregá productos para habilitar el cobro rápido.</p>}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        <button type="submit" className="primary-btn"><Users size={18} /> {editingClient ? 'Guardar Cambios' : 'Crear Cliente'}</button>
                    </div>
                </form>
            </Modal>

            {/* COBRAR MODAL */}
            <Modal isOpen={isCobrarModalOpen} onClose={() => setIsCobrarModalOpen(false)} title={`⚡ Cobro — ${selectedClient?.nombre}`}>
                <div className="cobrar-content">
                    <p className="cobrar-subtitle">Revisá los productos y cantidades antes de confirmar. Se registrará la venta y se descontará del stock.</p>
                    {cobrarItems.map((item, idx) => (
                        <div key={idx} className={`cobrar-item ${!item.incluir ? 'disabled' : ''}`}>
                            <label className="cobrar-check">
                                <input type="checkbox" checked={item.incluir} onChange={e => { const u = [...cobrarItems]; u[idx].incluir = e.target.checked; setCobrarItems(u); }} />
                            </label>
                            <div className="cobrar-prod">
                                <span className="cobrar-name">{item.producto?.nombre}</span>
                                <span className="cobrar-price">{fmt(item.precioFinal)}/kg</span>
                            </div>
                            <input type="number" step="0.1" min="0.1" className="cobrar-qty" value={item.cantidad_cobrar}
                                onChange={e => { const u = [...cobrarItems]; u[idx].cantidad_cobrar = e.target.value; setCobrarItems(u); }} />
                            <span className="cobrar-subtotal">{fmt(item.precioFinal * (parseFloat(item.cantidad_cobrar) || 0))}</span>
                        </div>
                    ))}
                    <div className="cobrar-total">
                        <span>TOTAL A COBRAR</span>
                        <strong>{fmt(cobrarItems.filter(i => i.incluir).reduce((s, i) => s + i.precioFinal * (parseFloat(i.cantidad_cobrar) || 0), 0))}</strong>
                    </div>
                    <div className="modal-actions">
                        <button className="secondary-btn" onClick={() => setIsCobrarModalOpen(false)}>Cancelar</button>
                        <button className="primary-btn cobrar-confirm" onClick={ejecutarCobro} disabled={cobrarLoading}>
                            <Zap size={18} /> {cobrarLoading ? 'Procesando...' : 'Confirmar Cobro'}
                        </button>
                    </div>
                </div>
            </Modal>

            {renderStyles()}
        </div >
    );
};

function renderStyles() {
    return (
        <style>{`
      .client-profiles { animation: fadeIn 0.3s ease; }
      .view-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; gap:1rem; flex-wrap:wrap; }
      .search-bar { flex:1; min-width:250px; display:flex; align-items:center; padding:0.75rem 1rem; gap:0.75rem; }
      .search-bar input { border:none; background:transparent; width:100%; outline:none; font-size:0.95rem; color:var(--text); }
      .search-icon { color:var(--text-muted); }
      .primary-btn { background:var(--primary); color:white; border:none; padding:0.75rem 1.5rem; border-radius:10px; font-weight:600; display:flex; align-items:center; gap:0.5rem; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 6px -1px rgba(249,115,22,0.3); }
      .primary-btn:hover { background:var(--primary-hover); transform:translateY(-2px); }
      .primary-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
      .pulse { animation: pulse-shadow 2s infinite; }
      @keyframes pulse-shadow { 0%{box-shadow:0 0 0 0 rgba(249,115,22,0.4)} 70%{box-shadow:0 0 0 10px rgba(249,115,22,0)} 100%{box-shadow:0 0 0 0 rgba(249,115,22,0)} }
      .secondary-btn { background:#f1f5f9; color:var(--text); border:1px solid var(--border); padding:0.75rem 1.5rem; border-radius:8px; font-weight:600; cursor:pointer; transition:all 0.2s; }
      .secondary-btn:hover { background:#e2e8f0; }

      /* Clients Grid */
      .clients-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:1.5rem; }
      .client-card { display:flex; flex-direction:column; gap:1rem; transition:transform 0.2s, box-shadow 0.2s; }
      .client-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-lg); }
      .cc-top { display:flex; align-items:center; gap:0.75rem; }
      .cc-avatar { width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg,var(--primary),var(--accent)); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1.2rem; flex-shrink:0; }
      .cc-info { flex:1; }
      .cc-info h4 { margin:0; font-size:1.05rem; color:var(--text); }
      .cc-cat { font-size:0.75rem; color:var(--text-muted); }
      .cc-stats { display:flex; gap:1rem; padding:0.75rem; background:#f8fafc; border-radius:8px; }
      .cc-stat { font-size:0.8rem; color:var(--text-muted); }
      .cc-stat span { font-weight:700; color:var(--text); margin-right:3px; }
      .cc-total { font-size:0.85rem; color:var(--text-muted); padding:0.5rem 0.75rem; background:rgba(249,115,22,0.05); border-radius:8px; border-left:3px solid var(--primary); }
      .cc-total strong { color:var(--primary); }
      .cc-actions { display:flex; gap:0.75rem; }
      .outline-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:0.4rem; padding:0.6rem; border-radius:8px; border:1px solid var(--border); background:white; color:var(--text); font-weight:600; font-size:0.85rem; cursor:pointer; transition:all 0.2s; }
      .outline-btn:hover { border-color:var(--primary); color:var(--primary); }
      .cobrar-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:0.4rem; padding:0.6rem; border-radius:8px; border:none; background:linear-gradient(135deg,#10b981,#059669); color:white; font-weight:600; font-size:0.85rem; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(16,185,129,0.3); }
      .cobrar-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 4px 12px rgba(16,185,129,0.4); }
      .cobrar-btn:disabled { opacity:0.5; cursor:not-allowed; }
      .icon-btn.delete { background:transparent; border:none; color:var(--text-muted); cursor:pointer; padding:0.4rem; border-radius:6px; transition:all 0.2s; }
      .icon-btn.delete:hover { background:rgba(239,68,68,0.1); color:var(--error); }

      /* Empty state */
      .empty-state-box { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:4rem 2rem; text-align:center; color:var(--text-muted); gap:1rem; }
      .empty-state-box h3 { color:var(--text); }

      /* Detail View */
      .back-btn { display:flex; align-items:center; gap:0.5rem; background:none; border:none; color:var(--text-muted); font-weight:600; cursor:pointer; margin-bottom:1.5rem; padding:0.5rem 0; transition:color 0.2s; }
      .back-btn:hover { color:var(--primary); }
      .detail-header { display:flex; align-items:center; gap:1rem; margin-bottom:2rem; flex-wrap:wrap; }
      .detail-avatar { width:60px; height:60px; border-radius:50%; background:linear-gradient(135deg,var(--primary),var(--accent)); color:white; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.5rem; }
      .detail-info { flex:1; }
      .detail-info h2 { margin:0; color:var(--text); }
      .cat-tag { font-size:0.8rem; color:var(--text-muted); background:#f1f5f9; padding:0.2rem 0.6rem; border-radius:12px; }
      .detail-actions { display:flex; gap:0.75rem; }
      .edit-btn { display:flex; align-items:center; gap:0.4rem; padding:0.6rem 1rem; border-radius:8px; border:1px solid var(--border); background:white; color:var(--text); font-weight:600; font-size:0.85rem; cursor:pointer; transition:all 0.2s; }
      .edit-btn:hover { border-color:var(--primary); color:var(--primary); }
      .cobrar-btn-lg { display:flex; align-items:center; gap:0.4rem; padding:0.6rem 1.25rem; border-radius:8px; border:none; background:linear-gradient(135deg,#10b981,#059669); color:white; font-weight:600; font-size:0.9rem; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(16,185,129,0.3); }
      .cobrar-btn-lg:hover { transform:translateY(-1px); }

      /* Stats */
      .stats-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1rem; margin-bottom:1.5rem; }
      .stat-card { display:flex; align-items:center; gap:0.75rem; padding:1rem 1.25rem; background:var(--glass); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.3); border-radius:var(--radius); box-shadow:var(--shadow); color:var(--primary); }
      .stat-card div { display:flex; flex-direction:column; }
      .stat-value { font-weight:700; font-size:1rem; color:var(--text); }
      .stat-label { font-size:0.75rem; color:var(--text-muted); }

      /* Detail sections */
      .section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
      .section-header h4 { display:flex; align-items:center; gap:0.5rem; margin:0; color:var(--text); }
      .badge { background:#f1f5f9; color:var(--text-muted); padding:0.25rem 0.75rem; border-radius:20px; font-size:0.8rem; font-weight:600; }
      .detail-contact { margin-bottom:1.5rem; }
      .detail-contact h4 { margin:0 0 0.75rem 0; font-size:1rem; }
      .contact-grid { display:flex; flex-direction:column; gap:0.5rem; }
      .contact-item { display:flex; align-items:center; gap:0.5rem; font-size:0.9rem; color:var(--text-muted); }
      .contact-item.note { color:var(--text); font-style:italic; }
      .glass-card { margin-bottom:1.5rem; }

      /* Products list */
      .products-list { display:flex; flex-direction:column; gap:0.5rem; }
      .product-row { display:flex; align-items:center; gap:1rem; padding:0.75rem; background:#f8fafc; border-radius:8px; border:1px solid #f1f5f9; }
      .pr-info { flex:1; display:flex; flex-direction:column; }
      .pr-name { font-weight:600; color:var(--text); font-size:0.9rem; }
      .pr-detail { font-size:0.75rem; color:var(--text-muted); }
      .pr-price { display:flex; flex-direction:column; align-items:flex-end; }
      .pr-price-val { font-weight:700; color:var(--text); font-size:0.9rem; }
      .pr-margin { font-size:0.7rem; color:var(--secondary); font-weight:600; }
      .pr-fixed { font-size:0.7rem; color:var(--primary); font-weight:600; }
      .pr-total { font-weight:700; color:var(--primary); font-size:0.95rem; min-width:80px; text-align:right; }
      .products-total { display:flex; justify-content:space-between; padding:0.75rem; border-top:2px solid var(--primary); margin-top:0.5rem; font-size:0.95rem; }
      .products-total strong { color:var(--primary); font-size:1.1rem; }
      .empty-msg { color:var(--text-muted); font-size:0.9rem; font-style:italic; padding:1rem 0; }

      /* Table styles */
      .fw-600 { font-weight:600; }
      .fw-700 { font-weight:700; }
      .profit-badge { padding:0.25rem 0.5rem; border-radius:6px; font-weight:600; font-size:0.85rem; }
      .profit-badge.positive { background:rgba(16,185,129,0.1); color:var(--secondary); }
      .profit-badge.negative { background:rgba(239,68,68,0.1); color:var(--error); }

      /* Form styles */
      .modal-form { display:flex; flex-direction:column; gap:1.25rem; }
      .form-group { display:flex; flex-direction:column; gap:0.4rem; }
      .form-group label { font-size:0.85rem; font-weight:500; color:var(--text); }
      .form-group input, .form-group select, .form-group textarea { width:100%; padding:0.65rem 0.75rem; border:1px solid var(--border); border-radius:8px; font-size:0.9rem; background:#f8fafc; transition:border-color 0.2s; box-sizing:border-box; }
      .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline:none; border-color:var(--primary); background:white; }
      .form-group textarea { resize:vertical; font-family:inherit; }
      .form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
      .modal-actions { display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; }

      /* Products form section */
      .form-section { border:1px solid var(--border); border-radius:10px; padding:1rem; background:#fafbfc; }
      .form-section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; }
      .form-section-header h4 { margin:0; font-size:0.95rem; display:flex; align-items:center; gap:0.4rem; color:var(--text); }
      .add-product-btn { display:flex; align-items:center; gap:0.3rem; background:rgba(249,115,22,0.1); color:var(--primary); border:none; padding:0.4rem 0.75rem; border-radius:6px; font-weight:600; font-size:0.8rem; cursor:pointer; transition:all 0.2s; }
      .add-product-btn:hover { background:rgba(249,115,22,0.2); }
      .fp-row { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem; flex-wrap:wrap; }
      .fp-row select { flex:2; min-width:120px; padding:0.5rem; border:1px solid var(--border); border-radius:6px; font-size:0.85rem; background:white; }
      .fp-qty { width:60px!important; min-width:60px; }
      .fp-margin { width:80px!important; min-width:80px; }
      .fp-price { width:90px!important; min-width:90px; }
      .fp-row input { padding:0.5rem!important; font-size:0.85rem!important; border-radius:6px!important; }
      .fp-calc { font-size:0.75rem; font-weight:600; color:var(--secondary); white-space:nowrap; }
      .fp-del { background:none; border:none; color:var(--text-muted); cursor:pointer; padding:0.25rem; border-radius:4px; display:flex; }
      .fp-del:hover { color:var(--error); background:rgba(239,68,68,0.1); }
      .empty-products-hint { color:var(--text-muted); font-size:0.8rem; font-style:italic; text-align:center; padding:0.5rem; }

      /* Cobrar modal */
      .cobrar-content { display:flex; flex-direction:column; gap:1rem; }
      .cobrar-subtitle { font-size:0.85rem; color:var(--text-muted); margin:0; }
      .cobrar-item { display:flex; align-items:center; gap:0.75rem; padding:0.75rem; background:#f8fafc; border-radius:8px; border:1px solid #f1f5f9; transition:opacity 0.2s; }
      .cobrar-item.disabled { opacity:0.4; }
      .cobrar-check input { width:18px; height:18px; cursor:pointer; accent-color:var(--primary); }
      .cobrar-prod { flex:1; display:flex; flex-direction:column; }
      .cobrar-name { font-weight:600; font-size:0.9rem; color:var(--text); }
      .cobrar-price { font-size:0.75rem; color:var(--text-muted); }
      .cobrar-qty { width:70px; padding:0.5rem; border:1px solid var(--border); border-radius:6px; font-size:0.9rem; text-align:center; }
      .cobrar-subtotal { font-weight:700; color:var(--primary); min-width:80px; text-align:right; }
      .cobrar-total { display:flex; justify-content:space-between; align-items:center; padding:1rem; background:linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.08)); border-radius:10px; border:1px solid rgba(16,185,129,0.2); }
      .cobrar-total span { font-weight:600; color:var(--text); }
      .cobrar-total strong { font-size:1.25rem; color:#059669; }
      .cobrar-confirm { background:linear-gradient(135deg,#10b981,#059669)!important; box-shadow:0 4px 12px rgba(16,185,129,0.3)!important; }

      @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      @media (max-width:640px) {
        .clients-grid { grid-template-columns:1fr; }
        .form-row { grid-template-columns:1fr; }
        .stats-row { grid-template-columns:1fr 1fr; }
        .detail-header { flex-direction:column; align-items:flex-start; }
        .detail-actions { width:100%; }
        .fp-row { flex-direction:column; align-items:stretch; }
        .fp-row select, .fp-qty, .fp-margin, .fp-price { width:100%!important; min-width:unset; }
        .product-row { flex-direction:column; align-items:flex-start; }
        .cobrar-item { flex-wrap:wrap; }
      }
    `}</style>
    );
}

export default ClientProfiles;
