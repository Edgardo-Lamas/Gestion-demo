import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle, Package, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Portal de pedidos para clientes ───────────────────────────────────────
// Acceso: ?view=pedido&cliente=<cliente_id>
// Cada cliente tiene su link único con sus productos y precios personalizados

const PortalPedidos = ({ clienteId }) => {
  const [cliente, setCliente] = useState(null);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState({});
  const [stockMap, setStockMap] = useState({});
  const [descuentos, setDescuentos] = useState({});
  const [paso, setPaso] = useState('catalogo'); // catalogo | confirmando | confirmado
  const [observaciones, setObservaciones] = useState('');
  const [pedidoCreado, setPedidoCreado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!clienteId) { setError('Link inválido'); setLoading(false); return; }
    cargarDatos();
  }, [clienteId]);

  const cargarDatos = async () => {
    setLoading(true);
    const [{ data: clienteData }, { data: productosData }, { data: comprasData }, { data: descData }] = await Promise.all([
      supabase.from('clientes').select('*').eq('id', clienteId).single(),
      supabase.from('productos').select('*').order('nombre'),
      supabase.from('compras').select('producto_id, cantidad_disponible'),
      supabase.from('cliente_productos').select('*').eq('cliente_id', clienteId),
    ]);

    if (!clienteData) { setError('Cliente no encontrado'); setLoading(false); return; }
    setCliente(clienteData);

    // Stock calculado
    const stock = {};
    comprasData?.forEach(c => {
      stock[c.producto_id] = (stock[c.producto_id] || 0) + Number(c.cantidad_disponible || 0);
    });
    setStockMap(stock);

    // Precios personalizados por cliente
    const desc = {};
    descData?.forEach(d => {
      desc[d.producto_id] = { precio_fijo: d.precio_fijo, margen: d.margen_personalizado };
    });
    setDescuentos(desc);

    // Solo productos con stock > 0
    const conStock = (productosData || []).filter(p => (stock[p.id] || 0) > 0 && !p.oculto_catalogo);
    setProductos(conStock);
    setLoading(false);
  };

  const precioCliente = (producto) => {
    const d = descuentos[producto.id];
    if (d?.precio_fijo) return d.precio_fijo;
    const margen = d?.margen ?? producto.margen_ganancia ?? 0;
    return producto.precio_catalogo || 0;
  };

  const setCantidad = (productoId, delta) => {
    setCarrito(prev => {
      const actual = prev[productoId] || 0;
      const nueva = Math.max(0, actual + delta);
      const stock = stockMap[productoId] || 0;
      const final = Math.min(nueva, stock);
      if (final === 0) {
        const { [productoId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productoId]: final };
    });
  };

  const itemsCarrito = productos.filter(p => carrito[p.id] > 0);
  const total = itemsCarrito.reduce((s, p) => s + precioCliente(p) * carrito[p.id], 0);
  const cantidadTotal = Object.values(carrito).reduce((s, c) => s + c, 0);

  const confirmarPedido = async () => {
    if (itemsCarrito.length === 0) return;
    setEnviando(true);
    try {
      const items = itemsCarrito.map(p => ({
        producto_id: p.id,
        producto_nombre: p.nombre,
        cantidad: carrito[p.id],
        precio_unitario: precioCliente(p),
        subtotal: precioCliente(p) * carrito[p.id],
      }));

      const { data: pedido, error: errPedido } = await supabase
        .from('pedidos')
        .insert([{
          cliente_id: clienteId,
          estado: 'pendiente',
          origen: 'portal',
          observaciones: observaciones || null,
          total,
        }])
        .select()
        .single();

      if (errPedido) throw errPedido;

      await supabase.from('pedido_items').insert(items.map(i => ({ ...i, pedido_id: pedido.id })));

      setPedidoCreado({ ...pedido, items });
      setPaso('confirmado');
    } catch (e) {
      setError('No se pudo enviar el pedido. Intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const fmt = (n) => Number(n || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

  // ── Estados de carga y error ──────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center', color: '#64748b' }}>
        <Package size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
        <p>Cargando catálogo...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center', color: '#ef4444', padding: '2rem' }}>
        <p style={{ fontWeight: 700 }}>{error}</p>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Verificá el link con AGIAPURR</p>
      </div>
    </div>
  );

  // ── Pantalla de confirmación ──────────────────────────────────────────────
  if (paso === 'confirmado' && pedidoCreado) return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '420px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ background: '#dcfce7', borderRadius: '50%', width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={40} color="#22c55e" />
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: '1.4rem', color: '#15803d' }}>¡Pedido recibido!</h2>
        <p style={{ color: '#64748b', margin: '0 0 1.5rem', fontSize: '0.95rem' }}>
          Hola <strong>{cliente?.nombre}</strong>, tu pedido fue recibido y Gladis lo está revisando.
        </p>

        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '0.85rem', color: '#64748b' }}>RESUMEN DEL PEDIDO</p>
          {pedidoCreado.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
              <span>{item.cantidad}× {item.producto_nombre}</span>
              <span style={{ fontWeight: 600 }}>{fmt(item.subtotal)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontWeight: 700, fontSize: '1rem' }}>
            <span>Total</span>
            <span style={{ color: '#15803d' }}>{fmt(total)}</span>
          </div>
        </div>

        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
          Te avisamos cuando tu pedido sea aprobado y esté en camino.
        </p>
      </div>
    </div>
  );

  // ── Pantalla de revisión antes de confirmar ───────────────────────────────
  if (paso === 'confirmando') return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '1.5rem', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <button onClick={() => setPaso('catalogo')} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.9rem' }}>
          ← Volver
        </button>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Revisar pedido</h2>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {itemsCarrito.map(p => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{p.nombre}</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{fmt(precioCliente(p))} × {carrito[p.id]}</div>
            </div>
            <span style={{ fontWeight: 700 }}>{fmt(precioCliente(p) * carrito[p.id])}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontWeight: 700, fontSize: '1.05rem' }}>
          <span>Total</span>
          <span>{fmt(total)}</span>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>Observaciones (opcional)</label>
        <textarea
          value={observaciones}
          onChange={e => setObservaciones(e.target.value)}
          placeholder="Ej: Entregar por la tarde, llamar antes..."
          rows={3}
          style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
        />
      </div>

      <button
        onClick={confirmarPedido}
        disabled={enviando}
        style={{ width: '100%', background: enviando ? '#94a3b8' : '#16a34a', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '1rem', fontWeight: 700, cursor: enviando ? 'not-allowed' : 'pointer' }}
      >
        {enviando ? 'Enviando...' : '✓ Confirmar pedido'}
      </button>
    </div>
  );

  // ── Catálogo principal ────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '1rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '480px', margin: '0 auto' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>AGIAPURR</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Hola, {cliente?.nombre}</div>
          </div>
          <ShoppingCart size={22} color={cantidadTotal > 0 ? '#16a34a' : '#94a3b8'} />
        </div>
      </div>

      {/* Productos */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1rem 1.5rem' }}>
        {productos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <Package size={36} style={{ opacity: 0.3 }} />
            <p>Sin productos disponibles en este momento</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {productos.map(p => {
              const qty = carrito[p.id] || 0;
              const precio = precioCliente(p);
              const stock = stockMap[p.id] || 0;
              return (
                <div key={p.id} style={{ background: 'white', borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.nombre}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>{fmt(precio)}</span>
                      {p.unidad && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/ {p.unidad}</span>}
                    </div>
                    {stock <= 5 && <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 600 }}>Últimas unidades</span>}
                  </div>
                  {qty === 0 ? (
                    <button onClick={() => setCantidad(p.id, 1)} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      + Agregar
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => setCantidad(p.id, -1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {qty === 1 ? <Trash2 size={14} color="#ef4444" /> : <Minus size={14} />}
                      </button>
                      <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{qty}</span>
                      <button onClick={() => setCantidad(p.id, 1)} disabled={qty >= stock} style={{ background: qty >= stock ? '#e2e8f0' : '#16a34a', color: qty >= stock ? '#94a3b8' : 'white', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: qty >= stock ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botón carrito flotante */}
      {cantidadTotal > 0 && (
        <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 3rem)', maxWidth: '420px', zIndex: 20 }}>
          <button
            onClick={() => setPaso('confirmando')}
            style={{ width: '100%', background: '#16a34a', color: 'white', border: 'none', borderRadius: '12px', padding: '14px 20px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 16px rgba(22,163,74,0.4)' }}
          >
            <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '6px', padding: '2px 10px' }}>{cantidadTotal}</span>
            <span>Ver pedido</span>
            <span>{fmt(total)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PortalPedidos;
