import React from 'react';

const WHATSAPP = 'https://wa.me/5493764XXXXXX?text=Hola%20Edgardo%2C%20quiero%20avanzar%20con%20el%20sistema%20AGIAPURR%20Gesti%C3%B3n';

const StudioLogo = ({ size = 22 }) => (
  <svg viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ width: size * 0.636, height: size, display: 'block' }} aria-hidden="true">
    <rect x="0" y="0" width="3.5" height="22" rx="1.75" fill="#c9a227"/>
    <rect x="0" y="0" width="11" height="3.5" rx="1.75" fill="#c9a227"/>
    <rect x="0" y="9.25" width="8" height="3.5" rx="1.75" fill="#c9a227"/>
    <rect x="0" y="18.5" width="11" height="3.5" rx="1.75" fill="#c9a227"/>
  </svg>
);

const MODULOS_ACTUALES = [
  { icon: '📊', name: 'Dashboard en tiempo real', desc: 'Ingresos, ganancia bruta, resultado del mes y stock valorizado. Los números se actualizan solos, sin recalcular nada.' },
  { icon: '📦', name: 'Stock con método FIFO', desc: 'Cada venta descuenta del lote más antiguo primero. El costo promedio ponderado se recalcula automáticamente con cada compra.' },
  { icon: '🛒', name: 'Compras y lotes', desc: 'Cada ingreso de mercadería registra el costo unitario y fecha. El sistema lo incorpora al FIFO sin intervención.' },
  { icon: '💰', name: 'Ventas con ganancia real', desc: 'Cada venta muestra la ganancia real usando el costo FIFO del lote consumido. Sin estimaciones.' },
  { icon: '📋', name: 'Gastos operativos', desc: 'Registro de egresos por categoría: combustible, alquiler, marketing, etc. Impactan directo en el resultado del período.' },
  { icon: '💵', name: 'Caja diaria', desc: 'Apertura de caja con saldo inicial, registro de movimientos por medio de pago (efectivo, transferencia, cheque) y cierre del día.' },
  { icon: '🤝', name: 'Clientes con precios propios', desc: 'Cada cliente tiene su margen o precio fijo por producto. El precio se calcula solo al registrar la venta o mostrarse en el portal.' },
  { icon: '🛍️', name: 'Catálogo B2B público', desc: 'Vidriera online con stock en tiempo real para que clientes mayoristas exploren el catálogo y generen pedidos por WhatsApp. Sin login.' },
  { icon: '📲', name: 'Portal de pedidos (PWA)', desc: 'Link único por cliente para que haga sus pedidos desde el celular. Instalable como app. Sus precios, su stock, sin llamadas.' },
  { icon: '🔔', name: 'Recepción de pedidos', desc: 'Los pedidos llegan al panel con alerta sonora y notificación del navegador. Gladys los aprueba, rechaza o crea manualmente.' },
  { icon: '📦', name: 'Panel de Armado', desc: 'Checklist por pedido para el depósito. Cuando todos los ítems están tildados, se habilita el botón "Despachar". Se actualiza en tiempo real.' },
  { icon: '🚚', name: 'Panel del Repartidor', desc: 'Hoja de ruta del día en el celular. Abre Google Maps con cada destino. Confirma entrega con observaciones. Historial de entregas.' },
  { icon: '💬', name: 'Mensajes internos por pedido', desc: 'Recepción, Armado y Repartidor se comunican dentro de cada pedido. Sin WhatsApp grupal, sin confusiones.' },
  { icon: '🏭', name: 'Pedidos a proveedores', desc: 'El sistema analiza el stock actual vs. velocidad de ventas, estima días restantes y sugiere cantidades a pedir. Genera la orden con un click.' },
  { icon: '🤖', name: 'AGI — Asistente IA', desc: 'Consultas en lenguaje natural sobre stock, ventas y pedidos. Experto en yerba mate misionera. Genera contenido SEO y textos para redes y WhatsApp.' },
];

