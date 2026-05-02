import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { calculateMeatSaleDistribution } from '../utils/meatDistribution';

const ACCESS_PASSWORD = 'sabri_2026';

function getWeekRange(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon + offset * 7);
  mon.setHours(0, 0, 0, 0);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return { from: mon, to: sun };
}

function fmt(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0
  }).format(n || 0);
}

function fmtDate(fecha) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit'
  });
}

function today() {
  return new Date().toISOString().split('T')[0];
}

// Inyecta el manifest específico de Sabri para el ícono de home screen
function useSabriManifest() {
  useEffect(() => {
    const existing = document.querySelector('link[rel="manifest"]');
    const prev = existing?.href;
    if (existing) existing.href = '/manifest-sabri.json';

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    const prevColor = metaTheme?.content;
    if (metaTheme) metaTheme.content = '#10b981';

    const metaTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    const prevTitle = metaTitle?.content;
    if (metaTitle) metaTitle.content = 'Mis Ventas';

    return () => {
      if (existing && prev) existing.href = prev;
      if (metaTheme && prevColor) metaTheme.content = prevColor;
      if (metaTitle && prevTitle) metaTitle.content = prevTitle;
    };
  }, []);
}

export default function SabriPanel() {
  useSabriManifest();

  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [tab, setTab] = useState('nueva'); // 'nueva' | 'semana'

  // Datos
  const [productos, setProductos] = useState([]);
  const [compras, setCompras] = useState([]);
  const [distribuciones, setDistribuciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Formulario nueva venta
  const [form, setForm] = useState({ producto_id: '', cantidad_kg: '', precio_venta: '' });
  const [guardado, setGuardado] = useState(false);

  // Filtro semana
  const [periodoOffset, setPeriodoOffset] = useState(0);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (input === ACCESS_PASSWORD) {
      setUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
      setInput('');
    }
  };

  useEffect(() => {
    if (!unlocked) return;
    const load = async () => {
      setLoading(true);
      const [{ data: pData }, { data: cData }, { data: dData }] = await Promise.all([
        supabase.from('productos').select('id, nombre').order('nombre'),
        supabase.from('compras').select('id, producto_id, costo_unitario, cantidad_kg'),
        supabase.from('distribuciones').select('*').order('fecha', { ascending: false }),
      ]);
      if (pData) setProductos(pData);
      if (cData) setCompras(cData);
      if (dData) setDistribuciones(dData);
      setLoading(false);
    };
    load();
  }, [unlocked]);

  // Costo base por producto (promedio ponderado de TODAS las compras)
  const costoBase = useMemo(() => {
    const acc = {};
    compras.forEach(c => {
      if (!acc[c.producto_id]) acc[c.producto_id] = { total: 0, kg: 0 };
      acc[c.producto_id].total += c.costo_unitario * c.cantidad_kg;
      acc[c.producto_id].kg += c.cantidad_kg;
    });
    const r = {};
    Object.entries(acc).forEach(([id, d]) => {
      r[id] = d.kg > 0 ? d.total / d.kg : 0;
    });
    return r;
  }, [compras]);

  // Último porcentaje usado por producto
  const ultimoPorcentaje = useMemo(() => {
    const r = {};
    distribuciones.forEach(d => {
      if (d.producto_id && d.partner_share_percentage != null && !r[d.producto_id]) {
        r[d.producto_id] = d.partner_share_percentage;
      }
    });
    return r;
  }, [distribuciones]);

  const productoSeleccionado = productos.find(p => p.id === form.producto_id);
  const basePrecio = form.producto_id ? (costoBase[form.producto_id] || 0) : 0;
  const porcentaje = form.producto_id
    ? (ultimoPorcentaje[form.producto_id] ?? 50)
    : 50;

  const preview = useMemo(() => {
    const kg = parseFloat(form.cantidad_kg);
    const venta = parseFloat(form.precio_venta);
    if (!form.producto_id || isNaN(kg) || kg <= 0 || isNaN(venta) || venta <= 0 || basePrecio <= 0) return null;
    if (venta <= basePrecio) return null;
    const dist = calculateMeatSaleDistribution({
      base_price: basePrecio,
      shipping_cost: 0,
      sale_price: venta,
      partner_share_percentage: porcentaje,
    });
    return {
      ganancia: dist.partner_profit * kg,
      entrega: dist.supplier_total_return * kg,
      totalVenta: venta * kg,
    };
  }, [form, basePrecio, porcentaje]);

  const handleGuardar = async () => {
    if (!preview || saving) return;
    setSaving(true);

    const kg = parseFloat(form.cantidad_kg);
    const venta = parseFloat(form.precio_venta);
    const dist = calculateMeatSaleDistribution({
      base_price: basePrecio,
      shipping_cost: 0,
      sale_price: venta,
      partner_share_percentage: porcentaje,
    });

    const nueva = {
      fecha: today(),
      producto_id: form.producto_id,
      cantidad_kg: kg,
      precio_base: basePrecio,
      shipping_cost: 0,
      precio_venta: venta,
      partner_share_percentage: porcentaje,
      total_cost: dist.total_cost,
      total_profit: dist.total_profit,
      partner_profit: dist.partner_profit,
      supplier_profit: dist.supplier_profit,
      supplier_total_return: dist.supplier_total_return,
      total_sale: venta * kg,
      total_partner_profit: dist.partner_profit * kg,
      total_supplier_profit: dist.supplier_profit * kg,
      total_supplier_return: dist.supplier_total_return * kg,
    };

    const { data, error } = await supabase.from('distribuciones').insert([nueva]).select();
    setSaving(false);

    if (error) {
      alert('Error al guardar: ' + error.message);
      return;
    }

    // Agregar al estado local
    setDistribuciones(prev => [{ ...nueva, id: data?.[0]?.id }, ...prev]);
    setForm({ producto_id: '', cantidad_kg: '', precio_venta: '' });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  // Reporte semanal
  const { from, to, label } = useMemo(() => {
    const { from, to } = getWeekRange(periodoOffset);
    const label = periodoOffset === 0 ? 'Esta semana'
      : periodoOffset === -1 ? 'Semana pasada'
      : `Hace ${Math.abs(periodoOffset)} semanas`;
    return { from, to, label };
  }, [periodoOffset]);

  const distribFiltradas = useMemo(() => (
    distribuciones.filter(d => {
      const f = new Date(d.fecha + 'T00:00:00');
      return f >= from && f <= to;
    })
  ), [distribuciones, from, to]);

  const totales = useMemo(() => (
    distribFiltradas.reduce((acc, d) => ({
      kg: acc.kg + (d.cantidad_kg || 0),
      ganancia: acc.ganancia + (d.total_partner_profit || 0),
      entrega: acc.entrega + (d.total_supplier_return || 0),
    }), { kg: 0, ganancia: 0, entrega: 0 })
  ), [distribFiltradas]);

  const productoNombre = (id) => productos.find(p => p.id === id)?.nombre || '—';

  const handleWhatsApp = () => {
    const lines = [
      `📦 *Distribución — ${label}*`,
      '',
      ...distribFiltradas.map(d =>
        `• ${productoNombre(d.producto_id)} (${fmtDate(d.fecha)}): ${(d.cantidad_kg || 0).toFixed(2)} kg — Mi ganancia: ${fmt(d.total_partner_profit)}`
      ),
      '',
      `*Total kg:* ${totales.kg.toFixed(2)} kg`,
      `*Mi ganancia:* ${fmt(totales.ganancia)}`,
      `*Le entrego a Cristhoper:* ${fmt(totales.entrega)}`,
    ];
    window.open(`https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
  };

  // --- PIN ---
  if (!unlocked) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0f172a', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, sans-serif', padding: '1rem',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px', padding: '2.5rem 2rem', width: '100%', maxWidth: '360px',
          backdropFilter: 'blur(20px)', textAlign: 'center',
        }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🥩</span>
          <h2 style={{ color: 'white', margin: '0 0 0.3rem', fontSize: '1.4rem', fontWeight: 800 }}>
            Mis Ventas
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1.75rem' }}>
            Ingresá tu contraseña para continuar
          </p>
          <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="password"
              value={input}
              onChange={e => { setInput(e.target.value); setPinError(false); }}
              placeholder="Contraseña"
              autoFocus
              style={{
                padding: '0.9rem 1rem', borderRadius: '14px', fontSize: '1.1rem',
                border: pinError ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(15,23,42,0.6)', color: 'white', outline: 'none',
                width: '100%', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '0.15em',
              }}
            />
            {pinError && (
              <p style={{ color: '#ef4444', fontSize: '0.82rem', margin: '-0.25rem 0 0' }}>
                Contraseña incorrecta
              </p>
            )}
            <button type="submit" style={{
              padding: '0.9rem', borderRadius: '14px', border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
            }}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- PANEL PRINCIPAL ---
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .sp-root {
          min-height: 100vh;
          background: #0f172a;
          font-family: 'Inter', sans-serif;
          color: #e2e8f0;
          display: flex;
          flex-direction: column;
          padding-bottom: 80px;
        }
        .sp-header {
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 1.25rem 1.25rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .sp-header-emoji { font-size: 1.6rem; }
        .sp-header-title { font-size: 1.2rem; font-weight: 800; color: #f1f5f9; }
        .sp-header-sub { font-size: 0.75rem; color: #64748b; margin-top: 1px; }
        .sp-body { flex: 1; padding: 1.25rem; max-width: 600px; margin: 0 auto; width: 100%; }

        /* Bottom nav */
        .sp-nav {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: rgba(15,23,42,0.97);
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          backdrop-filter: blur(20px);
          z-index: 100;
          padding-bottom: env(safe-area-inset-bottom);
        }
        .sp-nav-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.75rem 0.5rem;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .sp-nav-btn.active { color: #10b981; }
        .sp-nav-icon { font-size: 1.4rem; }

        /* Form */
        .sp-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 1.25rem;
          margin-bottom: 1rem;
        }
        .sp-field { margin-bottom: 1rem; }
        .sp-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 0.5rem;
        }
        .sp-select, .sp-input {
          width: 100%;
          padding: 0.85rem 1rem;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(15,23,42,0.6);
          color: #f1f5f9;
          font-size: 1rem;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s;
          -webkit-appearance: none;
        }
        .sp-select:focus, .sp-input:focus {
          border-color: rgba(16,185,129,0.5);
        }
        .sp-select option { background: #1e293b; color: #f1f5f9; }
        .sp-input[type="number"] { -moz-appearance: textfield; }
        .sp-input[type="number"]::-webkit-inner-spin-button,
        .sp-input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; }

        /* Preview */
        .sp-preview {
          background: rgba(16,185,129,0.07);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 14px;
          padding: 1rem 1.25rem;
          margin-bottom: 1rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .sp-preview-field {}
        .sp-preview-label { font-size: 0.68rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem; }
        .sp-preview-value { font-size: 1.2rem; font-weight: 800; }
        .sp-preview-value.green { color: #10b981; }
        .sp-preview-value.purple { color: #a78bfa; }
        .sp-preview-value.white { color: #f1f5f9; }

        /* Buttons */
        .sp-btn-save {
          width: 100%;
          padding: 1rem;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          font-size: 1rem;
          font-weight: 800;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 14px rgba(16,185,129,0.3);
          transition: all 0.2s;
        }
        .sp-btn-save:disabled {
          background: rgba(255,255,255,0.08);
          color: #475569;
          box-shadow: none;
          cursor: not-allowed;
        }
        .sp-btn-save:not(:disabled):active {
          transform: scale(0.98);
        }

        /* Success toast */
        .sp-toast {
          position: fixed;
          bottom: 90px;
          left: 50%;
          transform: translateX(-50%);
          background: #10b981;
          color: white;
          font-weight: 700;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          font-size: 0.9rem;
          z-index: 200;
          box-shadow: 0 4px 20px rgba(16,185,129,0.4);
          white-space: nowrap;
        }

        /* Reporte */
        .sp-period-pills {
          display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap;
        }
        .sp-pill {
          padding: 0.4rem 0.9rem;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        .sp-pill.active {
          background: rgba(16,185,129,0.15);
          border-color: rgba(16,185,129,0.4);
          color: #10b981;
        }
        .sp-summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.6rem;
          margin-bottom: 1.25rem;
        }
        .sp-summary-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 0.875rem 0.75rem;
          text-align: center;
        }
        .sp-summary-label { font-size: 0.62rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem; }
        .sp-summary-value { font-size: 0.95rem; font-weight: 800; color: #f1f5f9; }
        .sp-summary-value.green { color: #10b981; }
        .sp-summary-value.purple { color: #a78bfa; }
        .sp-dist-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          margin-bottom: 0.6rem;
          overflow: hidden;
        }
        .sp-dist-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .sp-dist-nombre { font-weight: 700; color: #f1f5f9; font-size: 0.95rem; }
        .sp-dist-fecha { font-size: 0.75rem; color: #64748b; }
        .sp-dist-body {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          padding: 0.625rem 1rem;
          gap: 0.5rem;
        }
        .sp-dist-f-label { font-size: 0.62rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.15rem; }
        .sp-dist-f-value { font-size: 0.88rem; font-weight: 700; color: #f1f5f9; }
        .sp-dist-f-value.green { color: #10b981; }
        .sp-dist-f-value.purple { color: #a78bfa; }
        .sp-empty { text-align: center; color: #64748b; padding: 2.5rem 1rem; font-size: 0.9rem; }
        .sp-section-label {
          font-size: 0.7rem; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 0.6rem;
        }
        .sp-wapp-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          width: 100%;
          padding: 0.9rem;
          border-radius: 14px;
          border: none;
          background: #25d366;
          color: white;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          margin-top: 1rem;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 14px rgba(37,211,102,0.3);
        }

        .sp-no-base {
          font-size: 0.8rem;
          color: #f59e0b;
          margin-top: 0.4rem;
          padding: 0.5rem 0.75rem;
          background: rgba(245,158,11,0.08);
          border-radius: 8px;
          border: 1px solid rgba(245,158,11,0.2);
        }

        @media (max-width: 380px) {
          .sp-summary-grid { grid-template-columns: 1fr 1fr; }
          .sp-summary-grid .sp-summary-card:last-child { grid-column: 1 / -1; }
          .sp-dist-body { grid-template-columns: 1fr 1fr; }
          .sp-dist-body .sp-dist-field:last-child { grid-column: 1 / -1; }
        }
      `}</style>

      {guardado && <div className="sp-toast">✓ Venta guardada</div>}

      <div className="sp-root">
        <div className="sp-header">
          <span className="sp-header-emoji">🥩</span>
          <div>
            <div className="sp-header-title">Mis Ventas</div>
            <div className="sp-header-sub">Gestión Sabri</div>
          </div>
        </div>

        <div className="sp-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              Cargando...
            </div>
          ) : tab === 'nueva' ? (
            // ─── NUEVA VENTA ───
            <>
              <div className="sp-card">
                <div className="sp-field">
                  <label className="sp-label">Producto</label>
                  <select
                    className="sp-select"
                    value={form.producto_id}
                    onChange={e => setForm({ ...form, producto_id: e.target.value, cantidad_kg: '', precio_venta: '' })}
                  >
                    <option value="">Seleccioná un producto...</option>
                    {productos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                  {form.producto_id && basePrecio === 0 && (
                    <p className="sp-no-base">
                      ⚠ Este producto no tiene precio base cargado todavía. Pedile a Cristhoper que registre una compra primero.
                    </p>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="sp-field" style={{ marginBottom: 0 }}>
                    <label className="sp-label">Kilos vendidos</label>
                    <input
                      className="sp-input"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="5.00"
                      value={form.cantidad_kg}
                      onChange={e => setForm({ ...form, cantidad_kg: e.target.value })}
                    />
                  </div>
                  <div className="sp-field" style={{ marginBottom: 0 }}>
                    <label className="sp-label">Precio de venta ($/kg)</label>
                    <input
                      className="sp-input"
                      type="number"
                      min="0"
                      step="10"
                      placeholder="8000"
                      value={form.precio_venta}
                      onChange={e => setForm({ ...form, precio_venta: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {preview && (
                <div className="sp-preview">
                  <div className="sp-preview-field">
                    <div className="sp-preview-label">Total de venta</div>
                    <div className="sp-preview-value white">{fmt(preview.totalVenta)}</div>
                  </div>
                  <div className="sp-preview-field">
                    <div className="sp-preview-label">Mi ganancia</div>
                    <div className="sp-preview-value green">{fmt(preview.ganancia)}</div>
                  </div>
                  <div className="sp-preview-field" style={{ gridColumn: '1 / -1' }}>
                    <div className="sp-preview-label">Le entrego a Cristhoper</div>
                    <div className="sp-preview-value purple">{fmt(preview.entrega)}</div>
                  </div>
                </div>
              )}

              {!preview && form.producto_id && basePrecio > 0 && (
                <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.85rem', padding: '0.5rem' }}>
                  Completá los kilos y el precio de venta para ver el resumen
                </p>
              )}

              <button
                className="sp-btn-save"
                onClick={handleGuardar}
                disabled={!preview || saving}
              >
                {saving ? 'Guardando...' : '✓ Guardar venta'}
              </button>
            </>
          ) : (
            // ─── MI SEMANA ───
            <>
              <div className="sp-period-pills">
                {[0, -1, -2].map(offset => (
                  <button
                    key={offset}
                    className={`sp-pill ${periodoOffset === offset ? 'active' : ''}`}
                    onClick={() => setPeriodoOffset(offset)}
                  >
                    {offset === 0 ? 'Esta semana' : offset === -1 ? 'Semana pasada' : 'Hace 2 semanas'}
                  </button>
                ))}
              </div>

              <div className="sp-summary-grid">
                <div className="sp-summary-card">
                  <div className="sp-summary-label">Total kg</div>
                  <div className="sp-summary-value">{totales.kg.toFixed(1)} kg</div>
                </div>
                <div className="sp-summary-card">
                  <div className="sp-summary-label">Mi ganancia</div>
                  <div className="sp-summary-value green">{fmt(totales.ganancia)}</div>
                </div>
                <div className="sp-summary-card">
                  <div className="sp-summary-label">Le entrego a Cristhoper</div>
                  <div className="sp-summary-value purple">{fmt(totales.entrega)}</div>
                </div>
              </div>

              {distribFiltradas.length === 0 ? (
                <div className="sp-empty">Sin ventas registradas para {label.toLowerCase()}</div>
              ) : (
                <>
                  <p className="sp-section-label">
                    {label} — {distribFiltradas.length} venta{distribFiltradas.length !== 1 ? 's' : ''}
                  </p>
                  {distribFiltradas.map(d => (
                    <div key={d.id} className="sp-dist-card">
                      <div className="sp-dist-header">
                        <span className="sp-dist-nombre">{productoNombre(d.producto_id)}</span>
                        <span className="sp-dist-fecha">{fmtDate(d.fecha)}</span>
                      </div>
                      <div className="sp-dist-body">
                        <div className="sp-dist-field">
                          <div className="sp-dist-f-label">Kilos</div>
                          <div className="sp-dist-f-value">{(d.cantidad_kg || 0).toFixed(2)} kg</div>
                        </div>
                        <div className="sp-dist-field">
                          <div className="sp-dist-f-label">Mi ganancia</div>
                          <div className="sp-dist-f-value green">{fmt(d.total_partner_profit)}</div>
                        </div>
                        <div className="sp-dist-field">
                          <div className="sp-dist-f-label">Le entrego a Cristhoper</div>
                          <div className="sp-dist-f-value purple">{fmt(d.total_supplier_return)}</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button className="sp-wapp-btn" onClick={handleWhatsApp}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Enviar por WhatsApp
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Bottom nav */}
        <nav className="sp-nav">
          <button className={`sp-nav-btn ${tab === 'nueva' ? 'active' : ''}`} onClick={() => setTab('nueva')}>
            <span className="sp-nav-icon">➕</span>
            Nueva venta
          </button>
          <button className={`sp-nav-btn ${tab === 'semana' ? 'active' : ''}`} onClick={() => setTab('semana')}>
            <span className="sp-nav-icon">📊</span>
            Mi semana
          </button>
        </nav>
      </div>
    </>
  );
}
