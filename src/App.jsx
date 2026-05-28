import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { mockProductos, mockCompras, mockVentas, mockGastos, mockDistribuciones, mockClientes } from './lib/mockData';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Login from './components/Login';
import {
  LayoutDashboard,
  ShoppingCart,
  BadgeDollarSign,
  Receipt,
  Package,
  Scale,
  Menu,
  X,
  HelpCircle,
  Users,
  Boxes,
  ClipboardList,
  Truck,
  PackageCheck,
  Wallet,
  Store,
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import Purchases from './components/Purchases';
import Sales from './components/Sales';
import Expenses from './components/Expenses';
import Inventory from './components/Inventory';
import RedVendedores from './components/RedVendedores';
import B2BStoreFront from './components/B2BStoreFront';

import ClientProfiles from './components/ClientProfiles';
import PedidosRecepcion from './components/PedidosRecepcion';
import PanelArmado from './components/PanelArmado';
import PanelRepartidor from './components/PanelRepartidor';
import PortalPedidos from './components/PortalPedidos';
import CajaDiaria from './components/CajaDiaria';
import PedidosProveedores from './components/PedidosProveedores';
import Products from './components/Products';
import Entrega from './components/Entrega';
import Propuesta from './components/Propuesta';
import AgentChat from './components/AgentChat';

function AppContent({ currentView, setCurrentView }) {
  const { logout } = useAuth();
  const { addToast } = useToast();

  // Navigation states: 'app' (dashboard) or 'storefront'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Estado con Supabase
  const [productos, setProductos] = useState([]);
  const [compras, setCompras] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [distribuciones, setDistribuciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [descuentos, setDescuentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Funciones de carga inicial
  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: pData, error: pErr }, { data: cData }, { data: vData }, { data: gData }, { data: dData }, { data: clData }, { data: descData }] = await Promise.all([
        supabase.from('productos').select('*').order('nombre'),
        supabase.from('compras').select('*').order('fecha', { ascending: false }),
        supabase.from('ventas').select('*').order('fecha', { ascending: false }),
        supabase.from('gastos').select('*').order('fecha', { ascending: false }),
        supabase.from('distribuciones').select('*').order('fecha', { ascending: false }),
        supabase.from('clientes').select('*').order('nombre'),
        supabase.from('descuentos_cliente_producto').select('*'),
      ]);

      // Si Supabase falla o está pausado, usar datos de demo
      if (pErr || !pData) {
        setProductos(mockProductos);
        setCompras(mockCompras);
        setVentas(mockVentas);
        setGastos(mockGastos);
        setDistribuciones(mockDistribuciones);
        setClientes(mockClientes);
      } else {
        if (pData) setProductos(pData);
        if (cData) setCompras(cData);
        if (vData) setVentas(vData);
        if (gData) setGastos(gData);
        if (dData) setDistribuciones(dData);
        if (clData) setClientes(clData);
        if (descData) setDescuentos(descData);
      }
    } catch (error) {
      console.warn('Supabase no disponible, cargando datos de demo:', error);
      setProductos(mockProductos);
      setCompras(mockCompras);
      setVentas(mockVentas);
      setGastos(mockGastos);
      setDistribuciones(mockDistribuciones);
      setClientes(mockClientes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stock calculado para la interfaz
  const stock_actual = useMemo(() => {
    const stock = {};
    compras.forEach(c => {
      if (!stock[c.producto_id]) stock[c.producto_id] = 0;
      stock[c.producto_id] += c.cantidad_disponible;
    });
    return stock;
  }, [compras]);

  // Costo promedio ponderado por producto (solo lotes con stock disponible)
  const costoPromedio = useMemo(() => {
    const costos = {};
    compras.forEach(c => {
      if (c.cantidad_disponible > 0) {
        if (!costos[c.producto_id]) costos[c.producto_id] = { totalCosto: 0, totalKg: 0 };
        costos[c.producto_id].totalCosto += c.costo_unitario * c.cantidad_disponible;
        costos[c.producto_id].totalKg += c.cantidad_disponible;
      }
    });
    const resultado = {};
    Object.entries(costos).forEach(([id, data]) => {
      resultado[id] = data.totalKg > 0 ? data.totalCosto / data.totalKg : 0;
    });
    return resultado;
  }, [compras]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    closeSidebar();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard compras={compras} ventas={ventas} gastos={gastos} productos={productos} stock_actual={stock_actual} onNavigate={handleTabChange} />;
      case 'purchases': return <Purchases productos={productos} compras={compras} onUpdate={fetchData} />;
      case 'sales': return <Sales productos={productos} compras={compras} ventas={ventas} stock_actual={stock_actual} costoPromedio={costoPromedio} clientes={clientes} descuentos={descuentos} onUpdate={fetchData} />;
      case 'expenses': return <Expenses gastos={gastos} onUpdate={fetchData} />;
      case 'inventory': return <Inventory productos={productos} stock_actual={stock_actual} compras={compras} onUpdate={fetchData} />;
      case 'distribution': return <RedVendedores />;
      case 'clients': return <ClientProfiles clientes={clientes} productos={productos} compras={compras} ventas={ventas} stock_actual={stock_actual} costoPromedio={costoPromedio} onUpdate={fetchData} />;
      case 'products': return <Products productos={productos} compras={compras} ventas={ventas} distribuciones={distribuciones} stock_actual={stock_actual} clientes={clientes} descuentos={descuentos} onUpdate={fetchData} />;
      // sabri-reporte eliminado
      case 'pedidos': return <PedidosRecepcion clientes={clientes} productos={productos} onUpdate={fetchData} />;
      case 'armado': return <PanelArmado onUpdate={fetchData} />;
      case 'reparto': return <PanelRepartidor onUpdate={fetchData} />;
      case 'caja': return <CajaDiaria />;
      case 'proveedores': return <PedidosProveedores />;
      default: return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'purchases', label: 'Compras', icon: ShoppingCart },
    { id: 'sales', label: 'Ventas', icon: BadgeDollarSign },
    { id: 'expenses', label: 'Gastos', icon: Receipt },
    { id: 'inventory', label: 'Stock', icon: Package },
    { id: 'distribution', label: 'Red de Ventas', icon: Users },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'products', label: 'Productos', icon: Boxes },
    { id: 'caja', label: 'Caja', icon: Wallet },
    { id: 'proveedores', label: 'Proveedores', icon: Store },
    { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
    { id: 'armado', label: 'Armado', icon: PackageCheck },
    { id: 'reparto', label: 'Reparto', icon: Truck },
  ];

  return (
    <div className="app-container">

          {/* Carga global */}
          {loading && (
            <div className="global-loader">
              <div className="spinner"></div>
              <p>Cargando datos desde la nube...</p>
            </div>
          )}

          {/* Overlay para móvil */}
          {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

          <nav className={`sidebar glass-card ${isSidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <div className="logo">
                <div className="brand-mark">
                  <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🌿</span>
                  <div>
                    <h2>AGIAPURR</h2>
                    <span className="brand-sub">Distribuidora</span>
                  </div>
                </div>
              </div>
              <button className="mobile-close-btn" onClick={closeSidebar}>
                <X size={24} />
              </button>
            </div>

            <div className="nav-links">
              {navItems.map(item => (
                <button
                  key={item.id}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => handleTabChange(item.id)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="nav-links" style={{ marginTop: 'auto' }}>
              <button
                className="nav-item"
                style={{ color: 'var(--accent)', background: 'rgba(201,168,76,0.1)' }}
                onClick={() => {
                  setCurrentView('storefront');
                  closeSidebar();
                }}
              >
                <Package size={20} />
                <span>Ver Catálogo Público</span>
              </button>
              <button
                className="nav-item"
                style={{ color: '#c9a227', background: 'rgba(201,162,39,0.08)' }}
                onClick={() => {
                  window.open('?view=entrega', '_blank');
                  closeSidebar();
                }}
              >
                <HelpCircle size={20} />
                <span>Documento de Entrega</span>
              </button>
            </div>

            {/* User Section */}
            <div className="user-section">
              <div className="user-avatar">G</div>
              <div className="user-info">
                <span className="user-name">Gladys</span>
                <button
                  onClick={async () => {
                    await logout();
                    addToast('Sesión cerrada correctamente', 'info');
                  }}
                  className="logout-btn"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>

            {/* Studio Lamas signature */}
            <a
              href="https://studio-lamas.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)',
                opacity: 0.4, textDecoration: 'none', transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
            >
              <svg viewBox="0 0 14 22" fill="none" width="10" height="16" aria-hidden="true">
                <rect x="0" y="0" width="3.5" height="22" rx="1.75" fill="#c9a227"/>
                <rect x="0" y="0" width="11" height="3.5" rx="1.75" fill="#c9a227"/>
                <rect x="0" y="9.25" width="8" height="3.5" rx="1.75" fill="#c9a227"/>
                <rect x="0" y="18.5" width="11" height="3.5" rx="1.75" fill="#c9a227"/>
              </svg>
              <span style={{ fontSize: '0.62rem', color: 'white', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Studio Lamas
              </span>
            </a>
          </nav>

          <main className="content">
            <header className="page-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="mobile-menu-btn" onClick={toggleSidebar}>
                  <Menu size={24} />
                </button>
                <h1>{navItems.find(i => i.id === activeTab)?.label}</h1>
              </div>
              <button
                className="help-btn"
                onClick={() => setIsGuideOpen(true)}
                title="Ver Guía de Uso"
              >
                <HelpCircle size={22} />
                <span className="help-text">Guía de Uso</span>
              </button>
            </header>
            <div className="view-container">
              {renderContent()}
            </div>

            {/* Guide Modal */}
            {isGuideOpen && (
              <div className="modal-overlay" onClick={() => setIsGuideOpen(false)}>
                <div className="modal-content guide-modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Guía de Uso: AGIAPURR Gestión</h2>
                    <button className="icon-btn delete" onClick={() => setIsGuideOpen(false)}>
                      <X size={20} />
                    </button>
                  </div>
                  <div className="modal-body user-guide">

                    <p style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', fontSize: '0.88rem', color: '#166534', marginBottom: '1.5rem' }}>
                      💡 Esta guía explica cada módulo del sistema. Podés leerla completa la primera vez, o volver a consultarla cuando tengas dudas sobre alguna función específica.
                    </p>

                    <h3>🏠 1. Resumen (Tablero Principal)</h3>
                    <p>
                      Es la primera pantalla que ves al entrar. Te muestra el estado del negocio de un vistazo:
                      <br />— <strong>Reloj y saludo</strong> en tiempo real con la fecha del día.
                      <br />— <strong>Accesos rápidos</strong>: botones para ir directo a Nueva Venta, Pedidos pendientes y Caja del Día.
                      <br />— <strong>KPIs del mes</strong>: ingresos, ganancia bruta, gastos y stock valorizado.
                      <br />— <strong>Mini calendario</strong>: los días con ventas aparecen marcados con un punto verde.
                      <br />— <strong>Ranking de productos</strong>: los más vendidos del período seleccionado.
                    </p>

                    <h3>🛒 2. Compras (Ingreso de Mercadería)</h3>
                    <p>
                      Todo empieza aquí. Cada vez que recibís mercadería de un proveedor, registrás la compra en este módulo.
                      <br />— Ingresás el producto, la cantidad y el costo unitario de ese lote.
                      <br />— El sistema suma automáticamente las unidades al <strong>Stock</strong> disponible.
                      <br />— Cada lote queda registrado con su costo propio — esto es la base del cálculo de ganancia real.
                      <br /><em>Tip: Si el producto no existe todavía, crealo primero en el módulo Productos.</em>
                    </p>

                    <h3>💰 3. Ventas (Salida de Mercadería)</h3>
                    <p>
                      Registrás cada venta que hacés a un cliente.
                      <br />— Seleccionás el producto y la cantidad vendida.
                      <br />— El sistema descuenta el stock automáticamente usando <strong>método FIFO</strong>: siempre consume primero el lote más antiguo.
                      <br />— Calcula la <strong>ganancia real</strong> de esa venta comparando el precio de venta con el costo real del lote utilizado.
                      <br />— Podés asociar la venta a un cliente para tener historial por cuenta.
                    </p>

                    <h3>📋 4. Gastos (Egresos Operativos)</h3>
                    <p>
                      Registrás todos los gastos del negocio que no son compras de mercadería: combustible, alquiler, packaging, publicidad, sueldos, etc.
                      <br />— Cada gasto tiene categoría, fecha y monto.
                      <br />— Aparecen restados en los KPIs del Resumen para que la ganancia neta sea real.
                    </p>

                    <h3>📦 5. Stock (Inventario Actual)</h3>
                    <p>
                      Vista de todo lo que tenés disponible en este momento.
                      <br />— Muestra el <strong>stock actual</strong> de cada producto (suma de los lotes disponibles).
                      <br />— Muestra el <strong>costo promedio ponderado</strong>: si compraste el mismo producto a distintos precios, el sistema promedia automáticamente.
                      <br />— Podés actualizar precios de catálogo desde aquí.
                      <br /><em>Tip: Si un producto muestra stock 0 o negativo, revisá si hay ventas sin lote de compra asociado.</em>
                    </p>

                    <h3>👥 6. Clientes</h3>
                    <p>
                      ABM (alta, baja y modificación) de tus clientes.
                      <br />— Podés ver el historial de compras de cada cliente.
                      <br />— Configurás <strong>precios personalizados por producto</strong>: si a un cliente mayorista le vendés a precio especial, lo configurás aquí y el sistema lo aplica automáticamente.
                      <br />— Cada cliente tiene un <strong>link único</strong> para el Portal de Pedidos (ver sección 12).
                    </p>

                    <h3>🏷️ 7. Productos</h3>
                    <p>
                      El catálogo de todo lo que vendés.
                      <br />— Creás y editás productos con nombre, costo de referencia y margen de ganancia.
                      <br />— El <strong>precio de venta</strong> se calcula automáticamente: costo + margen.
                      <br />— Podés ocultar productos del catálogo público sin eliminarlos.
                      <br /><em>Tip: El nombre del producto debe incluir la marca al principio seguida de guión largo (—) para que el módulo de Proveedores agrupe correctamente. Ejemplo: "El Colono — Yerba Mate 1kg".</em>
                    </p>

                    <h3>💵 8. Caja Diaria</h3>
                    <p>
                      Registro del efectivo y movimientos del día.
                      <br />— Al empezar el día, abrís la caja con el monto inicial (lo que tenés en efectivo).
                      <br />— Registrás cada <strong>ingreso</strong> (ventas en efectivo, cobros, transferencias) y cada <strong>egreso</strong> (compras, pagos, gastos, retiros).
                      <br />— El sistema calcula el <strong>saldo actual</strong> en tiempo real: monto inicial + ingresos − egresos.
                      <br />— Al cerrar el día, cerrás la caja. Al día siguiente se abre una nueva.
                    </p>

                    <h3>🏭 9. Proveedores (Pedidos a Proveedores)</h3>
                    <p>
                      El sistema analiza tu stock y tus ventas para sugerirte qué pedir y cuánto.
                      <br />— La columna <strong>Días est.</strong> indica cuántos días de stock te quedan al ritmo de ventas actual: rojo = menos de 7 días, amarillo = menos de 15 días, verde = OK.
                      <br />— La columna <strong>Sugerido</strong> calcula la cantidad recomendada para cubrir los próximos 45 días.
                      <br />— Hacés clic en las filas que querés pedir, ajustás la cantidad si hace falta, y apretás <strong>Generar</strong>.
                      <br />— El sistema agrupa los productos por proveedor y crea un pedido por cada uno.
                      <br />— En la pestaña <strong>Pedidos</strong> podés cambiar el estado: Borrador → Enviado → Recibido.
                    </p>

                    <h3>📬 10. Pedidos — Recepción (Gladys)</h3>
                    <p>
                      Acá llegán todos los pedidos de los clientes, tanto los del portal web como los que cargás vos manualmente.
                      <br />— Ves los pedidos en tiempo real: cuando un cliente confirma desde su celular, aparece instantáneamente.
                      <br />— Podés <strong>Aprobar</strong> o <strong>Cancelar</strong> cada pedido.
                      <br />— Al aprobar, el pedido pasa automáticamente al Panel de Armado.
                      <br />— Dentro de cada pedido podés dejar <strong>notas internas</strong> que verán también Armado y el Repartidor (el ícono 💬).
                      <br /><em>Tip: El sistema emite una notificación de sonido cuando entra un pedido nuevo.</em>
                    </p>

                    <h3>📦 11. Armado (Panel de Depósito)</h3>
                    <p>
                      Panel pensado para la persona que prepara los pedidos físicamente.
                      <br />— Muestra los pedidos aprobados en cola, con el detalle de cada producto y cantidad.
                      <br />— Cada producto tiene un <strong>checkbox</strong>: vas tildando a medida que lo ponés en la caja.
                      <br />— El botón <strong>Despachar</strong> se habilita solo cuando todos los productos están tildados — evita errores.
                      <br />— Al despachar, el pedido pasa al Panel del Repartidor.
                      <br />— También podés dejar notas para el repartidor usando el ícono 💬.
                    </p>

                    <h3>🚚 12. Reparto (Panel del Repartidor)</h3>
                    <p>
                      Panel pensado para usar desde el celular durante el reparto.
                      <br />— Muestra la <strong>hoja de ruta del día</strong>: todos los pedidos despachados con dirección, teléfono y detalle de productos.
                      <br />— El botón <strong>Ver mapa</strong> abre Google Maps directo en la dirección del cliente.
                      <br />— Al entregar, presionás <strong>Entregado</strong>, podés agregar una observación (ej: "dejé con el vecino") y confirmás.
                      <br />— El botón <strong>Ver historial</strong> muestra las últimas entregas realizadas.
                    </p>

                    <h3>🌐 13. Portal de Clientes (PWA)</h3>
                    <p>
                      Cada cliente tiene un <strong>link único</strong> para hacer pedidos desde su celular, sin necesidad de llamar ni mandar WhatsApp.
                      <br />— Muestra el catálogo con stock real y sus precios personalizados.
                      <br />— El cliente arma su carrito y confirma — el pedido llega directo a tu panel de Recepción.
                      <br />— Es una <strong>PWA</strong> (Progressive Web App): el cliente puede instalarla en su celular como si fuera una app, con ícono en la pantalla de inicio.
                      <br /><em>Para compartirle el link a un cliente: entrá a su perfil en Clientes y copiá el link de portal.</em>
                    </p>

                    <h3>🤖 14. Agi — Gestora inteligente del negocio</h3>
                    <p>
                      Agi es tu asistente de inteligencia artificial, disponible en el botón flotante de la esquina inferior derecha. No es un simple chatbot: es una gestora especializada en tu negocio con tres capacidades distintas.
                    </p>
                    <p>
                      <strong>📊 Consultas sobre tu negocio</strong>
                      <br />Tiene acceso en tiempo real a todos los datos del sistema. Podés preguntarle en lenguaje natural:
                      <br />— <em>"¿Cuánto vendimos esta semana?"</em>
                      <br />— <em>"¿Qué clientes no compraron en el último mes?"</em>
                      <br />— <em>"¿Qué productos tienen stock crítico?"</em>
                      <br />— <em>"¿Cuál fue nuestra ganancia neta en mayo?"</em>
                    </p>
                    <p>
                      <strong>🌿 Experta en yerba mate misionera</strong>
                      <br />Conoce en profundidad los productos del catálogo: tipos de yerba (con palo, sin palo, orgánica, agroecológica), diferencias de calidad, marcas (El Colono, Flor de Jardín, Tucangua y más), formas de almacenamiento y recomendaciones para cada tipo de cliente.
                      <br />— <em>"¿Qué yerba le recomendás a alguien que quiere empezar a tomar?"</em>
                      <br />— <em>"¿Cuál es la diferencia entre orgánica y agroecológica?"</em>
                    </p>
                    <p>
                      <strong>✍️ Contenido SEO y comunicación</strong>
                      <br />Genera texto listo para usar en redes sociales, WhatsApp y la web:
                      <br />— Descripciones de productos para el catálogo online
                      <br />— Posts para Instagram con tono natural y misionero
                      <br />— Mensajes de venta para enviar por WhatsApp a clientes
                      <br />— Palabras clave para posicionamiento en Google
                      <br />— <em>"Escribime un post para Instagram del El Colono orgánico"</em>
                    </p>

                  </div>
                  <div className="modal-actions" style={{ justifyContent: 'center', marginTop: '2rem' }}>
                    <button className="primary-btn" onClick={() => setIsGuideOpen(false)}>
                      Entendido
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>

          <AgentChat />

          <style jsx>{`
          .app-container {
            display: flex;
            min-height: 100vh;
            background: var(--background);
            width: 100%;
            overflow-x: hidden;
            position: relative;
          }

          /* Animated Background */
          .app-container::before {
            content: '';
            position: fixed;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at center, rgba(59, 122, 87, 0.04) 0%, transparent 50%);
            z-index: 0;
            animation: rotateBackground 60s linear infinite;
            pointer-events: none;
          }

          @keyframes rotateBackground {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .sidebar {
            width: 260px;
            margin: 1rem;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            position: sticky;
            top: 1rem;
            height: calc(100vh - 2rem);
            transition: transform 0.3s ease, left 0.3s ease;
            z-index: 100;
            justify-content: space-between;
          }

          .sidebar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }

          .mobile-close-btn {
            display: none;
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
          }

          .brand-mark {
            display: flex;
            align-items: center;
            gap: 0.6rem;
          }

          .logo h2 {
            color: var(--sidebar-text);
            font-size: 1.15rem;
            font-weight: 800;
            letter-spacing: 0.06em;
            line-height: 1.1;
            -webkit-text-fill-color: var(--sidebar-text);
            background: none;
          }

          .brand-sub {
            display: block;
            font-size: 0.6rem;
            font-weight: 700;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: var(--sidebar-accent);
          }

          /* Dark sidebar override */
          .sidebar.glass-card {
            background: var(--sidebar-bg) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            border: 1px solid rgba(255,255,255,0.06) !important;
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.18) !important;
          }

          .sidebar .nav-item {
            color: var(--sidebar-muted);
          }

          .sidebar .nav-item:hover {
            background: rgba(201, 168, 76, 0.12);
            color: var(--sidebar-accent);
          }

          .sidebar .nav-item.active {
            background: rgba(201, 168, 76, 0.18);
            color: var(--sidebar-accent);
            box-shadow: none;
            border-left: 3px solid var(--sidebar-accent);
            padding-left: calc(1rem - 3px);
          }

          .sidebar .user-section {
            border-top: 1px solid rgba(255,255,255,0.1);
          }

          .sidebar .user-name {
            color: white;
          }

          .sidebar .logout-btn {
            color: var(--sidebar-muted);
            font-size: 0.75rem;
          }

          .sidebar .logout-btn:hover {
            color: var(--error);
          }

          .sidebar .mobile-close-btn {
            color: var(--sidebar-muted);
          }

          .global-loader {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(255,255,255,0.8);
            backdrop-filter: blur(5px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 99999;
          }
          
          .global-loader .spinner {
            border: 4px solid rgba(59, 122, 87, 0.2);
            border-top: 4px solid var(--primary);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }

          .global-loader p {
            color: var(--primary);
            font-weight: 600;
          }

          .nav-links {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            flex: 1;
          }

          .nav-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            border: none;
            background: transparent;
            color: var(--text-muted);
            cursor: pointer;
            border-radius: var(--radius);
            transition: all 0.2s ease;
            font-weight: 500;
            width: 100%;
            text-align: left;
          }

          .nav-item:hover {
            background: rgba(59, 122, 87, 0.08);
            color: var(--primary);
          }

          .nav-item.active {
            background: var(--primary);
            color: white;
            box-shadow: 0 4px 12px rgba(59, 122, 87, 0.3);
          }

          .user-section {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border);
            margin-top: auto;
          }

          .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.2rem;
          }

          .user-info {
            display: flex;
            flex-direction: column;
          }

          .user-name {
            font-weight: 600;
            color: var(--text);
            font-size: 0.9rem;
          }

          .user-role {
            font-size: 0.75rem;
            color: var(--text-muted);
          }

          .content {
            flex: 1;
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
            min-width: 0; /* Evita que el contenido flex rompa el contenedor */
            z-index: 1;
          }

          .page-header {
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
          }

          .help-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
            border: 1px solid rgba(59, 130, 246, 0.2);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.85rem;
            transition: all 0.2s;
          }

          .help-btn:hover {
            background: rgba(59, 130, 246, 0.2);
          }

          .user-guide h3 {
            color: var(--primary);
            font-size: 1.1rem;
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
          }
          
          .user-guide h3:first-child {
            margin-top: 0;
          }

          .user-guide p {
            color: var(--text);
            line-height: 1.6;
            font-size: 0.95rem;
            margin-bottom: 2rem;
          }

          .mobile-menu-btn {
            display: none;
            background: var(--surface);
            border: 1px solid var(--border);
            padding: 0.5rem;
            border-radius: 8px;
            color: var(--text);
            cursor: pointer;
            box-shadow: var(--shadow);
          }

          /* --- MODAL STYLES --- */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
            animation: fadeIn 0.3s ease;
          }

          .modal-content {
            background: white;
            border-radius: 16px;
            width: 100%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            display: flex;
            flex-direction: column;
          }

          .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            background: white;
            z-index: 10;
          }

          .modal-header h2 {
            font-size: 1.25rem;
            color: var(--text);
            margin: 0;
          }

          .modal-body {
            padding: 1.5rem;
          }

          .icon-btn.delete {
            background: transparent;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 8px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .icon-btn.delete:hover {
            background: rgba(239, 68, 68, 0.1);
            color: var(--error);
          }

          .primary-btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 6px -1px rgba(59, 122, 87, 0.3);
          }

          .primary-btn:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
          }

          .view-container {
            animation: fadeIn 0.3s ease;
            width: 100%;
          }

          .sidebar-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(4px);
            z-index: 90;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* User/Logout additions */
          .logout-btn {
             background: none;
             border: none;
             color: var(--text-muted);
             font-size: 0.75rem;
             padding: 0;
             margin-top: 2px;
             cursor: pointer;
             text-align: left;
             text-decoration: underline;
             transition: color 0.2s;
          }
          .logout-btn:hover {
             color: var(--error);
          }

          /* --- RESPONSIVE --- */
          @media (max-width: 1024px) {
            .sidebar {
              position: fixed;
              left: -300px;
              top: 0;
              bottom: 0;
              height: 100vh;
              margin: 0;
              border-radius: 0;
              transform: translateX(0);
            }

            .sidebar.open {
              left: 0;
            }

            .sidebar-overlay {
              display: block;
            }

            .mobile-menu-btn {
              display: flex;
            }

            .mobile-close-btn {
              display: block;
            }

            .content {
              padding: 1.5rem;
            }
          }

          @media (max-width: 640px) {
            .content {
              padding: 1rem;
            }
            
            .page-header h1 {
              font-size: 1.5rem;
            }
          }
        `}</style>
        </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppAuthWrapper />
      </ToastProvider>
    </AuthProvider>
  );
}

function AppAuthWrapper() {
  const { user, loading } = useAuth();
  // Navigation states: 'app' (dashboard) or 'storefront'
  const [currentView, setCurrentView] = useState(() => {
    // Check if user came via a link directly to storefront or entrega
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'storefront') return 'storefront';
    if (view === 'entrega') return 'entrega';
    if (view === 'propuesta') return 'propuesta';
    if (view === 'pedido') return 'pedido';
    return 'app';
  });

  // Páginas públicas: no requieren login
  if (currentView === 'entrega') return <Entrega />;
  if (currentView === 'propuesta') return <Propuesta />;
  if (currentView === 'storefront') return (
    <React.Fragment>
      <B2BStoreFront productos={[]} costoPromedio={{}} />
    </React.Fragment>
  );
  if (currentView === 'pedido') {
    const params = new URLSearchParams(window.location.search);
    return <PortalPedidos clienteId={params.get('cliente')} />;
  }

  if (loading) {
    return (
      <div className="global-loader">
        <div className="spinner"></div>
        <p>Verificando sesión...</p>
      </div>
    );
  }

  // Guard de autenticación
  if (!user) {
    return (
      <Login
        onGoToStorefront={() => window.location.href = '?view=storefront'}
      />
    );
  }

  return (
    <AppContent currentView={currentView} setCurrentView={setCurrentView} />
  )
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // Log interno — no se muestra al usuario
    console.error('[ErrorBoundary]', error, info);
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: 'Nunito, system-ui, sans-serif' }}>
          <div style={{ textAlign: 'center', padding: '2rem', maxWidth: 420 }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ color: 'white', fontWeight: 800, marginBottom: '0.5rem' }}>Algo salió mal</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Ocurrió un error inesperado. Por favor recargá la página. Si el problema persiste, contactá al soporte.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: '#3B7A57', color: 'white', border: 'none', padding: '0.75rem 1.75rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