const COMPARATIVA = [
  {
    aspecto: 'Acceso al sistema',
    gds: 'Instalación en PC con Windows. Para usar desde otro equipo hay que configurar red local o acceder con escritorio remoto.',
    agi: 'Acceso desde cualquier navegador — PC, tablet o celular. Sin instalación, sin configuraciones.',
  },
  {
    aspecto: 'Interfaz',
    gds: 'Software de escritorio, estilo Windows. Sólido y conocido, con la estética de los sistemas de los 2000s.',
    agi: 'Interfaz moderna, responsiva, con datos en tiempo real. Diseñada para ser intuitiva desde el día uno.',
  },
  {
    aspecto: 'Personalización',
    gds: 'Sistema genérico para cualquier rubro (quioscos, boutiques, ferreterías, etc.). Se adapta parcialmente a cada negocio.',
    agi: 'Construido exclusivamente para AGIAPURR. Cada módulo, nombre y flujo refleja cómo trabaja la distribuidora.',
  },
  {
    aspecto: 'Flujo de pedidos',
    gds: 'Los pedidos se toman por teléfono o WhatsApp y se cargan manualmente en el sistema.',
    agi: 'Flujo digital completo: Portal PWA / WhatsApp / email → Recepción con alerta → Armado con checklist → Reparto en celular → Entrega confirmada. Con mensajes internos entre etapas.',
  },
  {
    aspecto: 'Portal para clientes',
    gds: 'No incluye. Los precios mayoristas se comunican por fuera (WhatsApp, llamada, planilla).',
    agi: 'Cada cliente tiene su link único (PWA instalable en el celular). Ve su catálogo con stock real y sus precios exclusivos. Hace el pedido solo, sin llamar.',
  },
  {
    aspecto: 'Asistente con IA',
    gds: 'No incluye inteligencia artificial integrada.',
    agi: 'AGI responde preguntas en lenguaje natural sobre stock, ventas y pedidos. Además es experto en yerba mate y genera contenido SEO para redes, catálogos y WhatsApp.',
  },
  {
    aspecto: 'Pedidos a proveedores',
    gds: 'No automatizado. El encargado revisa el stock manualmente y elabora el pedido por fuera del sistema.',
    agi: 'El sistema calcula días de stock restantes por producto y sugiere cantidades a pedir para 45 días. La orden se genera con un click.',
  },
  {
    aspecto: 'Red de revendedores',
    gds: 'Módulo separado ("Pedidos por celular") disponible a costo adicional.',
    agi: 'Módulo en desarrollo: portales individuales, comisiones automáticas y panel de control de la red.',
  },
  {
    aspecto: 'Actualizaciones',
    gds: 'Se descargan e instalan manualmente. Requieren intervención del usuario o técnico.',
    agi: 'Automáticas y transparentes. El sistema siempre está en su última versión, sin interrupciones.',
  },
  {
    aspecto: 'Soporte técnico',
    gds: 'Horario comercial: lunes a viernes de 10 a 14hs. Fines de semana solo por mail.',
    agi: 'Atención directa y personalizada. El desarrollador conoce el sistema y el negocio en detalle.',
  },
];

const FLUJO_PEDIDOS = [
  {
    paso: '01',
    color: '#3b82f6',
    icon: '📲',
    titulo: 'El cliente hace su pedido',
    desc: 'Desde su celular, usando su link personal (PWA) o por WhatsApp/email. Ve su catálogo con stock en tiempo real y sus precios exclusivos.',
  },
  {
    paso: '02',
    color: '#f59e0b',
    icon: '🔔',
    titulo: 'Recepción — Gladys',
    desc: 'El pedido aparece en el panel con alerta sonora y notificación del navegador. Gladys lo revisa, aprueba o ajusta en segundos.',
  },
  {
    paso: '03',
    color: '#8b5cf6',
    icon: '📦',
    titulo: 'Armado en el depósito',
    desc: 'El panel de armado muestra el checklist del pedido. Al tildar cada ítem, se habilita el botón "Despachar". El sistema actualiza el stock.',
  },
  {
    paso: '04',
    color: '#0ea5e9',
    icon: '🚚',
    titulo: 'Reparto',
    desc: 'El repartidor ve su hoja de ruta en el celular. Abre Google Maps con cada dirección. Confirma entrega con observaciones.',
  },
  {
    paso: '05',
    color: '#22c55e',
    icon: '✅',
    titulo: 'Entregado y cerrado',
    desc: 'El pedido queda en historial con fecha, hora y observaciones. Todo trazado, sin papel, sin llamadas de seguimiento.',
  },
];

