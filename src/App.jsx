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
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import Purchases from './components/Purchases';
import Sales from './components/Sales';
import Expenses from './components/Expenses';
import Inventory from './components/Inventory';
import MeatDistribution from './components/MeatDistribution';
import B2BStoreFront from './components/B2BStoreFront';

import ClientProfiles from './components/ClientProfiles';
import Products from './components/Products';
import Entrega from './components/Entrega';
import ReporteSabri from './components/ReporteSabri';
import ReporteSabriAdmin from './components/ReporteSabriAdmin';
import SabriPanel from './components/SabriPanel';

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
  const [loading, setLoading] = useState(true);

  // Funciones de carga inicial
  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: pData, error: pErr }, { data: cData }, { data: vData }, { data: gData }, { data: dData }, { data: clData }] = await Promise.all([
        supabase.from('productos').select('*').order('nombre'),
        supabase.from('compras').select('*').order('fecha', { ascending: false }),
        supabase.from('ventas').select('*').order('fecha', { ascending: false }),
        supabase.from('gastos').select('*').order('fecha', { ascending: false }),
        supabase.from('distribuciones').select('*').order('fecha', { ascending: false }),
        supabase.from('clientes').select('*').order('nombre'),
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
      case 'dashboard': return <Dashboard compras={compras} ventas={ventas} gastos={gastos} productos={productos} stock_actual={stock_actual} />;
      case 'purchases': return <Purchases productos={productos} compras={compras} onUpdate={fetchData} />;
      case 'sales': return <Sales productos={productos} compras={compras} ventas={ventas} stock_actual={stock_actual} costoPromedio={costoPromedio} clientes={clientes} onUpdate={fetchData} />;
      case 'expenses': return <Expenses gastos={gastos} onUpdate={fetchData} />;
      case 'inventory': return <Inventory productos={productos} stock_actual={stock_actual} compras={compras} onUpdate={fetchData} />;
      case 'distribution': return <MeatDistribution distribuciones={distribuciones} productos={productos} costoPromedio={costoPromedio} ventas={ventas} compras={compras} onUpdate={fetchData} />;
      case 'clients': return <ClientProfiles clientes={clientes} productos={productos} compras={compras} ventas={ventas} stock_actual={stock_actual} costoPromedio={costoPromedio} onUpdate={fetchData} />;
      case 'products': return <Products productos={productos} compras={compras} ventas={ventas} distribuciones={distribuciones} stock_actual={stock_actual} onUpdate={fetchData} />;
      case 'sabri-reporte': return <ReporteSabriAdmin distribuciones={distribuciones} productos={productos} />;
      default: return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'purchases', label: 'Compras', icon: ShoppingCart },
    { id: 'sales', label: 'Ventas', icon: BadgeDollarSign },
    { id: 'expenses', label: 'Gastos', icon: Receipt },
    { id: 'inventory', label: 'Stock', icon: Package },
    { id: 'distribution', label: 'Distribución', icon: Scale },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'products', label: 'Productos', icon: Boxes },
    { id: 'sabri-reporte', label: 'Ventas Sabri', icon: ClipboardList },
  ];

  return (
    <>
      {currentView === 'storefront' ? (
        <React.Fragment>
          <B2BStoreFront productos={productos} costoPromedio={costoPromedio} />
          {/* Un botón temporal para poder volver al admin mientras desarrollamos */}
          <button
            onClick={() => setCurrentView('app')}
            style={{
              position: 'fixed', bottom: '20px', left: '20px',
              background: '#0f172a', color: 'white', padding: '10px 15px',
              borderRadius: '8px', zIndex: 9999, border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            ← Volver al Admin
          </button>
        </React.Fragment>
      ) : (
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
                <h2>Gestión Sabri</h2>
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
                style={{ color: '#f97316', background: 'rgba(249,115,22,0.1)' }}
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
              <div className="user-avatar">S</div>
              <div className="user-info">
                <span className="user-name">Sabrina</span>
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
            <div className="studio-brand">
              <span className="studio-copyright">© 2026 Edgardo Lamas</span>
              <div className="studio-identity">
                <div className="studio-mark" aria-hidden="true">
                  <svg viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="0" width="3.5" height="22" rx="1.75" fill="#c9a227"/>
                    <rect x="0" y="0" width="11" height="3.5" rx="1.75" fill="#c9a227"/>
                    <rect x="0" y="18.5" width="11" height="3.5" rx="1.75" fill="#c9a227"/>
                  </svg>
                </div>
                <div className="studio-text">
                  <span className="studio-name">Studio Lamas</span>
                  <span className="studio-tagline">Desarrollo Digital</span>
                </div>
              </div>
            </div>
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
                    <h2>Guía de Uso: Catálogo B2B</h2>
                    <button className="icon-btn delete" onClick={() => setIsGuideOpen(false)}>
                      <X size={20} />
                    </button>
                  </div>
                  <div className="modal-body user-guide">
                    <h3>1. Compras (Ingreso de Mercadería)</h3>
                    <p>
                      Todo empieza aquí. Cada vez que compras carne al frigorífico, regístralo en la pestaña <strong>Compras</strong>.
                      Al guardar una compra, el sistema suma automáticamente esos kilos a tu <strong>Stock</strong>. Si es un corte nuevo, te pedirá que lo crees primero.
                    </p>

                    <h3>2. Ventas (Salida de Mercadería)</h3>
                    <p>
                      Cuando vendes a un cliente, ve a <strong>Ventas</strong>. Al registrar la venta, el sistema restará esos kilos de tu <strong>Stock</strong> disponible.
                      Además, el sistema es inteligente (usa método FIFO): siempre descontará primero los kilos de la compra más antigua que tengas ingresada.
                    </p>

                    <h3>3. Distribución (Control de Carniceros)</h3>
                    <p>
                      Si le entregas carne a tus empleados/carniceros para que la trabajen o vendan en mostrador, anótalo en <strong>Distribución</strong>.
                      Esto te permite saber exactamente cuánta mercadería (y de qué valor) tiene cada empleado bajo su responsabilidad en todo momento.
                    </p>

                    <h3>4. Resumen (Tablero Principal)</h3>
                    <p>
                      El <strong>Resumen</strong> es tu centro de control. Aquí puedes ver de un vistazo tus ganancias, el valor total del stock que tienes inmovilizado, tus ventas del día, los gastos operativos (pestaña Gastos) y los productos que más salen.
                    </p>

                    <h3>5. Catálogo Público (Landing Page B2B)</h3>
                    <p>
                      Es la vidriera para tus clientes mayoristas. Muestra tu stock real.
                      <br />
                      - <strong>Precios:</strong> Si vas a <i>Stock</i> y dejas el "Precio Catálogo" vacío, se mostrará al cliente tu Costo Promedio. Si escribes un número, se mostrará ese precio manual.
                      <br />
                      - <strong>Ocultar:</strong> Desde <i>Stock</i> también puedes ocultar cortes temporalmente sin borrarlos.
                      <br />
                      - <strong>Pedidos:</strong> Tus clientes agregarán kilos al carrito y presionarán "Enviar Pedido", lo cual te llegará directamente a tu WhatsApp con todo detallado.
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
            background: radial-gradient(circle at center, rgba(249, 115, 22, 0.03) 0%, transparent 50%);
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

          .logo h2 {
            color: var(--primary);
            font-size: 1.5rem;
            background: linear-gradient(to right, var(--primary), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
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
            border: 4px solid rgba(249, 115, 22, 0.2);
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
            background: rgba(249, 115, 22, 0.08);
            color: var(--primary);
          }

          .nav-item.active {
            background: var(--primary);
            color: white;
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
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
            box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.3);
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

          /* Studio Lamas signature */
          .studio-brand {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            padding-top: 0.75rem;
            border-top: 1px solid rgba(255,255,255,0.06);
          }

          .studio-copyright {
            font-size: 0.65rem;
            color: var(--text-muted);
            letter-spacing: 0.02em;
          }

          .studio-identity {
            display: flex;
            align-items: center;
            gap: 0.625rem;
          }

          .studio-mark {
            width: 14px;
            height: 22px;
            flex-shrink: 0;
            opacity: 0.7;
          }

          .studio-mark svg {
            width: 100%;
            height: 100%;
          }

          .studio-text {
            display: flex;
            flex-direction: column;
            gap: 0.1rem;
          }

          .studio-name {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-muted);
            letter-spacing: 0.02em;
            line-height: 1;
          }

          .studio-tagline {
            font-size: 0.6rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            line-height: 1;
            opacity: 0.7;
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
      )}
    </>
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
    if (view === 'reporte') return 'reporte';
    if (view === 'sabri') return 'sabri';
    return 'app';
  });

  // Páginas públicas: no requieren login ni esperar auth
  if (currentView === 'entrega') return <Entrega />;
  if (currentView === 'reporte') return <ReporteSabri />;
  if (currentView === 'sabri') return <SabriPanel />;

  if (loading) {
    return (
      <div className="global-loader">
        <div className="spinner"></div>
        <p>Verificando sesión...</p>
      </div>
    );
  }

  // If user is not logged in, they can only see Login or Storefront
  if (!user && currentView === 'app') {
    return <Login onGoToStorefront={() => setCurrentView('storefront')} />;
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
    console.error("ErrorBoundary caught an error", error, info);
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: 'white', color: 'red' }}>
          <h2>Algo salió mal (Error de Aplicación)</h2>
          <pre>{this.state.error && this.state.error.toString()}</pre>
          <pre>{this.state.info && this.state.info.componentStack}</pre>
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
