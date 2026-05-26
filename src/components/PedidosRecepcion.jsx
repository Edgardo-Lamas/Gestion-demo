import React, { useState, useEffect, useRef } from 'react';
import { ClipboardList, Plus, Check, X, Eye, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import Modal from './ui/Modal';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import ComentariosPedido from './ComentariosPedido';

function pedirPermisosNotificacion() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function notificarNuevoPedido(cliente) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('🛒 Nuevo pedido recibido', {
      body: `${cliente || 'Cliente'} acaba de hacer un pedido`,
      icon: '/favicon.ico',
    });
  }
}

function sonarAlerta() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 150, 300].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + delay / 1000);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay / 1000 + 0.3);
      osc.start(ctx.currentTime + delay / 1000);
      osc.stop(ctx.currentTime + delay / 1000 + 0.3);
    });
  } catch (_) {}
}

const ESTADOS = {
  pendiente:  { label: 'Pendiente',  color: '#f59e0b', icon: Clock },
  aprobado:   { label: 'Aprobado',   color: '#3b82f6', icon: CheckCircle },
  armando:    { label: 'Armando',    color: '#8b5cf6', icon: ClipboardList },
  despachado: { label: 'Despachado', color: '#0ea5e9', icon: Truck },
  entregado:  { label: 'Entregado', color: '#22c55e', icon: CheckCircle },
  cancelado:  { label: 'Cancelado', color: '#ef4444', icon: XCircle },
};

const EstadoBadge = ({ estado }) => {
  const e = ESTADOS[estado] || ESTADOS.pendiente;
  const Icon = e.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: e.color + '20', color: e.color,
      padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600
    }}>
      <Icon size={12} /> {e.label}
    </span>
  );
};

