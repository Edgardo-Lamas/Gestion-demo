import React, { useState, useMemo } from 'react';
import { Scale, Trash2, Plus, Calculator, Truck, DollarSign, TrendingUp, Users, ArrowDownToLine } from 'lucide-react';
import { calculateMeatSaleDistribution } from '../utils/meatDistribution';
import Modal from './ui/Modal';
import { useToast } from '../context/ToastContext';

import { supabase } from '../lib/supabase';

function MeatDistribution({ distribuciones, productos = [], costoPromedio = {}, ventas = [], onUpdate }) {
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [form, setForm] = useState({
    producto: '',
    base_price: '',
    shipping_cost: '',
    sale_price: '',
    partner_share_percentage: '50',
    cantidad: '1',
  });

  const [resultado, setResultado] = useState(null);

  // Precio base derivado del costo promedio del producto seleccionado
  // Si el usuario lo editó manualmente se usa ese valor, sino el calculado
  const computedBasePrice = useMemo(() => {
    if (!form.producto) return '';
    const prod = productos.find(p => p.nombre === form.producto);
    if (!prod) return '';
    const costo = costoPromedio[prod.id];
    return costo > 0 ? costo.toFixed(2) : '';
  }, [form.producto, costoPromedio, productos]);

  const effectiveBasePrice = form.base_price !== '' ? form.base_price : computedBasePrice;

  const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'producto') {
      const prod = productos.find(p => p.nombre === value);
      let base_price = form.base_price;
      let sale_price = form.sale_price;

      if (prod) {
        const costo = costoPromedio[prod.id];
        if (costo) base_price = costo.toFixed(2);

        const ventasProducto = ventas.filter(v => v.producto_id === prod.id);
        if (ventasProducto.length > 0) {
          const ultima = ventasProducto[ventasProducto.length - 1];
          sale_price = ultima.precio_venta_unitario || sale_price;
        }
      }

      setForm({ ...form, producto: value, base_price, sale_price });
    } else {
      setForm({ ...form, [name]: value });
    }
    setResultado(null);
  };

  const handleCalcular = (e) => {
    e.preventDefault();
    const base_price = parseFloat(effectiveBasePrice);
    const shipping_cost = parseFloat(form.shipping_cost);
    const sale_price = parseFloat(form.sale_price);
    const partner_share_percentage = parseFloat(form.partner_share_percentage);
    const cantidad = parseFloat(form.cantidad) || 1;

    if ([base_price, shipping_cost, sale_price, partner_share_percentage].some(isNaN)) {
      addToast('Completá todos los campos numéricos', 'error');
      return;
    }
    if (sale_price <= base_price + shipping_cost) {
      addToast('El precio de venta debe ser mayor al costo total', 'error');
      return;
    }
    if (partner_share_percentage < 0 || partner_share_percentage > 100) {
      addToast('El porcentaje debe estar entre 0 y 100', 'error');
      return;
    }

    const dist = calculateMeatSaleDistribution({ base_price, shipping_cost, sale_price, partner_share_percentage });
    setResultado({ ...dist, cantidad, producto: form.producto || 'Sin nombre' });
  };

  const handleRegistrar = async () => {
    if (!resultado) return;
    const cantidad = resultado.cantidad;
    const nuevaDistribucion = {
      fecha: new Date().toISOString().split('T')[0],
      producto_id: productos.find(p => p.nombre === resultado.producto)?.id || null,
      cantidad_kg: cantidad,
      precio_base: parseFloat(effectiveBasePrice),
      shipping_cost: parseFloat(form.shipping_cost),
      precio_venta: resultado.sale_price,
      partner_share_percentage: parseFloat(form.partner_share_percentage),
      total_cost: resultado.total_cost,
      total_profit: resultado.total_profit,
      partner_profit: resultado.partner_profit,
      supplier_profit: resultado.supplier_profit,
      supplier_total_return: resultado.supplier_total_return,
      // Totales calculados (podríamos quitarlos si no están en DB, pero los enviamos por ahora)
      total_sale: resultado.sale_price * cantidad,
      total_partner_profit: resultado.partner_profit * cantidad,
      total_supplier_profit: resultado.supplier_profit * cantidad,
      total_supplier_return: resultado.supplier_total_return * cantidad,
    };

    const { error } = await supabase.from('distribuciones').insert([nuevaDistribucion]);

    if (error) {
      addToast('Error registrando: ' + error.message, 'error');
      return;
    }

    addToast('Distribución registrada correctamente', 'success');
    setForm({ producto: '', base_price: '', shipping_cost: '', sale_price: '', partner_share_percentage: '50', cantidad: '1' });
    setResultado(null);
    setShowModal(false);
    if (onUpdate) onUpdate();
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('distribuciones').delete().eq('id', id);
    if (error) {
      addToast('Error al eliminar', 'error');
    } else {
      addToast('Registro eliminado', 'success');
      if (onUpdate) onUpdate();
    }
  };

  // Totales del historial
  const totales = distribuciones.reduce(
    (acc, d) => ({
      ventas: acc.ventas + (d.total_sale || d.sale_price * (d.cantidad || 1)),
      ganancia_sabry: acc.ganancia_sabry + (d.total_partner_profit || d.partner_profit * (d.cantidad || 1)),
      ganancia_proveedor: acc.ganancia_proveedor + (d.total_supplier_profit || d.supplier_profit * (d.cantidad || 1)),
      retorno_proveedor: acc.retorno_proveedor + (d.total_supplier_return || d.supplier_total_return * (d.cantidad || 1)),
    }),
    { ventas: 0, ganancia_sabry: 0, ganancia_proveedor: 0, retorno_proveedor: 0 }
  );

  return (
    <div className="meat-dist-container">
      {/* Tarjetas resumen */}
      <div className="dist-summary-grid">
        <div className="dist-summary-card" style={{ borderBottom: '3px solid #3b82f6' }}>
          <div className="dist-summary-header">
            <span>Total Ventas</span>
            <div className="dist-icon-badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}><DollarSign size={18} /></div>
          </div>
          <p className="dist-summary-value">{fmt(totales.ventas)}</p>
          <span className="dist-summary-sub">{distribuciones.length} distribuciones</span>
        </div>
        <div className="dist-summary-card" style={{ borderBottom: '3px solid #f97316' }}>
          <div className="dist-summary-header">
            <span>Ganancia Sabry</span>
            <div className="dist-icon-badge" style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}><TrendingUp size={18} /></div>
          </div>
          <p className="dist-summary-value">{fmt(totales.ganancia_sabry)}</p>
          <span className="dist-summary-sub">Acumulado socio</span>
        </div>
        <div className="dist-summary-card" style={{ borderBottom: '3px solid #10b981' }}>
          <div className="dist-summary-header">
            <span>Ganancia Proveedor</span>
            <div className="dist-icon-badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><Users size={18} /></div>
          </div>
          <p className="dist-summary-value">{fmt(totales.ganancia_proveedor)}</p>
          <span className="dist-summary-sub">Acumulado proveedor</span>
        </div>
        <div className="dist-summary-card" style={{ borderBottom: '3px solid #8b5cf6' }}>
          <div className="dist-summary-header">
            <span>Retorno Proveedor</span>
            <div className="dist-icon-badge" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}><ArrowDownToLine size={18} /></div>
          </div>
          <p className="dist-summary-value">{fmt(totales.retorno_proveedor)}</p>
          <span className="dist-summary-sub">Costo + ganancia</span>
        </div>
      </div>

      {/* Botón nueva distribución */}
      <button className="btn-primary" onClick={() => setShowModal(true)} style={{ marginBottom: '1.5rem' }}>
        <Plus size={18} /> Nueva Distribución
      </button>

      {/* Modal de cálculo */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setResultado(null); }} title="Calcular Distribución">
        <form onSubmit={handleCalcular} className="dist-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label>Producto</label>
              <select name="producto" value={form.producto} onChange={handleChange}>
                <option value="">Seleccionar producto...</option>
                {productos.map(p => (
                  <option key={p.id} value={p.nombre}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Cantidad (kg)</label>
              <input name="cantidad" type="number" min="1" step="0.1" placeholder="1" value={form.cantidad} onChange={handleChange} />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Precio base ($/kg)</label>
              <input name="base_price" type="number" min="0" step="0.01" placeholder="4100" value={effectiveBasePrice} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Costo de flete ($/kg)</label>
              <input name="shipping_cost" type="number" min="0" step="0.01" placeholder="200" value={form.shipping_cost} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Precio de venta ($/kg)</label>
              <input name="sale_price" type="number" min="0" step="0.01" placeholder="7500" value={form.sale_price} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>% Ganancia Sabry</label>
              <input name="partner_share_percentage" type="number" min="0" max="100" step="1" value={form.partner_share_percentage} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            <Calculator size={18} /> Calcular
          </button>
        </form>

        {resultado && (
          <div className="dist-result-section">
            <h3 style={{ margin: '1.5rem 0 1rem', fontWeight: 600 }}>Resultado por kg</h3>
            <div className="dist-result-grid">
              <div className="dist-result-chip" style={{ '--chip-color': '#64748b' }}>
                <span className="chip-label">Costo Total</span>
                <span className="chip-value">{fmt(resultado.total_cost)}</span>
              </div>
              <div className="dist-result-chip" style={{ '--chip-color': '#3b82f6' }}>
                <span className="chip-label">Precio Venta</span>
                <span className="chip-value">{fmt(resultado.sale_price)}</span>
              </div>
              <div className="dist-result-chip" style={{ '--chip-color': '#10b981' }}>
                <span className="chip-label">Ganancia Total</span>
                <span className="chip-value">{fmt(resultado.total_profit)}</span>
              </div>
              <div className="dist-result-chip" style={{ '--chip-color': '#f97316' }}>
                <span className="chip-label">Ganancia Sabry</span>
                <span className="chip-value">{fmt(resultado.partner_profit)}</span>
              </div>
              <div className="dist-result-chip" style={{ '--chip-color': '#8b5cf6' }}>
                <span className="chip-label">Ganancia Proveedor</span>
                <span className="chip-value">{fmt(resultado.supplier_profit)}</span>
              </div>
              <div className="dist-result-chip highlight" style={{ '--chip-color': '#ec4899' }}>
                <span className="chip-label">Retorno Proveedor</span>
                <span className="chip-value">{fmt(resultado.supplier_total_return)}</span>
              </div>
            </div>

            {resultado.cantidad > 1 && (
              <>
                <h4 style={{ margin: '1rem 0 0.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  Total por {resultado.cantidad} kg
                </h4>
                <div className="dist-result-grid">
                  <div className="dist-result-chip" style={{ '--chip-color': '#3b82f6' }}>
                    <span className="chip-label">Venta Total</span>
                    <span className="chip-value">{fmt(resultado.sale_price * resultado.cantidad)}</span>
                  </div>
                  <div className="dist-result-chip" style={{ '--chip-color': '#f97316' }}>
                    <span className="chip-label">Sabry Total</span>
                    <span className="chip-value">{fmt(resultado.partner_profit * resultado.cantidad)}</span>
                  </div>
                  <div className="dist-result-chip" style={{ '--chip-color': '#ec4899' }}>
                    <span className="chip-label">Retorno Prov. Total</span>
                    <span className="chip-value">{fmt(resultado.supplier_total_return * resultado.cantidad)}</span>
                  </div>
                </div>
              </>
            )}

            <button className="btn-success" onClick={handleRegistrar} style={{ width: '100%', marginTop: '1rem' }}>
              <Plus size={18} /> Registrar Distribución
            </button>
          </div>
        )}
      </Modal>

      {/* Tabla de historial */}
      <div className="table-wrapper glass-card">
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Scale size={20} /> Historial de Distribuciones
        </h3>
        {distribuciones.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            No hay distribuciones registradas. Creá una nueva con el botón de arriba.
          </p>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>P. Venta</th>
                  <th>Sabry</th>
                  <th>Proveedor</th>
                  <th>Retorno Prov.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {distribuciones.map(d => (
                  <React.Fragment key={d.id}>
                    <tr
                      className="clickable-row"
                      onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                    >
                      <td>{d.fecha}</td>
                      <td>{productos.find(p => p.id === d.producto_id)?.nombre || '—'}</td>
                      <td>{d.cantidad_kg || d.cantidad || 1}</td>
                      <td>{fmt(d.total_sale || d.sale_price * (d.cantidad || 1))}</td>
                      <td style={{ color: '#f97316', fontWeight: 600 }}>{fmt(d.total_partner_profit || d.partner_profit * (d.cantidad || 1))}</td>
                      <td style={{ color: '#10b981', fontWeight: 600 }}>{fmt(d.total_supplier_profit || d.supplier_profit * (d.cantidad || 1))}</td>
                      <td style={{ color: '#8b5cf6', fontWeight: 600 }}>{fmt(d.total_supplier_return || d.supplier_total_return * (d.cantidad || 1))}</td>
                      <td>
                        <button
                          className="btn-icon-danger"
                          onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                    {expandedId === d.id && (
                      <tr className="expanded-row">
                        <td colSpan="8">
                          <div className="expanded-detail">
                            <div className="detail-item"><span>Precio base:</span> <strong>{fmt(d.base_price || d.precio_base)}</strong></div>
                            <div className="detail-item"><span>Flete:</span> <strong>{fmt(d.shipping_cost)}</strong></div>
                            <div className="detail-item"><span>Costo total/u:</span> <strong>{fmt(d.total_cost)}</strong></div>
                            <div className="detail-item"><span>Precio venta/u:</span> <strong>{fmt(d.sale_price || d.precio_venta)}</strong></div>
                            <div className="detail-item"><span>Ganancia total/u:</span> <strong>{fmt(d.total_profit)}</strong></div>
                            <div className="detail-item"><span>% Sabry:</span> <strong>{d.partner_share_percentage}%</strong></div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .meat-dist-container {
          width: 100%;
        }

        .dist-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .dist-summary-card {
          background: var(--surface);
          border-radius: var(--radius);
          padding: 1.25rem;
          box-shadow: var(--shadow);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .dist-summary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }

        .dist-summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .dist-icon-badge {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dist-summary-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 0.25rem;
        }

        .dist-summary-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .btn-primary:hover {
          background: var(--primary-dark, #ea580c);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
        }

        .btn-success {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: var(--radius);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .btn-success:hover {
          background: #059669;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .dist-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .form-group label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-group input,
        .form-group select {
          padding: 0.65rem 0.75rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.95rem;
          background: var(--background);
          color: var(--text);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          width: 100%;
          box-sizing: border-box;
        }

        .form-group select {
          cursor: pointer;
          appearance: auto;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        .dist-result-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
        }

        .dist-result-chip {
          background: var(--background);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          border-left: 3px solid var(--chip-color);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .dist-result-chip.highlight {
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.05), rgba(139, 92, 246, 0.05));
        }

        .chip-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .chip-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--chip-color);
        }

        .table-wrapper {
          padding: 1.5rem;
          overflow-x: auto;
        }

        .responsive-table {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        thead th {
          text-align: left;
          padding: 0.75rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          border-bottom: 2px solid var(--border);
          white-space: nowrap;
        }

        tbody td {
          padding: 0.75rem;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }

        .clickable-row {
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .clickable-row:hover {
          background: rgba(249, 115, 22, 0.04);
        }

        .expanded-row td {
          padding: 0;
          border-bottom: 2px solid var(--primary);
        }

        .expanded-detail {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(249, 115, 22, 0.03);
          border-radius: 0 0 8px 8px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          font-size: 0.8rem;
        }

        .detail-item span {
          color: var(--text-muted);
          font-size: 0.7rem;
          text-transform: uppercase;
        }

        .btn-icon-danger {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.4rem;
          border-radius: 6px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
        }

        .btn-icon-danger:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        @media (max-width: 640px) {
          .dist-summary-grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }

          .dist-summary-value {
            font-size: 1.15rem;
          }

          .form-grid-2 {
            grid-template-columns: 1fr;
          }

          .dist-result-grid {
            grid-template-columns: 1fr 1fr;
          }

          .expanded-detail {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default MeatDistribution;