const ROADMAP = [
  {
    fase: 'Fase 2',
    color: '#C9A84C',
    items: [
      { icon: '🧾', name: 'Facturación ARCA/AFIP', desc: 'Facturas A, B, C y tickets directamente desde el sistema, conectado a los webservices de AFIP. Lo que GDS ofrece como módulo pago, integrado en tu sistema propio.' },
      { icon: '🌐', name: 'Red de Revendedores', desc: 'Cada revendedor con su portal, catálogo y comisiones calculadas automáticamente. Vender más sin sumar empleados.' },
      { icon: '📱', name: 'App Mobile (PWA)', desc: 'Instalable en el celular sin App Store. El panel completo en tu bolsillo, con notificaciones de pedidos nuevos.' },
      { icon: '📈', name: 'Reportes y exportación Excel', desc: 'Exportación a Excel y PDF con un click. Comparativas por período, top de productos y ranking de clientes para analizar offline.' },
    ],
  },
  {
    fase: 'Fase 3',
    color: '#3B7A57',
    items: [
      { icon: '💬', name: 'WhatsApp Business Bot', desc: 'Los clientes hacen pedidos por WhatsApp y el sistema los registra automáticamente. AGI responde consultas de stock y precios.' },
      { icon: '📷', name: 'Lector de códigos QR/barras', desc: 'Recepción de mercadería escaneando. Lo que GDS tiene con su módulo, integrado nativamente en el flujo de compras.' },
      { icon: '🏢', name: 'Multi-sucursal', desc: 'Si AGIAPURR crece y abre nuevos puntos, el sistema centraliza todo el stock y ventas en un panel unificado.' },
      { icon: '🖨️', name: 'Impresora fiscal / tickets', desc: 'Compatible con impresoras fiscales habilitadas (HASAR, EPSON, SAM4S). Si necesitan punto de venta físico.' },
    ],
  },
];

const AGI_HOY = [
  { icon: '🔍', text: 'Consultá el stock de cualquier producto en lenguaje natural' },
  { icon: '📊', text: 'Preguntá cuánto vendiste este mes, la semana, o un producto específico' },
  { icon: '🚚', text: 'Ver pedidos pendientes, en armado o despachados sin navegar pantallas' },
  { icon: '💰', text: 'Cuánto ganaste hoy, esta semana, este mes — al instante' },
];

const AGI_ESCALANDO = [
  { icon: '📉', text: 'Alertas automáticas cuando el stock de un producto baja del mínimo' },
  { icon: '🔮', text: 'Predicción de demanda: "este producto suele venderse más en julio"' },
  { icon: '📋', text: 'Reportes narrativos: "Este mes creciste 18% en miel, pero cayeron las esencias"' },
  { icon: '🤝', text: 'Detección de clientes inactivos: "Estos 3 clientes no compran hace 30 días"' },
  { icon: '💬', text: 'Respuestas automáticas por WhatsApp: consultas de precio y stock sin intervención' },
  { icon: '🛒', text: 'Sugerencias de recompra basadas en el historial de ventas' },
];

const AGI_YERBA = [
  { icon: '🌿', text: 'Conoce la diferencia entre yerba con palo, despalada y orgánica — puede explicársela a tus clientes.' },
  { icon: '🏔️', text: 'Sabe qué marcas son de Misiones, cuáles son agroecológicas y cuáles tienen producción propia.' },
  { icon: '📦', text: 'Puede recomendar el producto correcto según el perfil del cliente: dietética, almacén, revendedor.' },
  { icon: '💡', text: 'Responde consultas técnicas de tus clientes sobre beneficios, origen y características de cada producto.' },
];

const AGI_SEO = [
  { icon: '✍️', text: 'Genera descripciones optimizadas para cada producto para el catálogo online o redes sociales.' },
  { icon: '📱', text: 'Redacta publicaciones para Instagram y Facebook con el tono de AGIAPURR, listas para publicar.' },
  { icon: '🔎', text: 'Sugiere palabras clave para posicionar los productos en búsquedas de "yerba orgánica Misiones" o "yerba al por mayor".' },
  { icon: '📧', text: 'Crea textos para mensajes de WhatsApp, catálogos PDF y comunicaciones con clientes mayoristas.' },
];

