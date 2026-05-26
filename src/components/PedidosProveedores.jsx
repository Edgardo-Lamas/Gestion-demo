import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, TrendingDown, AlertTriangle, CheckCircle, Send, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const PedidosProveedores = () => {
  const { addToast } = useToast();
  const [analisis, setAnalisis]       = useState([]);
  const [pedidos, setPedidos]         = useState([]);
  const [pedidoItems, setPedidoItems] = useState({});
  const [loading, setLoading]         = useState(true);
  const [vista, setVista]             = useState('analisis');
  const [seleccionados, setSeleccionados] = useState({});
  const [guardando, setGuardando]     = useState(false);
  const [expandido, setExpandido]     = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchAnalisis = async () => {
    setLoading(true);

    const [{ data: productos }, { data: compras }, { data: ventas }] = await Promise.all([
      supabase.from('productos').select('id, nombre, costo_referencia, unidad').order('nombre'),
      supabase.from('compras').select('producto_id, cantidad_disponible'),
      supabase.from('ventas')
        .select('producto_id, cantidad_vendida')
        .gte('fecha', (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]; })()),
    ]);

    const stockMap = {};
    compras?.forEach(c => { stockMap[c.producto_id] = (stockMap[c.producto_id] || 0) + Number(c.cantidad_disponible || 0); });

    const ventasMap = {};
    ventas?.forEach(v => { ventasMap[v.producto_id] = (ventasMap[v.producto_id] || 0) + Number(v.cantidad_vendida || 0); });

    const resultado = (productos || []).map(p => {
      const stock     = stockMap[p.id] || 0;
      const ventas30  = ventasMap[p.id] || 0;
      const velDiaria = ventas30 / 30;
      const diasStock = velDiaria > 0 ? Math.round(stock / velDiaria) : null;
      const proveedor = p.nombre.includes('—') ? p.nombre.split('—')[0].trim() : 'Otros';

      // Sugerido: cubrir 45 días a partir del stock actual
      const sugerido = velDiaria > 0
        ? Math.max(1, Math.ceil(velDiaria * 45 - stock))
        : stock < 3 ? 20 : 10;

      let alerta = 'ok';
      if (diasStock !== null) {
        if (diasStock < 7) alerta = 'critico';
        else if (diasStock < 15) alerta = 'bajo';
      } else if (stock < 3) {
        alerta = 'critico';
      }

      return { ...p, stock, ventas30, velDiaria, diasStock, proveedor, sugerido, alerta };
    });

    setAnalisis(resultado);
    setLoading(false);
  };

  const fetchPedidos = async () => {
    const { data } = await supabase
      .from('pedidos_proveedor')
      .select('*')
      .order('created_at', { ascending: false });
    setPedidos(data || []);

    if (data?.length) {
      const ids = data.map(p => p.id);
      const { data: items } = await supabase
        .from('pedidos_proveedor_items')
        .select('*')
        .in('pedido_id', ids);
      const grouped = {};
      items?.forEach(i => {
        if (!grouped[i.pedido_id]) grouped[i.pedido_id] = [];
        grouped[i.pedido_id].push(i);
      });
      setPedidoItems(grouped);
    }
  };

  useEffect(() => { fetchAnalisis(); fetchPedidos(); }, []);

  // ── Selección ──────────────────────────────────────────────────────────
  const toggleSeleccion = (producto) => {
    setSeleccionados(prev => {
      if (prev[producto.id] !== undefined) {
        const next = { ...prev };
        delete next[producto.id];
        return next;
      }
      return { ...prev, [producto.id]: producto.sugerido || 10 };
    });
  };

  const ajustarCantidad = (id, delta) => {
    setSeleccionados(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }));
  };

  const selPorProveedor = useMemo(() => {
    const grupos = {};
    Object.entries(seleccionados).forEach(([prodId, cantidad]) => {
      const prod = analisis.find(p => p.id === prodId);
      if (!prod) return;
      if (!grupos[prod.proveedor]) grupos[prod.proveedor] = [];
      grupos[prod.proveedor].push({ ...prod, cantidadPedido: cantidad });
    });
    return grupos;
  }, [seleccionados, analisis]);

  const totalSel = Object.keys(seleccionados).length;

  // ── Generar pedidos ────────────────────────────────────────────────────
  const generarPedidos = async () => {
    if (!totalSel) return;
    setGuardando(true);
    try {
      for (const [proveedor, items] of Object.entries(selPorProveedor)) {
        const { data: pedido, error } = await supabase
          .from('pedidos_proveedor')
          .insert({ proveedor, estado: 'borrador' })
          .select().single();
        if (error) throw error;
        await supabase.from('pedidos_proveedor_items').insert(
          items.map(item => ({
            pedido_id: pedido.id,
            producto_id: item.id,
            producto_nombre: item.nombre,
            cantidad_final: item.cantidadPedido,
            costo_unitario: item.costo_referencia || 0,
          }))
        );
      }
      addToast(`${Object.keys(selPorProveedor).length} pedido(s) generado(s) correctamente`, 'success');
      setSeleccionados({});
      await fetchPedidos();
      setVista('historial');
    } catch {
      addToast('Error al generar pedidos', 'error');
    }
    setGuardando(false);
  };

  const actualizarEstado = async (pedidoId, nuevoEstado) => {
    const labels = { enviado: 'enviado al proveedor', recibido: 'marcado como recibido' };
    if (!window.confirm(`¿Marcar este pedido como ${labels[nuevoEstado]}?`)) return;
    const { error } = await supabase.from('pedidos_proveedor').update({ estado: nuevoEstado }).eq('id', pedidoId);
    if (error) { addToast('Error actualizando estado', 'error'); return; }
    addToast(`Pedido ${labels[nuevoEstado]}`, 'success');
    fetchPedidos();
  };

  const eliminarPedido = async (id) => {
    if (!window.confirm('¿Eliminar este pedido borrador?')) return;
    await supabase.from('pedidos_proveedor').delete().eq('id', id);
    fetchPedidos();
  };

  // ── Helpers ────────────────────────────────────────────────────────────
  const fmt = n => Number(n || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

  const ESTADO_STYLE = {
    borrador: { bg: '#f1f5f9', color: '#64748b', label: 'Borrador' },
    enviado:  { bg: '#eff6ff', color: '#3b82f6', label: 'Enviado' },
    recibido: { bg: '#f0fdf4', color: '#22c55e', label: 'Recibido' },
  };

  const criticos  = analisis.filter(p => p.alerta === 'critico').length;
  const bajos     = analisis.filter(p => p.alerta === 'bajo').length;
  const pendientes = pedidos.filter(p => p.estado !== 'recibido').length;

  if (loading) return (
    <div style={{ padding: '2rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analizando stock...
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  return (
    <div style={{ padding: '1.5rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Pedidos a Proveedores</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
            Análisis basado en stock actual y ventas de los últimos 30 días
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['analisis', 'historial'].map(v => (
            <button key={v} onClick={() => setVista(v)} style={{
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
              background: vista === v ? 'var(--primary)' : 'var(--surface)',
              color: vista === v ? 'white' : 'var(--text-muted)',
              border: vista === v ? 'none' : '1px solid var(--border)',
              transition: 'all 0.2s',
            }}>
              {v === 'analisis' ? 'Análisis' : `Pedidos${pendientes > 0 ? ` (${pendientes})` : ''}`}
            </button>
          ))}
        </div>
      </div>

      {/* ══ VISTA: ANÁLISIS ══════════════════════════════════════════════ */}
      {vista === 'analisis' && (
        <>
          {/* Chips de resumen */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
            {criticos > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fef2f2', color: '#dc2626', padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                <AlertTriangle size={13} /> {criticos} crítico{criticos !== 1 ? 's' : ''}
              </div>
            )}
            {bajos > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fffbeb', color: '#d97706', padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                <TrendingDown size={13} /> {bajos} stock bajo
              </div>
            )}
            {criticos === 0 && bajos === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#16a34a', padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                <CheckCircle size={13} /> Stock saludable
              </div>
            )}
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '5px 0', display: 'flex', alignItems: 'center' }}>
              Hacé clic en una fila para seleccionarla
            </div>
          </div>

          {/* Tabla de análisis */}
          <div className="glass-card" style={{ overflow: 'hidden', marginBottom: totalSel > 0 ? '100px' : 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--surface)' }}>
                  {['Producto / Proveedor', 'Stock', 'Días est.', 'Vtas. 30d', 'Sugerido'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Producto / Proveedor' ? 'left' : 'center', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analisis.map(item => {
                  const sel = seleccionados[item.id] !== undefined;
                  const DOT_COLOR = { critico: '#ef4444', bajo: '#f59e0b', ok: '#22c55e' }[item.alerta];
                  const ROW_BG   = sel ? '#f0fdf4' : item.alerta === 'critico' ? '#fef9f9' : item.alerta === 'bajo' ? '#fffdf5' : 'transparent';
                  const DIAS_COLOR = item.alerta === 'critico' ? '#dc2626' : item.alerta === 'bajo' ? '#d97706' : '#16a34a';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => toggleSeleccion(item)}
                      style={{ borderBottom: '1px solid var(--border)', background: ROW_BG, cursor: 'pointer', transition: 'background 0.12s' }}
                    >
                      {/* Nombre */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sel ? '#22c55e' : DOT_COLOR, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{item.nombre}</div>
                            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{item.proveedor}</div>
                          </div>
                        </div>
                      </td>

                      {/* Stock */}
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                        {item.stock}
                        {item.unidad && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: '2px' }}>{item.unidad}</span>}
                      </td>

                      {/* Días */}
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        {item.diasStock !== null
                          ? <span style={{ fontWeight: 700, fontSize: '0.9rem', color: DIAS_COLOR }}>{item.diasStock}d</span>
                          : <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>s/dato</span>
                        }
                      </td>

                      {/* Ventas 30d */}
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: '0.85rem', color: item.ventas30 > 0 ? 'var(--text)' : 'var(--text-muted)' }}>
                        {item.ventas30 > 0 ? item.ventas30 : '—'}
                      </td>

                      {/* Sugerido / selector */}
                      <td style={{ padding: '10px 14px', textAlign: 'center' }} onClick={sel ? e => e.stopPropagation() : undefined}>
                        {sel ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '2px 6px' }}>
                            <button
                              onClick={e => { e.stopPropagation(); ajustarCantidad(item.id, -1); }}
                              style={{ width: '22px', height: '22px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >−</button>
                            <span style={{ fontWeight: 800, minWidth: '26px', textAlign: 'center', fontSize: '0.9rem' }}>{seleccionados[item.id]}</span>
                            <button
                              onClick={e => { e.stopPropagation(); ajustarCantidad(item.id, 1); }}
                              style={{ width: '22px', height: '22px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >+</button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600 }}>
                            {item.sugerido > 0 ? `+${item.sugerido}` : 'agregar'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Barra flotante de pedido */}
          {totalSel > 0 && (
            <div style={{
              position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
              background: '#1B3A2A', color: 'white', borderRadius: '16px', padding: '12px 18px',
              display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              zIndex: 50, minWidth: '340px', maxWidth: '520px',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.93rem' }}>
                  {totalSel} producto{totalSel !== 1 ? 's' : ''} seleccionado{totalSel !== 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.55)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {Object.keys(selPorProveedor).join(' · ')}
                </div>
              </div>
              <button
                onClick={() => setSeleccionados({})}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.8)', padding: '6px 11px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.78rem', flexShrink: 0 }}
              >
                Limpiar
              </button>
              <button
                onClick={generarPedidos}
                disabled={guardando}
                style={{ background: '#C9A84C', border: 'none', color: '#1B3A2A', padding: '9px 18px', borderRadius: '9px', cursor: 'pointer', fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
              >
                <Send size={13} /> Generar{Object.keys(selPorProveedor).length > 1 ? ` (${Object.keys(selPorProveedor).length})` : ''}
              </button>
            </div>
          )}
        </>
      )}

      {/* ══ VISTA: HISTORIAL ═════════════════════════════════════════════ */}
      {vista === 'historial' && (
        <div>
          {pedidos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <ShoppingBag size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No hay pedidos registrados todavía</p>
              <button
                onClick={() => setVista('analisis')}
                style={{ marginTop: '8px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}
              >
                Ver análisis de stock
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pedidos.map(pedido => {
                const ec = ESTADO_STYLE[pedido.estado] || ESTADO_STYLE.borrador;
                const items = pedidoItems[pedido.id] || [];
                const isExpanded = expandido === pedido.id;
                const totalCosto = items.reduce((s, i) => s + (i.cantidad_final * i.costo_unitario), 0);

                return (
                  <div key={pedido.id} className="glass-card" style={{ padding: '1.1rem', borderLeft: `4px solid ${ec.color}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '1rem' }}>{pedido.proveedor}</span>
                          <span style={{ background: ec.bg, color: ec.color, padding: '2px 10px', borderRadius: '10px', fontSize: '0.73rem', fontWeight: 700 }}>
                            {ec.label}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                          {items.length} producto{items.length !== 1 ? 's' : ''} ·&nbsp;
                          {new Date(pedido.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          {totalCosto > 0 && ` · est. ${fmt(totalCosto)}`}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                        {pedido.estado === 'borrador' && (
                          <>
                            <button
                              onClick={() => actualizarEstado(pedido.id, 'enviado')}
                              style={{ padding: '5px 11px', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                            >
                              Enviar
                            </button>
                            <button
                              onClick={() => eliminarPedido(pedido.id)}
                              style={{ padding: '5px 9px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
                              title="Eliminar borrador"
                            >
                              ×
                            </button>
                          </>
                        )}
                        {pedido.estado === 'enviado' && (
                          <button
                            onClick={() => actualizarEstado(pedido.id, 'recibido')}
                            style={{ padding: '5px 11px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                          >
                            ✓ Recibido
                          </button>
                        )}
                        <button
                          onClick={() => setExpandido(isExpanded ? null : pedido.id)}
                          style={{ padding: '5px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && items.length > 0 && (
                      <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                        {items.map((item, i) => (
                          <div key={item.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '6px 4px', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
                            fontSize: '0.85rem',
                          }}>
                            <span>{item.producto_nombre}</span>
                            <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                              {item.cantidad_final} uds.
                              {item.costo_unitario > 0 && (
                                <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '8px' }}>
                                  {fmt(item.cantidad_final * item.costo_unitario)}
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                        {totalCosto > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
                            Total estimado: {fmt(totalCosto)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PedidosProveedores;
