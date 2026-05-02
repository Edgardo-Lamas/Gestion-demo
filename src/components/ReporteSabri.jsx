import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

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
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0);
}

function fmtDate(fecha) {
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}

export default function ReporteSabri() {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const [distribuciones, setDistribuciones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [periodoOffset, setPeriodoOffset] = useState(0);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (input === ACCESS_PASSWORD) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setInput('');
    }
  };

  useEffect(() => {
    if (!unlocked) return;
    const load = async () => {
      setLoading(true);
      const [{ data: dData }, { data: pData }] = await Promise.all([
        supabase.from('distribuciones').select('*').order('fecha', { ascending: false }),
        supabase.from('productos').select('id, nombre'),
      ]);
      if (dData) setDistribuciones(dData);
      if (pData) setProductos(pData);
      setLoading(false);
    };
    load();
  }, [unlocked]);

  const { from, to, label } = useMemo(() => {
    const { from, to } = getWeekRange(periodoOffset);
    const label = periodoOffset === 0
      ? 'Esta semana'
      : periodoOffset === -1
      ? 'Semana pasada'
      : `Hace ${Math.abs(periodoOffset)} semanas`;
    return { from, to, label };
  }, [periodoOffset]);

  const distribFiltradas = useMemo(() => {
    return distribuciones.filter(d => {
      const fecha = new Date(d.fecha + 'T00:00:00');
      return fecha >= from && fecha <= to;
    });
  }, [distribuciones, from, to]);

  const totales = useMemo(() => {
    return distribFiltradas.reduce((acc, d) => ({
      kg: acc.kg + (d.cantidad_kg || 0),
      ganancia: acc.ganancia + (d.total_partner_profit || 0),
      entrega: acc.entrega + (d.total_supplier_return || 0),
    }), { kg: 0, ganancia: 0, entrega: 0 });
  }, [distribFiltradas]);

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
    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (!unlocked) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0f172a', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif',
        padding: '1rem'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px', padding: '2.5rem 2rem', width: '100%', maxWidth: '380px',
          backdropFilter: 'blur(20px)', textAlign: 'center'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>📦</span>
            <h2 style={{ color: 'white', margin: '0 0 0.25rem', fontSize: '1.3rem', fontWeight: 700 }}>
              Reporte Semanal
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              Ingresá la contraseña para ver tu reporte
            </p>
          </div>
          <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="password"
              value={input}
              onChange={e => { setInput(e.target.value); setError(false); }}
              placeholder="Contraseña"
              autoFocus
              style={{
                padding: '0.85rem 1rem', borderRadius: '12px', fontSize: '1rem',
                border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(15,23,42,0.5)', color: 'white', outline: 'none',
                width: '100%', boxSizing: 'border-box'
              }}
            />
            {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: 0 }}>Contraseña incorrecta</p>}
            <button type="submit" style={{
              padding: '0.85rem', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(to right, #10b981, #059669)',
              color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer'
            }}>
              Ver mi reporte
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .sabri-root {
          min-height: 100vh;
          background: #0f172a;
          font-family: 'Inter', sans-serif;
          color: #e2e8f0;
          padding: 1.5rem 1rem 4rem;
          box-sizing: border-box;
        }
        .sabri-inner { max-width: 600px; margin: 0 auto; }
        .sabri-header { text-align: center; margin-bottom: 2rem; }
        .sabri-title {
          font-size: 1.8rem; font-weight: 800; color: #f1f5f9; margin: 0 0 0.25rem;
        }
        .sabri-subtitle { color: #94a3b8; font-size: 0.9rem; margin: 0; }
        .sabri-period-pills {
          display: flex; gap: 0.5rem; justify-content: center;
          margin-bottom: 1.5rem; flex-wrap: wrap;
        }
        .sabri-pill {
          padding: 0.4rem 1rem; border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: #94a3b8; font-size: 0.82rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .sabri-pill.active {
          background: rgba(16,185,129,0.15);
          border-color: rgba(16,185,129,0.4);
          color: #10b981;
        }
        .sabri-summary-grid {
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          gap: 0.75rem; margin-bottom: 1.5rem;
        }
        .sabri-summary-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 1rem; text-align: center;
        }
        .sabri-summary-label {
          font-size: 0.68rem; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.4rem;
        }
        .sabri-summary-value { font-size: 1rem; font-weight: 800; color: #f1f5f9; }
        .sabri-summary-value.green { color: #10b981; }
        .sabri-summary-value.purple { color: #a78bfa; }
        .sabri-section-title {
          font-size: 0.72rem; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 0.75rem;
        }
        .sabri-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; margin-bottom: 0.75rem; overflow: hidden;
        }
        .sabri-card-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.875rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .sabri-card-producto { font-weight: 700; color: #f1f5f9; font-size: 0.97rem; }
        .sabri-card-fecha { font-size: 0.78rem; color: #64748b; }
        .sabri-card-body {
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          padding: 0.75rem 1rem; gap: 0.5rem;
        }
        .sabri-card-field-label {
          font-size: 0.65rem; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem;
        }
        .sabri-card-field-value { font-size: 0.9rem; font-weight: 700; color: #f1f5f9; }
        .sabri-card-field-value.green { color: #10b981; }
        .sabri-card-field-value.purple { color: #a78bfa; }
        .sabri-empty {
          text-align: center; color: #64748b;
          padding: 3rem 1rem; font-size: 0.95rem;
        }
        .sabri-wapp-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 0.6rem; width: 100%; padding: 1rem; border-radius: 14px;
          border: none; background: #25d366; color: white;
          font-size: 1rem; font-weight: 700; cursor: pointer;
          margin-top: 1.5rem; transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(37,211,102,0.3);
          font-family: 'Inter', sans-serif;
        }
        .sabri-wapp-btn:hover {
          background: #1db954; transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(37,211,102,0.4);
        }
        @media (max-width: 420px) {
          .sabri-summary-grid { grid-template-columns: 1fr 1fr; }
          .sabri-summary-grid .sabri-summary-card:last-child { grid-column: 1 / -1; }
          .sabri-card-body { grid-template-columns: 1fr 1fr; }
          .sabri-card-body .sabri-card-field:last-child { grid-column: 1 / -1; }
        }
      `}</style>
      <div className="sabri-root">
        <div className="sabri-inner">

          <div className="sabri-header">
            <p style={{ fontSize: '2.5rem', margin: '0 0 0.5rem' }}>📦</p>
            <h1 className="sabri-title">Mi Reporte</h1>
            <p className="sabri-subtitle">Distribución semanal</p>
          </div>

          <div className="sabri-period-pills">
            <button className={`sabri-pill ${periodoOffset === 0 ? 'active' : ''}`} onClick={() => setPeriodoOffset(0)}>
              Esta semana
            </button>
            <button className={`sabri-pill ${periodoOffset === -1 ? 'active' : ''}`} onClick={() => setPeriodoOffset(-1)}>
              Semana pasada
            </button>
            <button className={`sabri-pill ${periodoOffset === -2 ? 'active' : ''}`} onClick={() => setPeriodoOffset(-2)}>
              Hace 2 semanas
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Cargando...</div>
          ) : (
            <>
              <div className="sabri-summary-grid">
                <div className="sabri-summary-card">
                  <div className="sabri-summary-label">Total kg</div>
                  <div className="sabri-summary-value">{totales.kg.toFixed(1)} kg</div>
                </div>
                <div className="sabri-summary-card">
                  <div className="sabri-summary-label">Mi ganancia</div>
                  <div className="sabri-summary-value green">{fmt(totales.ganancia)}</div>
                </div>
                <div className="sabri-summary-card">
                  <div className="sabri-summary-label">Le entrego a Cristhoper</div>
                  <div className="sabri-summary-value purple">{fmt(totales.entrega)}</div>
                </div>
              </div>

              {distribFiltradas.length === 0 ? (
                <div className="sabri-empty">
                  Sin distribuciones para {label.toLowerCase()}
                </div>
              ) : (
                <>
                  <p className="sabri-section-title">
                    {label} — {distribFiltradas.length} distribución{distribFiltradas.length !== 1 ? 'es' : ''}
                  </p>
                  {distribFiltradas.map(d => (
                    <div key={d.id} className="sabri-card">
                      <div className="sabri-card-header">
                        <span className="sabri-card-producto">{productoNombre(d.producto_id)}</span>
                        <span className="sabri-card-fecha">{fmtDate(d.fecha)}</span>
                      </div>
                      <div className="sabri-card-body">
                        <div className="sabri-card-field">
                          <div className="sabri-card-field-label">Kilos</div>
                          <div className="sabri-card-field-value">{(d.cantidad_kg || 0).toFixed(2)} kg</div>
                        </div>
                        <div className="sabri-card-field">
                          <div className="sabri-card-field-label">Mi ganancia</div>
                          <div className="sabri-card-field-value green">{fmt(d.total_partner_profit)}</div>
                        </div>
                        <div className="sabri-card-field">
                          <div className="sabri-card-field-label">Le entrego a Cristhoper</div>
                          <div className="sabri-card-field-value purple">{fmt(d.total_supplier_return)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {distribFiltradas.length > 0 && (
                <button className="sabri-wapp-btn" onClick={handleWhatsApp}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Enviar resumen por WhatsApp
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