export default function Propuesta() {
  return (
    <div style={{ fontFamily: 'Nunito, Inter, system-ui, sans-serif', background: '#0f172a', minHeight: '100vh', color: 'white' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        .prop-page { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; }
        .prop-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1.75rem; margin-bottom: 1.5rem; }
        .prop-section-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #C9A84C; margin-bottom: 0.6rem; }
        .prop-h2 { font-size: 1.6rem; font-weight: 900; margin: 0 0 0.5rem; line-height: 1.2; color: white !important; }
        .prop-h3 { font-size: 1.15rem; font-weight: 800; margin: 0 0 1rem; color: white !important; }
        .prop-text { color: rgba(255,255,255,0.7); line-height: 1.65; font-size: 0.93rem; }
        .cmp-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .cmp-table th { padding: 0.75rem 1rem; text-align: left; font-weight: 700; font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; }
        .cmp-table td { padding: 0.85rem 1rem; vertical-align: top; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.05); }
        .cmp-table tr:hover td { background: rgba(255,255,255,0.02); }
        .cmp-aspecto { font-weight: 700; color: rgba(255,255,255,0.85); font-size: 0.82rem; }
        .cmp-gds { color: rgba(255,255,255,0.5); }
        .cmp-agi { color: rgba(255,255,255,0.85); }
        .cmp-agi strong { color: #C9A84C; }
        .mod-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
        .mod-card { background: rgba(59,122,87,0.08); border: 1px solid rgba(59,122,87,0.2); border-radius: 12px; padding: 1.1rem; }
        .mod-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .mod-name { font-weight: 700; font-size: 0.88rem; margin-bottom: 0.3rem; color: white; }
        .mod-desc { font-size: 0.78rem; color: rgba(255,255,255,0.55); line-height: 1.5; }
        .road-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
        .road-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 1.1rem; }
        .road-icon { font-size: 1.3rem; margin-bottom: 0.5rem; }
        .road-name { font-weight: 700; font-size: 0.88rem; color: white; margin-bottom: 0.3rem; }
        .road-desc { font-size: 0.78rem; color: rgba(255,255,255,0.5); line-height: 1.5; }
        .fase-badge { display: inline-block; font-size: 0.65rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; margin-bottom: 1rem; }
        .agi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
        .agi-item { display: flex; align-items: flex-start; gap: 0.6rem; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); }
        .agi-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }
        .agi-text { font-size: 0.8rem; color: rgba(255,255,255,0.7); line-height: 1.45; }
        .print-btn { background: #3B7A57; color: white; border: none; padding: 0.65rem 1.4rem; border-radius: 10px; font-weight: 700; font-size: 0.88rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; transition: background 0.2s; }
        .print-btn:hover { background: #2d6148; }
        @media print {
          body { background: white !important; color: #1a1a1a !important; }
          .prop-page { padding: 0; }
          .prop-card { background: #f8f9fa !important; border-color: #e2e8f0 !important; break-inside: avoid; }
          .prop-text, .cmp-gds, .cmp-agi, .mod-desc, .road-desc, .agi-text { color: #374151 !important; }
          .cmp-aspecto { color: #111 !important; }
          .mod-card, .road-card, .agi-item { background: #f0f7f3 !important; border-color: #c8e0cf !important; }
          .no-print { display: none !important; }
          .prop-h2, .prop-h3, .mod-name, .road-name { color: #111 !important; }
        }
      `}</style>

      <div className="prop-page">

        {/* ── PORTADA ── */}
        <div style={{ textAlign: 'center', padding: '3rem 1rem 2rem', marginBottom: '1.5rem', background: 'linear-gradient(160deg, #0f2218 0%, #1B3A2A 50%, #0f2218 100%)', borderRadius: '20px', border: '1px solid rgba(201,168,76,0.2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 30%, rgba(201,168,76,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌿</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.75rem' }}>Propuesta de sistema</div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 0.5rem', letterSpacing: '-0.5px', color: 'white' }}>AGIAPURR Gestión</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', margin: '0 0 2rem' }}>Sistema digital de gestión para distribuidora de productos naturales</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {[['📅', 'Mayo 2026'], ['🏢', 'Para AGIAPURR Distribuidora'], ['⚡', 'Sistema en producción']].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
                <span>{icon}</span><span>{label}</span>
              </div>
            ))}
          </div>
          <a href="https://studio-lamas.vercel.app" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', opacity: 0.6 }}>
            <StudioLogo size={18} />
            <span style={{ fontSize: '0.72rem', color: 'white', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Studio Lamas — Desarrollo Digital</span>
          </a>
        </div>

        {/* ── BOTONES ── */}
        <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button className="print-btn" onClick={() => window.print()}>🖨️ Imprimir / Guardar PDF</button>
          <button className="print-btn" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => window.location.href = '/'}>← Volver al inicio</button>
        </div>

        {/* ── CONTEXTO ── */}
        <div className="prop-card">
          <div className="prop-section-label">Contexto</div>
          <h2 className="prop-h2">El punto de partida</h2>
          <p className="prop-text" style={{ marginBottom: '1rem' }}>
            Hoy AGIAPURR gestiona su distribuidora con <strong style={{ color: 'white' }}>GDS Sistemas</strong>, una herramienta que acompaña a las pymes argentinas desde 2004 y que muchos negocios conocen bien. Es un sistema probado para lo esencial: facturación, ventas, stock básico.
          </p>
          <p className="prop-text">
            Pero distribuir productos naturales en 2026 requiere más que registrar ventas. Requiere <strong style={{ color: '#C9A84C' }}>visibilidad en tiempo real</strong>, un canal digital para que los clientes hagan sus pedidos, un flujo organizado de despacho, y la flexibilidad de crecer sin cambiar de sistema cada vez que el negocio da un salto. Eso es lo que construimos.
          </p>
        </div>

        {/* ── COMPARATIVA ── */}
        <div className="prop-card">
          <div className="prop-section-label">Comparativa</div>
          <h2 className="prop-h2">Sistema actual vs AGIAPURR Gestión</h2>
          <p className="prop-text" style={{ marginBottom: '1.5rem' }}>Ambos sistemas cubren las necesidades básicas de gestión. La diferencia está en el enfoque, la tecnología y las posibilidades de crecimiento.</p>
          <div style={{ overflowX: 'auto' }}>
            <table className="cmp-table">
              <thead>
                <tr>
                  <th style={{ color: 'rgba(255,255,255,0.4)', width: '18%' }}></th>
                  <th style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.03)', borderRadius: '8px 8px 0 0', width: '38%' }}>Sistema Actual (GDS)</th>
                  <th style={{ color: '#C9A84C', background: 'rgba(59,122,87,0.1)', borderRadius: '8px 8px 0 0', width: '44%' }}>✦ AGIAPURR Gestión</th>
                </tr>
              </thead>
              <tbody>
                {COMPARATIVA.map((row, i) => (
                  <tr key={i}>
                    <td className="cmp-aspecto">{row.aspecto}</td>
                    <td className="cmp-gds">{row.gds}</td>
                    <td className="cmp-agi" style={{ background: 'rgba(59,122,87,0.04)' }}>{row.agi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── VENTAJAS CLOUD ── */}
        <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.04))', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="prop-section-label">Ventajas inmediatas</div>
          <h3 className="prop-h3" style={{ marginBottom: '1rem' }}>Tres cosas que cambian desde el día uno</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '☁️', title: 'Datos siempre seguros', desc: 'Si se daña o cambia la computadora, no se pierde nada. Todo está en la nube, respaldado automáticamente.' },
              { icon: '🔑', title: 'Sin licencias por equipo', desc: 'No hay que pedir permisos ni instalar nada cuando se cambia de PC o se suma una computadora nueva.' },
              { icon: '📲', title: 'Acceso desde el celular', desc: 'Entrá desde cualquier dispositivo para ver cómo van las ventas, el stock o los pedidos del día — estés donde estés.' },
            ].map((v, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{v.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#C9A84C', marginBottom: '0.25rem' }}>✓ {v.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MÓDULOS ACTUALES ── */}
        <div className="prop-card">
          <div className="prop-section-label">Ya en producción</div>
          <h2 className="prop-h2">Lo que AGIAPURR ya tiene funcionando</h2>
          <p className="prop-text" style={{ marginBottom: '1.25rem' }}>Estos módulos están activos, con datos reales, y disponibles para usar desde hoy.</p>
          <div className="mod-grid">
            {MODULOS_ACTUALES.map((m, i) => (
              <div key={i} className="mod-card">
                <div className="mod-icon">{m.icon}</div>
                <div className="mod-name">{m.name}</div>
                <div className="mod-desc">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FLUJO DE PEDIDOS ── */}
        <div className="prop-card">
          <div className="prop-section-label">El corazón del sistema</div>
          <h2 className="prop-h2">Del pedido a la entrega — sin papel, sin llamadas</h2>
          <p className="prop-text" style={{ marginBottom: '1.5rem' }}>
            Este es el flujo completo que diferencia al sistema de cualquier planilla o software genérico. Cada etapa actualiza la siguiente en tiempo real. Cada actor del equipo ve solo lo que necesita ver.
          </p>

          {/* Pasos del flujo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {FLUJO_PEDIDOS.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: '50%', background: f.color + '22', border: `2px solid ${f.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: f.color, letterSpacing: '0.04em' }}>{f.paso}</div>
                <div style={{ flex: 1, paddingTop: '0.15rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'white', marginBottom: '0.2rem' }}>{f.icon} {f.titulo}</div>
                  <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.55 }}>{f.desc}</div>
                </div>
                {i < FLUJO_PEDIDOS.length - 1 && (
                  <div style={{ position: 'absolute', display: 'none' }} />
                )}
              </div>
            ))}
          </div>

          {/* PWA explicado */}
          <div style={{ background: 'rgba(59,122,87,0.1)', border: '1px solid rgba(59,122,87,0.25)', borderRadius: '12px', padding: '1.1rem', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#3B7A57', marginBottom: '0.4rem' }}>📲 ¿Qué es una PWA?</div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
              <strong style={{ color: 'white' }}>Progressive Web App</strong> — es una web que funciona y se instala como una app nativa. Tu cliente abre el link desde el celular, toca "Agregar a pantalla de inicio" y queda como un ícono, exactamente igual a Instagram o WhatsApp. <strong style={{ color: 'white' }}>Sin pasar por la App Store. Sin descargas. Sin actualizaciones manuales.</strong> Cada vez que entra, ve sus precios actualizados y el stock real.
            </p>
          </div>

          {/* Mensajes internos */}
          <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', padding: '1.1rem', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#a78bfa', marginBottom: '0.4rem' }}>💬 Mensajes internos por pedido</div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
              Recepción, Armado y Repartidor tienen un canal de comunicación propio <strong style={{ color: 'white' }}>dentro de cada pedido</strong>. Si falta un producto, si el cliente pide un cambio, si hay un problema en la entrega — queda registrado en el pedido, no en un chat grupal que nadie puede ordenar después.
            </p>
          </div>

          {/* Pedidos a proveedores */}
          <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '12px', padding: '1.1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#C9A84C', marginBottom: '0.4rem' }}>🏭 Pedidos a proveedores — inteligente</div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
              El sistema analiza el stock actual de cada producto versus la velocidad de ventas de los últimos 30 días. Calcula cuántos días de stock quedan y sugiere la cantidad a pedir para cubrir los próximos 45 días. <strong style={{ color: 'white' }}>Con un click se genera la orden de compra.</strong> Ya no hace falta revisar planillas ni calcular a mano qué pedir.
            </p>
          </div>
        </div>

        {/* ── ROADMAP ── */}
        <div className="prop-card">
          <div className="prop-section-label">Próximas etapas</div>
          <h2 className="prop-h2">El camino por delante</h2>
          <p className="prop-text" style={{ marginBottom: '1.5rem' }}>
            El sistema está diseñado para crecer con AGIAPURR. Cada funcionalidad nueva se suma al mismo panel — sin cambiar de sistema, sin migrar datos, sin empezar de cero.
            <span style={{ color: '#C9A84C' }}> Todo lo que GDS ofrece como módulo adicional pago, lo podemos integrar de forma nativa.</span>
          </p>
          {ROADMAP.map((fase, fi) => (
            <div key={fi} style={{ marginBottom: fi < ROADMAP.length - 1 ? '1.75rem' : 0 }}>
              <div className="fase-badge" style={{ background: `${fase.color}22`, color: fase.color, border: `1px solid ${fase.color}44` }}>{fase.fase}</div>
              <div className="road-grid">
                {fase.items.map((item, i) => (
                  <div key={i} className="road-card" style={{ borderLeft: `3px solid ${fase.color}66` }}>
                    <div className="road-icon">{item.icon}</div>
                    <div className="road-name">{item.name}</div>
                    <div className="road-desc">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── AGI ── */}
        <div className="prop-card" style={{ background: 'linear-gradient(135deg, rgba(15,34,24,0.8) 0%, rgba(27,58,42,0.6) 100%)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <div className="prop-section-label">Inteligencia artificial</div>
          <h2 className="prop-h2">AGI — Tu asistente inteligente</h2>
          <p className="prop-text" style={{ marginBottom: '1.5rem' }}>
            AGI no es un chatbot genérico. Es un asistente entrenado sobre tu propio sistema: conoce tu stock, tus clientes, tu historial de ventas y tus pedidos. Lo consultás en lenguaje natural y te responde con los datos reales de tu negocio.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.75rem' }}>Lo que hace hoy</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {AGI_HOY.map((item, i) => (
                  <div key={i} className="agi-item">
                    <span className="agi-icon">{item.icon}</span>
                    <span className="agi-text">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3B7A57', marginBottom: '0.75rem' }}>Cómo escala</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {AGI_ESCALANDO.map((item, i) => (
                  <div key={i} className="agi-item">
                    <span className="agi-icon">{item.icon}</span>
                    <span className="agi-text">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Experto en yerba + SEO */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'rgba(59,122,87,0.12)', border: '1px solid rgba(59,122,87,0.25)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3B7A57', marginBottom: '0.75rem' }}>🌿 Experto en yerba mate</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {AGI_YERBA.map((item, i) => (
                  <div key={i} className="agi-item">
                    <span className="agi-icon">{item.icon}</span>
                    <span className="agi-text">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.75rem' }}>📣 SEO y comunicación</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {AGI_SEO.map((item, i) => (
                  <div key={i} className="agi-item">
                    <span className="agi-icon">{item.icon}</span>
                    <span className="agi-text">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '10px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', lineHeight: 1.6 }}>
              "¿Cuánto vendí de yerba mate este mes?" — "¿Qué clientes no compraron en los últimos 30 días?" — "Escribime una descripción para Instagram de la Yerba El Colono orgánica" — AGI responde todo eso en segundos, sin planillas ni agencias.
            </p>
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ background: 'linear-gradient(135deg, #3B7A57, #2d6148)', borderRadius: '16px', padding: '2.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.4rem' }}>¿Seguimos avanzando?</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', maxWidth: 420, lineHeight: 1.6 }}>
              El sistema ya está en producción. El siguiente paso es definir qué módulos de Fase 2 querés activar primero y ajustar cualquier detalle antes del lanzamiento formal.
            </div>
          </div>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="no-print"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: 'white', textDecoration: 'none', borderRadius: '10px', padding: '12px 22px', fontWeight: 700, fontSize: '0.92rem', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.25)', flexShrink: 0 }}>
            💬 Hablemos por WhatsApp
          </a>
        </div>

        {/* ── FOOTER ── */}
        <footer style={{ textAlign: 'center', padding: '2rem 0 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '1.5rem' }}>
          <a href="https://studio-lamas.vercel.app" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', opacity: 0.5, transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}>
            <StudioLogo size={20} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', color: 'white', fontWeight: 700 }}>Studio Lamas</div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Desarrollo Digital</div>
            </div>
          </a>
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>© 2026 Edgardo Lamas · Studio Lamas Desarrollo Digital</p>
        </footer>

      </div>
    </div>
  );
}
