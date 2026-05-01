import React, { useState } from 'react';

const SYSTEM_URL = window.location.origin;
const ACCESS_PASSWORD = 'cristoFer_1123';

const StudioLogo = ({ size = 22 }) => (
  <svg
    viewBox="0 0 14 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: size * 0.636, height: size, display: 'block' }}
    aria-hidden="true"
  >
    <rect x="0" y="0" width="3.5" height="22" rx="1.75" fill="#c9a227" />
    <rect x="0" y="0" width="11" height="3.5" rx="1.75" fill="#c9a227" />
    <rect x="0" y="18.5" width="11" height="3.5" rx="1.75" fill="#c9a227" />
  </svg>
);

const modules = [
  { icon: '📊', name: 'Dashboard', desc: 'Resumen financiero en tiempo real' },
  { icon: '🛒', name: 'Compras', desc: 'Ingreso de mercadería y lotes' },
  { icon: '💰', name: 'Ventas', desc: 'Registro de ventas con descuento FIFO' },
  { icon: '🧾', name: 'Gastos', desc: 'Control de gastos operativos' },
  { icon: '📦', name: 'Stock', desc: 'Inventario actualizado automáticamente' },
  { icon: '⚖️', name: 'Distribución', desc: 'Control de carne en manos de empleados' },
  { icon: '👥', name: 'Clientes', desc: 'Perfiles con precios personalizados' },
  { icon: '🌐', name: 'Catálogo Público', desc: 'Vidriera B2B para pedidos mayoristas' },
];

const flows = [
  {
    step: '01',
    title: 'Registrar una compra',
    desc: 'Ir a Compras → Nueva Compra → ingresar producto, cantidad en kg, costo unitario y fecha. El stock se actualiza automáticamente.',
  },
  {
    step: '02',
    title: 'Registrar una venta',
    desc: 'Ir a Ventas → Nueva Venta → elegir producto, kg vendidos y precio. El sistema descuenta del stock usando el método FIFO (primero entrado, primero salido).',
  },
  {
    step: '03',
    title: 'Crear cliente con precios personalizados',
    desc: 'Ir a Clientes → Nuevo Cliente → completar datos y asignar precios por producto. Ese cliente verá sus precios exclusivos en el catálogo.',
  },
  {
    step: '04',
    title: 'Cobro rápido vía catálogo',
    desc: 'El cliente ingresa al Catálogo Público, agrega productos al carrito y presiona "Enviar Pedido". El pedido llega directo a WhatsApp con el detalle completo.',
  },
];

