import React, { useState } from 'react';
import { ShoppingCart, Trash2, Package, Calendar, Search } from 'lucide-react';
import Modal from './ui/Modal';
import { useToast } from '../context/ToastContext';

import { supabase } from '../lib/supabase';

const Purchases = ({ productos, compras, onUpdate }) => {
    const { addToast } = useToast();
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [compra, setCompra] = useState({
        producto_id: '',
        cantidad_kg: '',
        costo_unitario: '',
        fecha: new Date().toISOString().split('T')[0]
    });

    const addCompra = async (e) => {
        e.preventDefault();
        if (!compra.producto_id || !compra.cantidad_kg || !compra.costo_unitario) {
            addToast('Por favor completa todos los campos', 'error');
            return;
        }

        const nuevaCompra = {
            producto_id: compra.producto_id,
            cantidad_kg: parseFloat(compra.cantidad_kg),
            cantidad_disponible: parseFloat(compra.cantidad_kg),
            costo_unitario: parseFloat(compra.costo_unitario),
            fecha: compra.fecha || new Date().toISOString().split('T')[0],
            creado_en: Date.now()
        };

        const { error } = await supabase.from('compras').insert([nuevaCompra]);

        if (error) {
            addToast('Error registrando compra: ' + error.message, 'error');
            return;
        }

        setCompra({
            producto_id: '',
            cantidad_kg: '',
            costo_unitario: '',
            fecha: new Date().toISOString().split('T')[0]
        });
        setIsPurchaseModalOpen(false);
        addToast('Compra registrada exitosamente', 'success');
        if (onUpdate) onUpdate();
    };

    const deleteCompra = async (id) => {
        if (window.confirm('¿Seguro que deseas eliminar esta compra?')) {
            const { error } = await supabase.from('compras').delete().eq('id', id);
            if (error) {
                addToast('Error eliminando compra', 'error');
            } else {
                addToast('Compra eliminada', 'info');
                if (onUpdate) onUpdate();
            }
        }
    };

    // Filter, sort (newest first) and Pagination
    const filteredCompras = compras
        .filter(c => {
            const prodName = productos.find(p => p.id === c.producto_id)?.nombre || '';
            const matchSearch = prodName.toLowerCase().includes(searchTerm.toLowerCase()) || c.fecha.includes(searchTerm);
            let matchDate = true;
            if (dateFilter !== 'all') {
                const now = new Date();
                const cDate = new Date(c.fecha + 'T00:00:00');
                if (dateFilter === 'week') {
                    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
                    matchDate = cDate >= weekAgo;
                } else if (dateFilter === 'month') {
                    matchDate = cDate.getMonth() === now.getMonth() && cDate.getFullYear() === now.getFullYear();
                }
            }
            return matchSearch && matchDate;
        })
        .sort((a, b) => {
            const d = new Date(b.fecha + 'T00:00:00') - new Date(a.fecha + 'T00:00:00');
            return d !== 0 ? d : (b.creado_en || 0) - (a.creado_en || 0);
        });

    const totalPages = Math.ceil(filteredCompras.length / itemsPerPage);
    const paginatedCompras = filteredCompras.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="purchases-view">
            <div className="view-header">
                <div className="search-bar glass-card">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar compra por producto o fecha..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="actions">
                    <button className="primary-btn pulse" onClick={() => setIsPurchaseModalOpen(true)}>
                        <ShoppingCart size={20} /> Nueva Compra
                    </button>
                </div>
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
            </div>

            <section className="glass-card table-section">
                <div className="table-header-row">
                    <h3>Historial de Compras</h3>
                    <span className="badge">{filteredCompras.length} registros</span>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Producto</th>
                                <th>Cantidad (kg)</th>
                                <th>Costo (kg)</th>
                                <th>Total</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedCompras.length > 0 ? (
                                paginatedCompras.map(c => (
                                    <tr key={c.id}>
                                        <td>
                                            <div className="date-badge">
                                                <Calendar size={14} />
                                                {new Date(c.fecha + 'T00:00:00').toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="fw-600">
                                            {productos.find(p => p.id === c.producto_id)?.nombre || <span className="text-muted">Desconocido</span>}
                                        </td>
                                        <td>{c.cantidad_kg} kg</td>
                                        <td>${c.costo_unitario.toFixed(2)}</td>
                                        <td className="fw-700">${(c.cantidad_kg * c.costo_unitario).toFixed(2)}</td>
                                        <td>
                                            <button
                                                className="icon-btn delete"
                                                onClick={() => deleteCompra(c.id)}
                                                title="Eliminar compra"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="empty-state">No se encontraron compras</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                            Anterior
                        </button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                            Siguiente
                        </button>
                    </div>
                )}
            </section>

            {/* Modal de Nueva Compra */}
            <Modal
                isOpen={isPurchaseModalOpen}
                onClose={() => setIsPurchaseModalOpen(false)}
                title="Registrar Compra"
            >
                <form onSubmit={addCompra} className="modal-form">
                    <div className="form-group">
                        <label>Producto</label>
                        <div className="select-wrapper">
                            <Package size={18} className="input-icon" />
                            <select
                                value={compra.producto_id}
                                onChange={(e) => setCompra({ ...compra, producto_id: e.target.value })}
                                required
                            >
                                <option value="">Seleccionar...</option>
                                {productos.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Fecha</label>
                            <input
                                type="date"
                                value={compra.fecha}
                                onChange={(e) => setCompra({ ...compra, fecha: e.target.value })}
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
                                value={compra.cantidad_kg}
                                onChange={(e) => setCompra({ ...compra, cantidad_kg: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Costo por kg ($)</label>
                        <div className="input-wrapper">
                            <span className="currency-symbol">$</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                value={compra.costo_unitario}
                                onChange={(e) => setCompra({ ...compra, costo_unitario: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="secondary-btn" onClick={() => setIsPurchaseModalOpen(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="primary-btn">
                            <ShoppingCart size={18} /> Registrar Compra
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

                .actions {
                    display: flex;
                    gap: 1rem;
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
                    box-shadow: 0 4px 6px -1px rgba(59, 122, 87, 0.3);
                }

                .primary-btn:hover {
                    background: var(--primary-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(59, 122, 87, 0.4);
                }

                .secondary-btn {
                    background: white;
                    color: var(--text);
                    border: 1px solid var(--border);
                    padding: 0.75rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .secondary-btn:hover {
                    background: #f8fafc;
                    border-color: var(--primary);
                    color: var(--primary);
                }

                .pulse {
                    animation: pulse-shadow 2s infinite;
                }

                @keyframes pulse-shadow {
                    0% { box-shadow: 0 0 0 0 rgba(59, 122, 87, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(59, 122, 87, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(59, 122, 87, 0); }
                }

                .filter-row { display:flex; align-items:center; gap:1rem; margin-bottom:1rem; flex-wrap:wrap; }
                .date-pills { display:flex; gap:0.4rem; }
                .filter-pill { padding:0.4rem 0.9rem; border-radius:20px; border:1px solid var(--border); background:white; color:var(--text-muted); font-size:0.82rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
                .filter-pill.active { background:var(--primary); color:white; border-color:var(--primary); }
                .filter-pill:hover:not(.active) { border-color:var(--primary); color:var(--primary); }

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
                .text-muted { color: var(--text-muted); font-style: italic; }

                .icon-btn.delete {
                    color: var(--text-muted);
                    padding: 0.4rem;
                    border-radius: 6px;
                    transition: all 0.2s;
                    background: transparent;
                    border: none;
                    cursor: pointer;
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

                @media (max-width: 640px) {
                    .view-header {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .actions {
                        flex-direction: column;
                    }
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Purchases;
