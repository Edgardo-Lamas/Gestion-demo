import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Phone, Star, TrendingUp, X, Plus, Minus, Search, PackageOpen } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

const B2BStoreFront = ({ productos: productosProp = [], costoPromedio: costoPromedioProp = {} }) => {
  const { addToast } = useToast();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [productosData, setProductosData] = useState(productosProp);
  const [costoData, setCostoData] = useState(costoPromedioProp);

  // Auto-fetch cuando se usa como página pública (sin props)
  useEffect(() => {
    if (productosProp.length > 0) return;
    const fetchData = async () => {
      const [{ data: prods }, { data: compras }] = await Promise.all([
        supabase.from('productos').select('*').order('nombre'),
        supabase.from('compras').select('producto_id, cantidad_disponible, costo_unitario'),
      ]);
      if (prods) setProductosData(prods);
      if (compras) {
        const costos = {};
        compras.forEach(c => {
          if (c.cantidad_disponible > 0) {
            if (!costos[c.producto_id]) costos[c.producto_id] = { total: 0, kg: 0 };
            costos[c.producto_id].total += c.costo_unitario * c.cantidad_disponible;
            costos[c.producto_id].kg += c.cantidad_disponible;
          }
        });
        const resultado = {};
        Object.entries(costos).forEach(([id, d]) => { resultado[id] = d.kg > 0 ? d.total / d.kg : 0; });
        setCostoData(resultado);
      }
    };
    fetchData();
  }, [productosProp.length]);

  const productos = productosData;
  const costoPromedio = costoData;

  // Para el MVP, simulamos categorías y descripciones genéricas si no existen
  const catalogProducts = useMemo(() => {
    return productos.map(p => {
      // El precio B2B sugerido es el configurado manualmente, o el costo promedio (si no configuró nada)
      const precio_sugerido = p.precio_catalogo > 0
        ? p.precio_catalogo
        : (costoPromedio[p.id] || 0);

      return {
        ...p,
        precio_b2b_calculado: precio_sugerido, // Guardamos este valor final para usar en la vista
        descripcion: p.descripcion || 'Producto natural artesanal, ideal para reventa en dietéticas y almacenes.',
        categoria: (['Vacuno', 'Bovino', 'Porcino', 'Aviar', 'Corte'].includes(p.categoria) ? 'Natural' : p.categoria) || 'Natural',
        imagen_url: p.imagen_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800'
      };
    }).filter(p => p.mostrar_en_catalogo !== false);
  }, [productos, costoPromedio]);

  const filteredProducts = catalogProducts.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 5 } : item);
      }
      return [...prev, { ...product, quantity: 10 }]; // Mínimo asigando de 10kg por defecto para B2B
    });
    addToast(`${product.nombre} agregado al carrito`, 'success');
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.precio_b2b_calculado * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    let message = `* NUEVO PEDIDO MAYORISTA - AGIAPURR * 🌿\n\n`;
    message += `Hola Gladis, te paso este pedido web: \n\n`;

    cart.forEach(item => {
      message += `▪️ * ${item.nombre}*\n`;
      if (item.precio_b2b_calculado > 0) {
        message += `   ${item.quantity} unid. x ${formatPrice(item.precio_b2b_calculado)} = * ${formatPrice(item.precio_b2b_calculado * item.quantity)}*\n`;
      } else {
        message += `   ${item.quantity} unid. (A cotizar)\n`;
      }
    });

    message += `\n * TOTAL ESTIMADO: ${formatPrice(cartTotal)}*\n\n`;
    message += `(Aguardando confirmación de disponibilidad y envío)`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5491100000000?text=${encodedMessage}`; // Remplazar por NRO REAL

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="storefront-wrapper">
      {/* Navigation */}
      <nav className="store-nav glass-card">
        <div className="nav-container">
          <div className="logo-section">
            <h1 className="logo-text">AGIAPURR <span className="logo-accent">Catálogo B2B</span></h1>
          </div>
          <div className="nav-actions">
            <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={24} />
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <span className="hero-badge"><Star size={16} /> Origen Misionero</span>
          <h2 className="hero-title">Abastecemos tu negocio con los mejores productos naturales</h2>
          <p className="hero-subtitle">Precios mayoristas exclusivos para revendedores y distribuidores. Hacé tu pedido online y coordinamos entrega rápida.</p>
          <div className="hero-features">
            <div className="feature"><TrendingUp size={20} /> Precios Directos</div>
            <div className="feature"><React.Fragment><PackageOpen size={20} /></React.Fragment> Stock Constante</div>
            <div className="feature"><Phone size={20} /> Atención Personalizada</div>
          </div>
        </div>
        <div className="hero-overlay"></div>
      </header>

      {/* Catalog Section */}
      <main className="catalog-container">
        <div className="catalog-header">
          <h3>Productos Disponibles</h3>
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-catalog">
            <PackageOpen size={48} className="text-muted" />
            <p>No se encontraron productos disponibles en el catálogo en este momento.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image" style={{ backgroundImage: `url(${product.imagen_url})` }}>
                  {product.precio_b2b_calculado <= 0 && <div className="no-price-badge">Consultar Precio</div>}
                </div>
                <div className="product-info">
                  <span className="category-tag">{product.categoria}</span>
                  <h4 className="product-name">{product.nombre}</h4>
                  <p className="product-desc">{product.descripcion}</p>

                  <div className="product-footer">
                    <div className="price-container">
                      {product.precio_b2b_calculado > 0 ? (
                        <>
                          <span className="price-value">{formatPrice(product.precio_b2b_calculado)}</span>
                          <span className="price-unit">por unidad</span>
                        </>
                      ) : (
                        <span className="price-value text-muted">A cotizar</span>
                      )}
                    </div>
                    <button
                      className="add-btn"
                      onClick={() => addToCart(product)}
                    >
                      <Plus size={18} style={{ marginRight: '6px' }} /> Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Promotional Flyer */}
        <div className="promo-flyer">
          <img src={`${import.meta.env.BASE_URL}hero-bg1.png`} alt="Flyer Promocional AGIAPURR" />
        </div>
      </main>

      {/* Shopping Cart Sidebar */}
      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h3>Pedido Mayorista</h3>
              <button className="close-btn" onClick={() => setIsCartOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingCart size={40} />
                  <p>Tu pedido está vacío.</p>
                  <button className="secondary-btn" onClick={() => setIsCartOpen(false)}>Ver Catálogo</button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <span className="item-name">{item.nombre}</span>
                      <span className="item-price">{formatPrice(item.precio_b2b_calculado)} /kg</span>
                    </div>
                    <div className="item-actions">
                      <div className="quantity-control">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                        <span>{item.quantity} kg</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                      </div>
                      <span className="item-total">
                        {item.precio_b2b_calculado > 0 ? formatPrice(item.precio_b2b_calculado * item.quantity) : 'A cotizar'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Total de kilos:</span>
                    <span>{totalItems} kg</span>
                  </div>
                  <div className="summary-row total">
                    <span>Monto Estimado:</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <span className="disclaimer">* El monto final puede variar según el pesaje exacto al momento de armar el pedido.</span>
                </div>
                <button className="checkout-btn" onClick={handleCheckout}>
                  Enviar Pedido al WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Styles local to the storefront */}
      <style jsx>{`
        .storefront-wrapper {
          min-height: 100vh;
          background-color: #f8fafc;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .store-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          border-radius: 0;
          border-left: none;
          border-right: none;
          border-top: none;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .logo-accent {
          color: #3B7A57;
        }

        .cart-btn {
          background: transparent;
          border: none;
          color: #1e293b;
          position: relative;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: background 0.2s;
        }
        
        .cart-btn:hover {
          background: rgba(0,0,0,0.05);
        }

        .cart-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: #ef4444;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          height: 18px;
          min-width: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .hero-section {
          position: relative;
          background: #0f2218;
          background-image: url('${import.meta.env.BASE_URL}hero-bg.png');
          background-size: cover;
          background-position: center 40%;
          padding: 5rem 2rem;
          color: white;
          text-align: center;
          overflow: hidden;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(10,28,18,0.55) 0%, rgba(10,28,18,0.72) 100%);
          z-index: 1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .hero-badge {
          background: rgba(59, 122, 87, 0.2);
          border: 1px solid rgba(59,122,87,0.5);
          color: #C9A84C;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          backdrop-filter: blur(4px);
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1.1;
          margin: 0;
          color: #ffffff;
          text-shadow: 2px 2px 8px rgba(0,0,0,0.8);
        }

        .hero-subtitle {
          font-size: 1.1rem;
          color: #f8fafc;
          line-height: 1.6;
          max-width: 600px;
          text-shadow: 1px 1px 4px rgba(0,0,0,0.8);
        }

        .hero-features {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 1rem;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          background: rgba(255,255,255,0.1);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          backdrop-filter: blur(4px);
        }

        .catalog-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 1.5rem;
        }

        .catalog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .catalog-header h3 {
          font-size: 1.8rem;
          color: #0f172a;
          margin: 0;
        }

        .search-bar {
          display: flex;
          align-items: center;
          background: white;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          width: 300px;
          gap: 0.5rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .search-bar input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 0.95rem;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .product-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
          border: 1px solid #f1f5f9;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -5px rgba(0,0,0,0.1);
        }

        .product-image {
          height: 200px;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .no-price-badge {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          backdrop-filter: blur(4px);
        }

        .product-info {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .category-tag {
          font-size: 0.75rem;
          font-weight: 600;
          color: #3B7A57;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }

        .product-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .product-desc {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0 0 1.5rem 0;
          flex: 1;
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: auto;
        }

        .price-container {
          display: flex;
          flex-direction: column;
        }

        .price-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
        }

        .price-value.text-muted {
          color: #94a3b8;
          font-size: 1.2rem;
        }

        .price-unit {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .add-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #3B7A57;
          padding: 0.5rem 1rem;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .add-btn:hover:not(:disabled) {
          background: #3B7A57;
          color: white;
          border-color: #3B7A57;
        }

        .add-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          color: #cbd5e1;
        }

        /* Cart Sidebar */
        .cart-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.4);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          justify-content: flex-end;
        }

        .cart-sidebar {
          width: 100%;
          max-width: 400px;
          background: white;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: -4px 0 24px rgba(0,0,0,0.1);
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .cart-header {
          padding: 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cart-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #0f172a;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
        }

        .close-btn:hover {
          background: #f1f5f9;
        }

        .cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .empty-cart {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #94a3b8;
          gap: 1rem;
        }

        .cart-item {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .cart-item-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .item-name {
          font-weight: 600;
          color: #1e293b;
        }

        .item-price {
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 500;
        }

        .item-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.25rem;
        }

        .quantity-control button {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }

        .quantity-control button:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .quantity-control span {
          font-size: 0.85rem;
          font-weight: 600;
          min-width: 40px;
          text-align: center;
        }

        .item-total {
          font-weight: 700;
          color: #10b981;
        }

        .cart-footer {
          padding: 1.5rem;
          border-top: 1px solid #f1f5f9;
          background: white;
        }

        .cart-summary {
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: #64748b;
        }

        .summary-row.total {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid #f1f5f9;
        }

        .disclaimer {
          font-size: 0.7rem;
          color: #94a3b8;
          font-style: italic;
          margin-top: 0.5rem;
        }

        .checkout-btn {
          width: 100%;
          background: #25D366; /* Verde WhatsApp */
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }

        .checkout-btn:hover {
          background: #1ebc5a;
          transform: translateY(-2px);
        }

        /* Promo Flyer */
        .promo-flyer {
          margin-top: 4rem;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
        }

        .promo-flyer img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.25rem;
          }
          .search-bar {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default B2BStoreFront;