export default function Entrega() {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handlePrint = () => window.print();

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

  if (!unlocked) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0f172a', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px', padding: '2.5rem 2rem', width: '100%', maxWidth: '380px',
          backdropFilter: 'blur(20px)', textAlign: 'center'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <svg viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg"
              style={{ width: 28, height: 44, margin: '0 auto 1rem' }}>
              <rect x="0" y="0" width="3.5" height="22" rx="1.75" fill="#c9a227"/>
              <rect x="0" y="0" width="11" height="3.5" rx="1.75" fill="#c9a227"/>
              <rect x="0" y="18.5" width="11" height="3.5" rx="1.75" fill="#c9a227"/>
            </svg>
            <h2 style={{ color: 'white', margin: '0 0 0.25rem', fontSize: '1.3rem', fontWeight: 700 }}>
              Documento de Entrega
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              Ingresá la contraseña para acceder
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
              background: 'linear-gradient(to right, #f97316, #ea580c)',
              color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer'
            }}>
              Ingresar
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

        .entrega-root {
          min-height: 100vh;
          background: #0f172a;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #e2e8f0;
          padding: 2rem 1rem 4rem;
          box-sizing: border-box;
        }

        .entrega-inner {
          max-width: 860px;
          margin: 0 auto;
        }

        /* ── HEADER ── */
        .entrega-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
          padding: 2rem 2.5rem;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          margin-bottom: 2rem;
        }

        .entrega-header-brand {
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }

        .entrega-header-brand-text {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .entrega-brand-name {
          font-size: 1rem;
          font-weight: 700;
          color: #c9a227;
          letter-spacing: 0.02em;
          line-height: 1;
        }

        .entrega-brand-tagline {
          font-size: 0.7rem;
          color: rgba(201,162,39,0.65);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          line-height: 1;
        }

        .entrega-header-center {
          text-align: center;
        }

        .entrega-doc-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.01em;
          margin: 0 0 0.25rem;
        }

        .entrega-doc-date {
          font-size: 0.85rem;
          color: #94a3b8;
          margin: 0;
        }

        .entrega-print-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(249,115,22,0.12);
          border: 1px solid rgba(249,115,22,0.35);
          color: #f97316;
          padding: 0.6rem 1.25rem;
          border-radius: 50px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .entrega-print-btn:hover {
          background: rgba(249,115,22,0.22);
          border-color: #f97316;
        }

        /* ── SECTION ── */
        .entrega-section {
          background: rgba(255,255,255,0.035);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 2rem 2.5rem;
          margin-bottom: 1.5rem;
        }

        .entrega-section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #f97316;
          letter-spacing: 0.01em;
          margin: 0 0 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .entrega-section-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(249,115,22,0.2);
          border-radius: 2px;
        }

        /* ── SISTEMA ENTREGADO ── */
        .entrega-sistema-nombre {
          font-size: 1.4rem;
          font-weight: 800;
          color: #f1f5f9;
          margin: 0 0 0.5rem;
        }

        .entrega-sistema-desc {
          color: #94a3b8;
          line-height: 1.65;
          margin: 0 0 1.5rem;
          font-size: 0.95rem;
        }

        .entrega-url-row {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          flex-wrap: wrap;
        }

        .entrega-url-chip {
          font-family: 'Courier New', monospace;
          font-size: 0.85rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #cbd5e1;
          padding: 0.5rem 0.875rem;
          border-radius: 8px;
          word-break: break-all;
        }

        .entrega-access-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #f97316;
          color: white;
          border: none;
          padding: 0.6rem 1.375rem;
          border-radius: 50px;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(249,115,22,0.35);
          white-space: nowrap;
        }

        .entrega-access-btn:hover {
          background: #ea6c0a;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(249,115,22,0.45);
        }

        /* ── CREDENCIALES ── */
        .entrega-creds-box {
          background: rgba(249,115,22,0.06);
          border: 1.5px solid rgba(249,115,22,0.3);
          border-radius: 12px;
          padding: 1.5rem 1.75rem;
          margin-bottom: 1rem;
        }

        .entrega-creds-grid {
          display: grid;
          gap: 0.875rem;
        }

        .entrega-cred-row {
          display: grid;
          grid-template-columns: 130px 1fr;
          gap: 0.75rem;
          align-items: center;
        }

        .entrega-cred-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .entrega-cred-value {
          font-size: 0.92rem;
          color: #f1f5f9;
          font-weight: 500;
          word-break: break-all;
        }

        .entrega-cred-value.mono {
          font-family: 'Courier New', monospace;
          font-size: 0.87rem;
          background: rgba(255,255,255,0.06);
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          display: inline-block;
        }

        .entrega-cred-value.muted {
          color: #64748b;
          font-style: italic;
        }

        .entrega-creds-note {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.82rem;
          color: #c9a227;
          margin-top: 0.25rem;
        }

        /* ── INSTALACIÓN ── */
        .entrega-install-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .entrega-install-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
        }

        .entrega-install-card-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .entrega-install-steps {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          counter-reset: step-counter;
        }

        .entrega-install-steps li {
          counter-increment: step-counter;
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          font-size: 0.87rem;
          color: #94a3b8;
          line-height: 1.5;
        }

        .entrega-install-steps li::before {
          content: counter(step-counter);
          min-width: 20px;
          height: 20px;
          background: rgba(249,115,22,0.15);
          border: 1px solid rgba(249,115,22,0.3);
          color: #f97316;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* ── MÓDULOS ── */
        .entrega-modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 0.875rem;
        }

        .entrega-module-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 1rem 1.125rem;
          transition: border-color 0.2s, background 0.2s;
        }

        .entrega-module-card:hover {
          background: rgba(249,115,22,0.05);
          border-color: rgba(249,115,22,0.2);
        }

        .entrega-module-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          display: block;
        }

        .entrega-module-name {
          font-size: 0.92rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 0.25rem;
        }

        .entrega-module-desc {
          font-size: 0.78rem;
          color: #64748b;
          margin: 0;
          line-height: 1.4;
        }

        /* ── GUÍA RÁPIDA ── */
        .entrega-flows {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }

        .entrega-flow-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 1.125rem 1.375rem;
          transition: border-color 0.2s;
        }

        .entrega-flow-card:hover {
          border-color: rgba(249,115,22,0.2);
        }

        .entrega-flow-step {
          font-size: 1.75rem;
          font-weight: 800;
          color: rgba(249,115,22,0.25);
          line-height: 1;
          flex-shrink: 0;
          min-width: 2.5rem;
          font-variant-numeric: tabular-nums;
        }

        .entrega-flow-content {}

        .entrega-flow-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 0.3rem;
        }

        .entrega-flow-desc {
          font-size: 0.85rem;
          color: #94a3b8;
          margin: 0;
          line-height: 1.55;
        }

        /* ── SOPORTE ── */
        .entrega-soporte-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .entrega-soporte-text {
          color: #94a3b8;
          font-size: 0.92rem;
          margin: 0;
          max-width: 480px;
          line-height: 1.6;
        }

        .entrega-soporte-email {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #f97316;
          padding: 0.65rem 1.25rem;
          border-radius: 50px;
          font-size: 0.88rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .entrega-soporte-email:hover {
          background: rgba(249,115,22,0.1);
          border-color: rgba(249,115,22,0.3);
        }

        /* ── FOOTER ── */
        .entrega-footer {
          text-align: center;
          padding: 1.5rem 1rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .entrega-footer-brand {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .entrega-footer-brand-text {
          display: flex;
          flex-direction: column;
          gap: 0.05rem;
          text-align: left;
        }

        .entrega-footer-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #c9a227;
          line-height: 1;
        }

        .entrega-footer-tagline {
          font-size: 0.65rem;
          color: rgba(201,162,39,0.55);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          line-height: 1;
        }

        .entrega-footer-copy {
          font-size: 0.78rem;
          color: #334155;
          margin: 0;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 640px) {
          .entrega-section {
            padding: 1.5rem 1.25rem;
          }
          .entrega-header {
            padding: 1.5rem 1.25rem;
            justify-content: center;
            text-align: center;
          }
          .entrega-header-brand {
            display: none;
          }
          .entrega-install-grid {
            grid-template-columns: 1fr;
          }
          .entrega-modules-grid {
            grid-template-columns: 1fr 1fr;
          }
          .entrega-cred-row {
            grid-template-columns: 110px 1fr;
          }
          .entrega-soporte-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .entrega-doc-title {
            font-size: 1.3rem;
          }
        }

        @media (max-width: 400px) {
          .entrega-modules-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ── PRINT ── */
        @media print {
          .entrega-root {
            background: #ffffff !important;
            color: #1e293b !important;
            padding: 0 !important;
          }
          .entrega-header,
          .entrega-section {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            backdrop-filter: none !important;
            box-shadow: none !important;
          }
          .entrega-section-title {
            color: #ea580c !important;
          }
          .entrega-section-title::after {
            background: #fde8d8 !important;
          }
          .entrega-doc-title {
            color: #1e293b !important;
          }
          .entrega-doc-date,
          .entrega-sistema-desc,
          .entrega-cred-value,
          .entrega-flow-desc,
          .entrega-soporte-text,
          .entrega-install-steps li {
            color: #475569 !important;
          }
          .entrega-cred-label {
            color: #64748b !important;
          }
          .entrega-sistema-nombre,
          .entrega-flow-title,
          .entrega-module-name,
          .entrega-install-card-title {
            color: #1e293b !important;
          }
          .entrega-brand-name,
          .entrega-footer-name {
            color: #b7911e !important;
          }
          .entrega-brand-tagline,
          .entrega-footer-tagline {
            color: #b7911e !important;
            opacity: 0.7 !important;
          }
          .entrega-creds-box {
            background: #fff8f2 !important;
            border-color: #fbd5b2 !important;
          }
          .entrega-cred-value.mono {
            background: #f1f5f9 !important;
            color: #334155 !important;
          }
          .entrega-url-chip {
            background: #f1f5f9 !important;
            border-color: #e2e8f0 !important;
            color: #334155 !important;
          }
          .entrega-module-card,
          .entrega-flow-card,
          .entrega-install-card {
            background: #f8fafc !important;
            border-color: #e2e8f0 !important;
          }
          .entrega-module-desc {
            color: #64748b !important;
          }
          .entrega-creds-note {
            color: #b7911e !important;
          }
          .entrega-footer-copy {
            color: #94a3b8 !important;
          }
          .entrega-print-btn {
            display: none !important;
          }
          .entrega-access-btn {
            background: #ea580c !important;
          }
          .entrega-soporte-email {
            color: #ea580c !important;
            background: #fff7f2 !important;
            border-color: #fbd5b2 !important;
          }
          .entrega-flow-step {
            color: rgba(234,88,12,0.25) !important;
          }
          .entrega-install-steps li::before {
            background: #fff7f2 !important;
            color: #ea580c !important;
            border-color: #fbd5b2 !important;
          }
        }
      `}</style>

      <div className="entrega-root">
        <div className="entrega-inner">

          {/* ── HEADER ── */}
          <header className="entrega-header">
            <div className="entrega-header-brand">
              <StudioLogo size={34} />
              <div className="entrega-header-brand-text">
                <span className="entrega-brand-name">Studio Lamas</span>
                <span className="entrega-brand-tagline">Desarrollo Digital</span>
              </div>
            </div>

            <div className="entrega-header-center">
              <h1 className="entrega-doc-title">Documento de Entrega</h1>
              <p className="entrega-doc-date">28 de marzo de 2026</p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="entrega-print-btn" onClick={handlePrint}>
                🖨️ Imprimir / Guardar PDF
              </button>
              <button className="entrega-print-btn" onClick={() => window.location.href = window.location.pathname}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}>
                ← Volver al sistema
              </button>
            </div>
          </header>

          {/* ── SISTEMA ENTREGADO ── */}
          <section className="entrega-section">
            <h2 className="entrega-section-title">Sistema entregado</h2>
            <h3 className="entrega-sistema-nombre">Gestión Sabri — Panel de Control</h3>
            <p className="entrega-sistema-desc">
              Sistema integral de gestión para carnicería mayorista. Incluye control de stock en tiempo real,
              registro de compras y ventas con método FIFO, administración de gastos operativos, gestión de
              clientes con precios personalizados, distribución de mercadería entre empleados y catálogo
              público B2B para pedidos mayoristas vía WhatsApp.
            </p>
            <div className="entrega-url-row">
              <span className="entrega-url-chip">{SYSTEM_URL}</span>
              <a
                className="entrega-access-btn"
                href={SYSTEM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir sistema →
              </a>
            </div>
          </section>

          {/* ── CREDENCIALES ── */}
          <section className="entrega-section">
            <h2 className="entrega-section-title">Credenciales de acceso</h2>
            <div className="entrega-creds-box">
              <div className="entrega-creds-grid">
                <div className="entrega-cred-row">
                  <span className="entrega-cred-label">URL</span>
                  <span className="entrega-cred-value mono">{SYSTEM_URL}</span>
                </div>
                <div className="entrega-cred-row">
                  <span className="entrega-cred-label">Email</span>
                  <span className="entrega-cred-value mono">cristofermartiez@gmail.com</span>
                </div>
                <div className="entrega-cred-row">
                  <span className="entrega-cred-label">Contraseña</span>
                  <span className="entrega-cred-value muted">la que configuraste al crear el usuario</span>
                </div>
              </div>
            </div>
            <p className="entrega-creds-note">
              <span>⚠️</span>
              <span>Guardá estas credenciales en un lugar seguro. No las compartas con terceros.</span>
            </p>
          </section>

          {/* ── INSTALACIÓN EN CELULAR ── */}
          <section className="entrega-section">
            <h2 className="entrega-section-title">Instalación en celular</h2>
            <div className="entrega-install-grid">
              <div className="entrega-install-card">
                <h3 className="entrega-install-card-title">
                  <span>🍎</span> iPhone (Safari)
                </h3>
                <ol className="entrega-install-steps">
                  <li>Abrir Safari y navegar a la URL del sistema</li>
                  <li>Tocar el ícono de compartir (cuadrado con flecha hacia arriba)</li>
                  <li>Desplazarse y tocar <strong>"Agregar a pantalla de inicio"</strong></li>
                  <li>Confirmar el nombre y tocar <strong>"Agregar"</strong></li>
                  <li>El ícono aparece en el home — funciona como app nativa</li>
                </ol>
              </div>
              <div className="entrega-install-card">
                <h3 className="entrega-install-card-title">
                  <span>🤖</span> Android (Chrome)
                </h3>
                <ol className="entrega-install-steps">
                  <li>Abrir Chrome y navegar a la URL del sistema</li>
                  <li>Tocar el menú de tres puntos (⋮) en la esquina superior derecha</li>
                  <li>Tocar <strong>"Agregar a pantalla de inicio"</strong> o <strong>"Instalar app"</strong></li>
                  <li>Confirmar tocando <strong>"Agregar"</strong> en el diálogo</li>
                  <li>El ícono aparece en el home — acceso directo y rápido</li>
                </ol>
              </div>
            </div>
          </section>

          {/* ── MÓDULOS INCLUIDOS ── */}
          <section className="entrega-section">
            <h2 className="entrega-section-title">Módulos incluidos</h2>
            <div className="entrega-modules-grid">
              {modules.map((mod) => (
                <div key={mod.name} className="entrega-module-card">
                  <span className="entrega-module-icon">{mod.icon}</span>
                  <p className="entrega-module-name">{mod.name}</p>
                  <p className="entrega-module-desc">{mod.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── GUÍA RÁPIDA ── */}
          <section className="entrega-section">
            <h2 className="entrega-section-title">Guía rápida de uso</h2>
            <div className="entrega-flows">
              {flows.map((f) => (
                <div key={f.step} className="entrega-flow-card">
                  <span className="entrega-flow-step">{f.step}</span>
                  <div className="entrega-flow-content">
                    <p className="entrega-flow-title">{f.title}</p>
                    <p className="entrega-flow-desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── SOPORTE ── */}
          <section className="entrega-section">
            <h2 className="entrega-section-title">Soporte y contacto</h2>
            <div className="entrega-soporte-row">
              <p className="entrega-soporte-text">
                Ante cualquier consulta, duda de uso o inconveniente técnico, contactate directamente.
                La atención es personalizada — respondemos a la brevedad.
              </p>
              <a
                className="entrega-soporte-email"
                href="mailto:edgardolaas2000@gmail.com"
              >
                ✉️ edgardolaas2000@gmail.com
              </a>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer className="entrega-footer">
            <div className="entrega-footer-brand">
              <StudioLogo size={28} />
              <div className="entrega-footer-brand-text">
                <span className="entrega-footer-name">Studio Lamas</span>
                <span className="entrega-footer-tagline">Desarrollo Digital</span>
              </div>
            </div>
            <p className="entrega-footer-copy">
              © 2026 Edgardo Lamas · Studio Lamas Desarrollo Digital
            </p>
          </footer>

        </div>
      </div>
    </>
  );
}
