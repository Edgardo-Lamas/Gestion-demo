import React, { useState, useMemo } from 'react';

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
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n || 0);
}

function fmtDate(fecha) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'short', day: '2-digit', month: '2-digit',
  });
}

const pillStyle = (active) => ({
  padding: '0.4rem 1rem',
  borderRadius: '20px',
  border: active ? '1px solid rgba(249,115,22,0.4)' : '1px solid var(--border)',
  background: active ? 'rgba(249,115,22,0.1)' : 'transparent',
  color: active ? 'var(--primary)' : 'var(--text-muted)',
  fontSize: '0.82rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s',
});

export default function ReporteSabriAdmin({ distribuciones, productos }) {
  const [periodoOffset, setPeriodoOffset] = useState(0);

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
    }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  ), [distribuciones, from, to]);

  const totales = useMemo(() => (
    distribFiltradas.reduce((acc, d) => ({
      kg: acc.kg + (d.cantidad_kg || 0),
      aCobrar: acc.aCobrar + (d.total_supplier_return || 0),
      sabriGanancia: acc.sabriGanancia + (d.total_partner_profit || 0),
      totalVenta: acc.totalVenta + (d.total_sale || 0),
    }), { kg: 0, aCobrar: 0, sabriGanancia: 0, totalVenta: 0 })
  ), [distribFiltradas]);

  const productoNombre = (id) => productos.find(p => p.id === id)?.nombre || '—';

  const handleWhatsApp = () => {
    const lines = [
      `🥩 *Rendición Sabri — ${label}*`,
      '',
      ...distribFiltradas.map(d =>
        `• ${productoNombre(d.producto_id)} (${fmtDate(d.fecha)}): ${(d.cantidad_kg || 0).toFixed(2)} kg — Te entrego: ${fmt(d.total_supplier_return)}`
      ),
      '',
      `*Total kg vendidos:* ${totales.kg.toFixed(2)} kg`,
      `*Tu ganancia (Sabri):* ${fmt(totales.sabriGanancia)}`,
      `*Me entregás a mí:* ${fmt(totales.aCobrar)}`,
    ];
    window.open(`https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
  };

  return (
    <div className="sabri-admin-view">
      <section className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>Ventas de Sabri</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Lo que Sabri vendió y lo que te debe entregar.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[0, -1, -2, -3].map(offset => (
              <button
                key={offset}
                style={pillStyle(periodoOffset === offset)}
                onClick={() => setPeriodoOffset(offset)}
              >
                {offset === 0 ? 'Esta semana'
                  : offset === -1 ? 'Semana pasada'
                  : `Hace ${Math.abs(offset)} sem.`}
              </button>
            ))}
          </div>
        </div>

        {/* Tarjetas resumen */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1rem', textAlign: 'center', margin: 0 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              Kilos vendidos
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>
              {totales.kg.toFixed(2)} kg
            </div>
          </div>
          <div className="glass-card" style={{ padding: '1rem', textAlign: 'center', margin: 0, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              Te entrega Sabri
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
              {fmt(totales.aCobrar)}
            </div>
          </div>
          <div className="glass-card" style={{ padding: '1rem', textAlign: 'center', margin: 0, background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              Ganancia de Sabri
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a78bfa' }}>
              {fmt(totales.sabriGanancia)}
            </div>
          </div>
          <div className="glass-card" style={{ padding: '1rem', textAlign: 'center', margin: 0, background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              Total facturado
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
              {fmt(totales.totalVenta)}
            </div>
          </div>
        </div>

        {/* Tabla detalle */}
        {distribFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Sin ventas registradas para {label.toLowerCase()}.
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Kilos</th>
                    <th>Precio venta</th>
                    <th>Ganancia Sabri</th>
                    <th style={{ color: '#10b981' }}>Te entrega</th>
                  </tr>
                </thead>
                <tbody>
                  {distribFiltradas.map(d => (
                    <tr key={d.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{fmtDate(d.fecha)}</td>
                      <td><strong>{productoNombre(d.producto_id)}</strong></td>
                      <td>{(d.cantidad_kg || 0).toFixed(2)} kg</td>
                      <td>{fmt(d.precio_venta)}/kg</td>
                      <td style={{ color: '#a78bfa', fontWeight: 600 }}>{fmt(d.total_partner_profit)}</td>
                      <td style={{ color: '#10b981', fontWeight: 700 }}>{fmt(d.total_supplier_return)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleWhatsApp}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none',
                  background: '#25d366', color: 'white', fontWeight: 700,
                  fontSize: '0.9rem', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37,211,102,0.3)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enviar rendición a Sabri
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
