import React, { useEffect, useRef } from 'react';

const FEATURES = [
  {
    icon: '🌐',
    title: 'Portal propio por revendedor',
    desc: 'Cada vendedor recibe su link único con catálogo de AGIAPURR personalizado. Sus clientes hacen pedidos desde ahí y llegan directo al sistema.',
  },
  {
    icon: '📲',
    title: 'Landing de reclutamiento',
    desc: 'Página pública donde personas interesadas se postulan para unirse a la red. El sistema las gestiona automáticamente.',
  },
  {
    icon: '💰',
    title: 'Comisiones automáticas',
    desc: 'El sistema calcula en tiempo real cuánto ganó cada revendedor por sus ventas. Sin planillas, sin errores.',
  },
  {
    icon: '📚',
    title: 'Kit de capacitación',
    desc: 'Materiales, precios, argumentos de venta y guías de producto accesibles desde el portal del revendedor.',
  },
  {
    icon: '📊',
    title: 'Panel de control',
    desc: 'Ves de un vistazo quién vende más, qué productos mueven, y el total generado por la red en el mes.',
  },
  {
    icon: '📣',
    title: 'Publicidad y alcance',
    desc: 'Cada revendedor activo es un canal de marketing. Sin costos fijos de publicidad — solo comisiones sobre ventas reales.',
  },
];

const STATS = [
  { valor: '×5', label: 'Alcance de ventas', sub: 'con 5 revendedores activos' },
  { valor: '0', label: 'Costo fijo adicional', sub: 'solo comisión sobre venta real' },
  { valor: '24/7', label: 'Pedidos entrando', sub: 'desde cualquier lugar' },
];

// SVG animado — red radial de distribuidores
function RedNodos() {
  const center = { x: 300, y: 200 };
  const revendedores = [
    { x: 100, y: 80,  label: 'Vendedor A' },
    { x: 500, y: 80,  label: 'Vendedor B' },
    { x: 80,  y: 300, label: 'Vendedor C' },
    { x: 520, y: 300, label: 'Vendedor D' },
    { x: 300, y: 370, label: 'Vendedor E' },
  ];
  const clientes = [
    { x: 30,  y: 30,  rev: 0 },
    { x: 150, y: 20,  rev: 0 },
    { x: 555, y: 30,  rev: 1 },
    { x: 460, y: 20,  rev: 1 },
    { x: 20,  y: 260, rev: 2 },
    { x: 30,  y: 350, rev: 2 },
    { x: 570, y: 260, rev: 3 },
    { x: 570, y: 350, rev: 3 },
    { x: 230, y: 430, rev: 4 },
    { x: 370, y: 430, rev: 4 },
  ];

  return (
    <svg viewBox="0 0 600 460" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: 560, display: 'block', margin: '0 auto' }}>
      <defs>
        <radialGradient id="cgCenter" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <style>{`
          @keyframes dash {
            to { stroke-dashoffset: -20; }
          }
          @keyframes pulse-node {
            0%,100% { r: 10; opacity: 0.8; }
            50% { r: 13; opacity: 1; }
          }
          @keyframes pulse-center {
            0%,100% { opacity: 0.6; transform-origin: 300px 200px; transform: scale(1); }
            50% { opacity: 1; transform-origin: 300px 200px; transform: scale(1.08); }
          }
          .line-main { stroke-dasharray: 6 4; animation: dash 1.5s linear infinite; }
          .line-sub  { stroke-dasharray: 3 4; animation: dash 2s linear infinite; }
          .rev-node  { animation: pulse-node 3s ease-in-out infinite; }
          .center-glow { animation: pulse-center 3s ease-in-out infinite; }
        `}</style>
      </defs>

      {/* Halo central */}
      <circle cx={center.x} cy={center.y} r="60" fill="url(#cgCenter)" className="center-glow"/>

      {/* Líneas: centro → revendedores */}
      {revendedores.map((r, i) => (
        <line key={i} x1={center.x} y1={center.y} x2={r.x} y2={r.y}
          className="line-main"
          stroke="#C9A84C" strokeWidth="1.5" strokeOpacity="0.5"
          style={{ animationDelay: `${i * 0.3}s` }} />
      ))}

      {/* Líneas: revendedores → clientes */}
      {clientes.map((c, i) => {
        const rv = revendedores[c.rev];
        return (
          <line key={i} x1={rv.x} y1={rv.y} x2={c.x} y2={c.y}
            className="line-sub"
            stroke="#3B7A57" strokeWidth="1" strokeOpacity="0.4"
            style={{ animationDelay: `${i * 0.15}s` }} />
        );
      })}

      {/* Nodos clientes */}
      {clientes.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r="5"
          fill="#3B7A57" opacity="0.6" filter="url(#glow)" />
      ))}

      {/* Nodos revendedores */}
      {revendedores.map((r, i) => (
        <g key={i}>
          <circle cx={r.x} cy={r.y} r="18" fill="#1B3A2A" stroke="#3B7A57" strokeWidth="1.5" opacity="0.9"/>
          <circle cx={r.x} cy={r.y} r="10" fill="#3B7A57" className="rev-node"
            style={{ animationDelay: `${i * 0.6}s` }} filter="url(#glow)"/>
          <text x={r.x} y={r.y + 30} textAnchor="middle"
            fontSize="9" fill="#C9A84C" fontFamily="Nunito, sans-serif" fontWeight="600" opacity="0.85">
            {r.label}
          </text>
        </g>
      ))}

      {/* Nodo central AGIAPURR */}
      <circle cx={center.x} cy={center.y} r="38" fill="#1B3A2A" stroke="#C9A84C" strokeWidth="2"/>
      <text x={center.x} y={center.y - 6} textAnchor="middle"
        fontSize="11" fill="#C9A84C" fontFamily="Nunito, sans-serif" fontWeight="800">
        AGIAPURR
      </text>
      <text x={center.x} y={center.y + 9} textAnchor="middle"
        fontSize="9" fill="rgba(201,168,76,0.7)" fontFamily="Nunito, sans-serif">
        Central
      </text>
    </svg>
  );
}