const PedidosRecepcion = ({ clientes, productos, onUpdate }) => {
  const { addToast } = useToast();
  const [pedidos, setPedidos] = useState([]);
  const [pedidoItems, setPedidoItems] = useState({});
  const [expandido, setExpandido] = useState(null);
  const [filtro, setFiltro] = useState('todos');
  const [modalNuevo, setModalNuevo] = useState(false);
  const [loading, setLoading] = useState(true);

  const [nuevoPedido, setNuevoPedido] = useState({ cliente_id: '', observaciones: '', items: [] });
  const [itemTemp, setItemTemp] = useState({ producto_id: '', cantidad: '', precio_unitario: '' });
  const pedidosIdsRef = useRef(new Set());

  const fetchPedidos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pedidos')
      .select('*, clientes(nombre, telefono, direccion)')
      .order('created_at', { ascending: false });
    if (!error) setPedidos(data || []);
    setLoading(false);
  };

  const fetchItems = async (pedidoId) => {
    if (pedidoItems[pedidoId]) return;
    const { data } = await supabase
      .from('pedido_items')
      .select('*')
      .eq('pedido_id', pedidoId);
    setPedidoItems(prev => ({ ...prev, [pedidoId]: data || [] }));
  };

  useEffect(() => {
    pedirPermisosNotificacion();
    fetchPedidos();
    const channel = supabase
      .channel('pedidos-recepcion')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, async (payload) => {
        const nuevo = payload.new;
        if (pedidosIdsRef.current.has(nuevo.id)) return;
        pedidosIdsRef.current.add(nuevo.id);
        sonarAlerta();
        // Buscar nombre del cliente para la notificación
        let nombreCliente = 'Cliente';
        if (nuevo.cliente_id) {
          const { data } = await supabase.from('clientes').select('nombre').eq('id', nuevo.cliente_id).single();
          if (data) nombreCliente = data.nombre;
        }
        notificarNuevoPedido(nombreCliente);
        fetchPedidos();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos' }, fetchPedidos)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const toggleExpandir = async (id) => {
    if (expandido === id) { setExpandido(null); return; }
    setExpandido(id);
    await fetchItems(id);
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    const { error } = await supabase.from('pedidos').update({ estado: nuevoEstado }).eq('id', id);
    if (error) { addToast('Error actualizando estado', 'error'); return; }
    addToast(`Pedido marcado como ${ESTADOS[nuevoEstado]?.label}`, 'success');
    fetchPedidos();
    if (onUpdate) onUpdate();
  };

  const agregarItemTemp = () => {
    if (!itemTemp.producto_id || !itemTemp.cantidad || !itemTemp.precio_unitario) return;
    const prod = productos.find(p => p.id === itemTemp.producto_id);
    setNuevoPedido(prev => ({
      ...prev,
      items: [...prev.items, {
        producto_id: itemTemp.producto_id,
        producto_nombre: prod?.nombre || '',
        cantidad: parseFloat(itemTemp.cantidad),
        precio_unitario: parseFloat(itemTemp.precio_unitario),
        subtotal: parseFloat(itemTemp.cantidad) * parseFloat(itemTemp.precio_unitario)
      }]
    }));
    setItemTemp({ producto_id: '', cantidad: '', precio_unitario: '' });
  };

  const crearPedidoManual = async (e) => {
    e.preventDefault();
    if (!nuevoPedido.cliente_id || nuevoPedido.items.length === 0) {
      addToast('Seleccioná un cliente y agregá al menos un producto', 'error');
      return;
    }
    const total = nuevoPedido.items.reduce((s, i) => s + i.subtotal, 0);
    const { data: pedido, error } = await supabase
      .from('pedidos')
      .insert([{ cliente_id: nuevoPedido.cliente_id, observaciones: nuevoPedido.observaciones, total, origen: 'manual', estado: 'pendiente' }])
      .select()
      .single();
    if (error) { addToast('Error creando pedido', 'error'); return; }
    const itemsInsert = nuevoPedido.items.map(i => ({ ...i, pedido_id: pedido.id }));
    await supabase.from('pedido_items').insert(itemsInsert);
    addToast('Pedido creado', 'success');
    setModalNuevo(false);
    setNuevoPedido({ cliente_id: '', observaciones: '', items: [] });
    fetchPedidos();
  };

  const pedidosFiltrados = filtro === 'todos' ? pedidos : pedidos.filter(p => p.estado === filtro);

  const fmt = (n) => Number(n || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Recepción de Pedidos</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {'Notification' in window && Notification.permission !== 'granted' && (
            <button onClick={pedirPermisosNotificacion} title="Activar alertas de nuevos pedidos" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
              <Bell size={14} /> Activar alertas
            </button>
          )}
          <button className="btn-primary" onClick={() => setModalNuevo(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Nuevo Pedido
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {['todos', 'pendiente', 'aprobado', 'armando', 'despachado', 'entregado'].map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={{
            padding: '5px 14px', borderRadius: '20px', border: '1px solid var(--border)',
            background: filtro === f ? 'var(--primary)' : 'white',
            color: filtro === f ? 'white' : 'var(--text)',
            cursor: 'pointer', fontSize: '0.82rem', fontWeight: filtro === f ? 600 : 400,
            textTransform: 'capitalize'
          }}>
            {f === 'todos' ? 'Todos' : ESTADOS[f]?.label}
            {f !== 'todos' && (
              <span style={{ marginLeft: '5px', background: 'rgba(255,255,255,0.3)', borderRadius: '10px', padding: '1px 6px', fontSize: '0.75rem' }}>
                {pedidos.filter(p => p.estado === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista de pedidos */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando pedidos...</p>
      ) : pedidosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <ClipboardList size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>No hay pedidos {filtro !== 'todos' ? `en estado "${ESTADOS[filtro]?.label}"` : ''}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pedidosFiltrados.map(p => (
            <div key={p.id} className="glass-card" style={{ padding: '1rem 1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700 }}>{p.clientes?.nombre || 'Sin cliente'}</span>
                    <EstadoBadge estado={p.estado} />
                    {p.origen !== 'manual' && (
                      <span style={{ fontSize: '0.72rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px', color: '#64748b' }}>
                        {p.origen}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {p.clientes?.telefono && <span>{p.clientes.telefono} · </span>}
                    <span>{new Date(p.created_at).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    {p.observaciones && <span> · {p.observaciones}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>{fmt(p.total)}</span>
                  <button onClick={() => toggleExpandir(p.id)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {expandido === p.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Detalle items */}
              {expandido === p.id && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  {(pedidoItems[p.id] || []).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sin items cargados</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
                          <th style={{ padding: '4px 8px' }}>Producto</th>
                          <th style={{ padding: '4px 8px', textAlign: 'right' }}>Cant.</th>
                          <th style={{ padding: '4px 8px', textAlign: 'right' }}>Precio</th>
                          <th style={{ padding: '4px 8px', textAlign: 'right' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedidoItems[p.id].map(item => (
                          <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
                            <td style={{ padding: '6px 8px' }}>{item.producto_nombre}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right' }}>{item.cantidad}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmt(item.precio_unitario)}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>{fmt(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* Acciones según estado */}
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {p.estado === 'pendiente' && (
                      <>
                        <button onClick={() => cambiarEstado(p.id, 'aprobado')} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                          <Check size={14} /> Aprobar
                        </button>
                        <button onClick={() => cambiarEstado(p.id, 'cancelado')} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                          <X size={14} /> Cancelar
                        </button>
                      </>
                    )}
                    {p.estado === 'aprobado' && (
                      <button onClick={() => cambiarEstado(p.id, 'cancelado')} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                        <X size={14} /> Cancelar
                      </button>
                    )}
                  </div>

                  {/* Notas del pedido */}
                  <ComentariosPedido pedidoId={p.id} autor="Recepción" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal nuevo pedido manual */}
      <Modal isOpen={modalNuevo} onClose={() => setModalNuevo(false)} title="Nuevo Pedido Manual">
        <form onSubmit={crearPedidoManual}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.85rem' }}>Cliente</label>
            <select value={nuevoPedido.cliente_id} onChange={e => setNuevoPedido(p => ({ ...p, cliente_id: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)' }} required>
              <option value="">Seleccionar cliente...</option>
              {clientes.filter(c => c.activo !== false).map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.85rem' }}>Observaciones</label>
            <input value={nuevoPedido.observaciones} onChange={e => setNuevoPedido(p => ({ ...p, observaciones: e.target.value }))} placeholder="Ej: Entregar por la mañana" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', boxSizing: 'border-box' }} />
          </div>

          {/* Agregar items */}
          <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
            <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>Agregar productos</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select value={itemTemp.producto_id} onChange={e => setItemTemp(p => ({ ...p, producto_id: e.target.value }))} style={{ flex: 2, minWidth: '120px', padding: '7px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <option value="">Producto...</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              <input type="number" min="0.1" step="0.1" placeholder="Cant." value={itemTemp.cantidad} onChange={e => setItemTemp(p => ({ ...p, cantidad: e.target.value }))} style={{ flex: 1, minWidth: '70px', padding: '7px', borderRadius: '6px', border: '1px solid var(--border)' }} />
              <input type="number" min="0" placeholder="Precio" value={itemTemp.precio_unitario} onChange={e => setItemTemp(p => ({ ...p, precio_unitario: e.target.value }))} style={{ flex: 1, minWidth: '80px', padding: '7px', borderRadius: '6px', border: '1px solid var(--border)' }} />
              <button type="button" onClick={agregarItemTemp} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', padding: '7px 12px', cursor: 'pointer' }}>
                <Plus size={14} />
              </button>
            </div>

            {nuevoPedido.items.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                {nuevoPedido.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                    <span>{item.producto_nombre}</span>
                    <span>{item.cantidad} × ${item.precio_unitario} = <strong>${item.subtotal.toFixed(2)}</strong></span>
                  </div>
                ))}
                <div style={{ textAlign: 'right', fontWeight: 700, marginTop: '6px' }}>
                  Total: {nuevoPedido.items.reduce((s, i) => s + i.subtotal, 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Crear Pedido</button>
        </form>
      </Modal>
    </div>
  );
};

export default PedidosRecepcion;
