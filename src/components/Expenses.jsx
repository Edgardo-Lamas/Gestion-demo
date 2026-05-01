import React, { useState } from 'react';
import { Receipt, Plus, Trash2, Search, Calendar, DollarSign } from 'lucide-react';
import Modal from './ui/Modal';
import { useToast } from '../context/ToastContext';

import { supabase } from '../lib/supabase';

const Expenses = ({ gastos, onUpdate }) => {
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [gasto, setGasto] = useState({
        concepto: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0]
    });

    const addGasto = async (e) => {
        e.preventDefault();
        if (!gasto.concepto || !gasto.monto) {
            addToast('Por favor completa todos los campos', 'error');
            return;
        }

        const nuevoGasto = {
            concepto: gasto.concepto,
            monto: parseFloat(gasto.monto),
            fecha: gasto.fecha,
            categoria: 'General' // Valor por defecto si no lo tiene en este componente
        };

        const { error } = await supabase.from('gastos').insert([nuevoGasto]);

        if (error) {
            addToast('Error registrando gasto: ' + error.message, 'error');
            return;
        }

        setGasto({
            concepto: '',
            monto: '',
            fecha: new Date().toISOString().split('T')[0]
        });
        setIsModalOpen(false);
        addToast('Gasto registrado exitosamente', 'success');
        if (onUpdate) onUpdate();
    };

    const deleteGasto = async (id) => {
        if (window.confirm('¿Eliminar este gasto?')) {
            const { error } = await supabase.from('gastos').delete().eq('id', id);
            if (error) {
                addToast('Error eliminando', 'error');
            } else {
                addToast('Gasto eliminado', 'info');
                if (onUpdate) onUpdate();
            }
        }
    };

    // Filter and Pagination
    const filteredGastos = gastos.filter(g => {
        const matchSearch = !searchTerm ||
            g.concepto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.fecha.includes(searchTerm);
        let matchDate = true;
        if (dateFilter !== 'all') {
            const now = new Date();
            const gDate = new Date(g.fecha + 'T00:00:00');
            if (dateFilter === 'week') {
                const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
                matchDate = gDate >= weekAgo;
            } else if (dateFilter === 'month') {
                matchDate = gDate.getMonth() === now.getMonth() && gDate.getFullYear() === now.getFullYear();
            }
        }
        return matchSearch && matchDate;
    });

    const totalPages = Math.ceil(filteredGastos.length / itemsPerPage);
    const paginatedGastos = filteredGastos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="expenses-view">
            <div className="view-header">
                <div className="search-bar glass-card">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar gasto por concepto o fecha..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="primary-btn pulse" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> Nuevo Gasto
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
            </div>

            <section className="glass-card table-section">
                <div className="table-header-row">
                    <h3>Historial de Gastos</h3>
                    <span className="badge">{filteredGastos.length} registros</span>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Concepto</th>
                                <th>Monto</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedGastos.length > 0 ? (
                                paginatedGastos.map(g => (
                                    <tr key={g.id}>
                                        <td>
                                            <div className="date-badge">
                                                <Calendar size={14} />
                                                {new Date(g.fecha + 'T00:00:00').toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="fw-600">{g.concepto}</td>
                                        <td className="fw-700 text-error">-${g.monto.toFixed(2)}</td>
                                        <td>
                                            <button
                                                className="icon-btn delete"
                                                onClick={() => deleteGasto(g.id)}
                                                title="Eliminar gasto"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="empty-state">No se encontraron gastos</td>
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Registrar Nuevo Gasto"
            >
                <form onSubmit={addGasto} className="modal-form">
                    <div className="form-group">
                        <label>Concepto</label>
                        <div className="input-wrapper">
                            <Receipt size={18} className="input-icon" />
                            <input
                                type="text"
                                placeholder="Ej: Alquiler, Luz, Empaques"
                                value={gasto.concepto}
                                onChange={(e) => setGasto({ ...gasto, concepto: e.target.value })}
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Fecha</label>
                            <input
                                type="date"
                                value={gasto.fecha}
                                onChange={(e) => setGasto({ ...gasto, fecha: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Monto ($)</label>
                            <div className="input-wrapper">
                                <span className="currency-symbol">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={gasto.monto}
                                    onChange={(e) => setGasto({ ...gasto, monto: e.target.value })}
                                    required
                                    className="no-icon-padding" // Custom class to override padding if needed
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="primary-btn">
                            <Plus size={18} /> Registrar Gasto
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

                .filter-row { display:flex; align-items:center; gap:1rem; margin-bottom:1rem; flex-wrap:wrap; }
                .date-pills { display:flex; gap:0.4rem; }
                .filter-pill { padding:0.4rem 0.9rem; border-radius:20px; border:1px solid var(--border); background:white; color:var(--text-muted); font-size:0.82rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
                .filter-pill.active { background:var(--primary); color:white; border-color:var(--primary); }
                .filter-pill:hover:not(.active) { border-color:var(--primary); color:var(--primary); }

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
                    0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
                }

                .table-section {
                    padding: 0;
                    overflow-x: auto;
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
                .text-error { color: var(--error); }

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

                /* Override padding for inputs inside wrapper */
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
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Expenses;