export default function RedVendedores() {
  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto', fontFamily: 'Nunito, sans-serif' }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1B3A2A 0%, #0f2218 100%)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        marginBottom: '1.5rem',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Borde dorado sutil */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '20px',
          border: '1px solid rgba(201,168,76,0.25)', pointerEvents: 'none'
        }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
          <div>
            <span style={{
              display: 'inline-block', background: 'rgba(201,168,76,0.15)',
              border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C',
              borderRadius: '20px', padding: '4px 14px', fontSize: '0.75rem',
              fontWeight: 700, letterSpacing: '0.06em', marginBottom: '1rem',
              textTransform: 'uppercase'
            }}>
              🚀 Módulo en desarrollo
            </span>

            <h2 style={{
              fontSize: '2rem', fontWeight: 900, color: 'white',
              margin: '0 0 1rem', lineHeight: 1.2, letterSpacing: '-0.5px'
            }}>
              Red de<br />
              <span style={{ color: '#C9A84C' }}>Revendedores</span>
            </h2>

            <p style={{
              color: 'rgba(255,255,255,0.7)', fontSize: '1rem',
              lineHeight: 1.65, margin: '0 0 1.5rem'
            }}>
              Multiplicá las ventas de AGIAPURR sin sumar empleados. Construí una red de vendedores independientes —
              cada uno con su propio portal, catálogo y comisiones automáticas.
              El sistema hace el trabajo, vos solo gestionás la red.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {STATS.map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  borderRadius: '12px', padding: '12px 16px', minWidth: '100px'
                }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#C9A84C', lineHeight: 1 }}>{s.valor}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'white', marginTop: '4px' }}>{s.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ opacity: 0.95 }}>
            <RedNodos />
          </div>
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{
          fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)',
          margin: '0 0 1rem', paddingLeft: '4px'
        }}>
          ¿Qué incluye este módulo?
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="glass-card" style={{
              padding: '1.25rem',
              borderLeft: '3px solid #3B7A57',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,122,87,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px', color: 'var(--text)' }}>{f.title}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CÓmo funciona ────────────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1.25rem', color: 'var(--text)' }}>
          ¿Cómo funciona el flujo?
        </h3>
        <div style={{ display: 'flex', gap: '0', flexWrap: 'wrap' }}>
          {[
            { n: '01', title: 'Alguien se postula', desc: 'Completa el formulario en la landing pública de AGIAPURR' },
            { n: '02', title: 'AGIAPURR lo activa', desc: 'Con un click le crea su portal y le da acceso al kit de capacitación' },
            { n: '03', title: 'El revendedor vende', desc: 'Comparte su link, sus clientes hacen pedidos → llegan directo al sistema' },
            { n: '04', title: 'Comisión automática', desc: 'Cada venta genera su comisión. El panel la calcula sola' },
          ].map((paso, i, arr) => (
            <div key={i} style={{ flex: '1 1 180px', position: 'relative', paddingRight: i < arr.length - 1 ? '1rem' : 0 }}>
              <div style={{
                fontSize: '2rem', fontWeight: 900, color: 'rgba(59,122,87,0.15)',
                lineHeight: 1, marginBottom: '6px'
              }}>{paso.n}</div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>{paso.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{paso.desc}</div>
              {i < arr.length - 1 && (
                <div style={{
                  position: 'absolute', right: '0', top: '18px',
                  fontSize: '1.2rem', color: '#C9A84C', opacity: 0.6
                }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #3B7A57, #2d6148)',
        borderRadius: '16px', padding: '2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <div style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>
            ¿Querés activar la Red de Revendedores?
          </div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem' }}>
            Contanos y lo construimos como parte del sistema. Está diseñado para escalar con AGIAPURR.
          </div>
        </div>
        <a
          href="https://wa.me/5493764XXXXXX?text=Hola%20Edgardo%2C%20me%20interesa%20el%20m%C3%B3dulo%20de%20Red%20de%20Revendedores%20para%20AGIAPURR"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#25D366', color: 'white', textDecoration: 'none',
            borderRadius: '10px', padding: '11px 22px',
            fontWeight: 700, fontSize: '0.92rem', whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)', flexShrink: 0
          }}
        >
          💬 Hablemos por WhatsApp
        </a>
      </div>

    </div>
  );
}
