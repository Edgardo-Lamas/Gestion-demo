import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle, MapPin, Phone, Package } from 'lucide-react';
import Modal from './ui/Modal';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

const PanelRepartidor = ({ onUpdate }) => {
  const { addToast } = useToast();
  const [pedidos, setPedidos] = useState([]);
  const [items, setItems] = useState({});
  const [entregas, setEntregas] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalEntrega, setModalEntrega] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [historial, setHistorial] = useState(false);
  const [pedidosEntregados, setPedidosEntregados] = useState([]);

  const fetchPedidos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('pedidos')
      .select('*, clientes(nombre, direccion, telefono)')
      .eq('estado', 'despachado')
      .order('created_at');
    setPedidos(data || []);

    if (data?.length) {
      const ids = data.map(p => p.id);
      const { data: allItems } = await supabase
        .from('pedido_items').select('*').in('pedido_id', ids);
      const grouped = {};
      allItems?.forEach(i => {
        if (!grouped[i.pedido_id]) grouped[i.pedido_id] = [];
        grouped[i.pedido_id].push(i);
      });
      setItems(grouped);

      const { data: allEntregas } = await supabase
        .from('entregas').select('*').in('pedido_id', ids);
      const entregasMap = {};
      allEntregas?.forEach(e => { entregasMap[e.pedido_id] = e; });
      setEntregas(entregasMap);
    }
    setLoading(false);
  };

  const fetchHistorial = async () => {
    const { data } = await supabase
      .from('pedidos')
      .select('*, clientes(nombre, direccion)')
      .eq('estado', 'entregado')
      .order('updated_at', { ascending: false })
      .limit(20);
    setPedidosEntregados(data || []);
  };

  useEffect(() => {
    fetchPedidos();
    const channel = supabase
      .channel('repartidor-pedidos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, fetchPedidos)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const confirmarEntrega = async () => {
    const pedido = pedidos.find(p => p.id === modalEntrega);
    if (!pedido) return;

    const { error } = await supabase
      .from('pedidos')
      .update({ estado: 'entregado' })
      .eq('id', pedido.id);
    if (error) { addToast('Error confirmando entrega', 'error'); return; }

    const entrega = entregas[pedido.id];
    if (entrega) {
      await supabase.from('entregas').update({
        estado: 'entregado',
        hora_entrega: new Date().toISOString(),
        observaciones: observaciones || null
      }).eq('id', entrega.id);
    }

    addToast(`Entrega confirmada: ${pedido.clientes?.nombre}`, 'success');
    setModalEntrega(null);
    setObservaciones('');
    fetchPedidos();
    if (onUpdate) onUpdate();
  };

  const abrirMapa = (direccion) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
    window.open(url, '_blank');
  };

  const fmt = (n) => Number(n || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

  const pedidoActivo = pedidos.find(p => p.id === modalEntrega);

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Cargando...</div>;

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Hoja de Ruta</h2>
        <button
          onClick={() => { setHistorial(!historial); if (!historial) fetchHistorial(); }}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          {historial ? 'Ver pendientes' : 'Ver historial'}
        </button>
      </div>

      {historial ? (
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Últimas entregas</h3>
          {pedidosEntregados.map(p => (
            <div key={p.id} className="glass-card" style={{ padding: '1rem', marginBottom: '8px', opacity: 0.8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>{p.clientes?.nombre}</span>
                <span style={{ color: '#22c55e', fontWeight: 600 }}>✓ Entregado</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.clientes?.direccion}</div>
            </div>
          ))}
        </div>
      ) : pedidos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Truck size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>No hay entregas pendientes para hoy</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pedidos.map((pedido, idx) => {
            const pedidoItems = items[pedido.id] || [];
            return (
              <div key={pedido.id} className="glass-card" style={{ padding: '1.2rem', borderLeft: '4px solid #0ea5e9' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ background: '#0ea5e9', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>{pedido.clientes?.nombre}</div>

                    {pedido.clientes?.direccion && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <MapPin size={13} />
                        <span>{pedido.clientes.direccion}</span>
                        <button onClick={() => abrirMapa(pedido.clientes.direccion)} style={{ background: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                          Ver mapa
                        </button>
                      </div>
                    )}

                    {pedido.clientes?.telefono && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        <Phone size={13} /> {pedido.clientes.telefono}
                      </div>
                    )}

                    {/* Productos resumidos */}
                    <div style={{ background: '#f8fafc', borderRadius: '6px', padding: '8px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>
                        <Package size={11} style={{ marginRight: '4px' }} />PRODUCTOS
                      </div>
                      {pedidoItems.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '2px 0' }}>
                          <span>{item.producto_nombre}</span>
                          <span style={{ fontWeight: 600 }}>{item.cantidad}</span>
                        </div>
                      ))}
                    </div>

                    {pedido.observaciones && (
                      <div style={{ fontSize: '0.82rem', background: '#fef3c7', padding: '4px 8px', borderRadius: '6px', marginBottom: '10px' }}>
                        ⚠️ {pedido.observaciones}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{fmt(pedido.total)}</span>
                      <button
                        onClick={() => { setModalEntrega(pedido.id); setObservaciones(''); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 18px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}
                      >
                        <CheckCircle size={16} /> Entregado
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal confirmar entrega */}
      <Modal isOpen={!!modalEntrega} onClose={() => setModalEntrega(null)} title="Confirmar Entrega">
        {pedidoActivo && (
          <div>
            <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '1rem' }}>
              ¿Confirmar entrega a <strong>{pedidoActivo.clientes?.nombre}</strong>?
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.85rem' }}>
                Observaciones (opcional)
              </label>
              <textarea
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                placeholder="Ej: No había nadie, dejé con el vecino..."
                rows={3}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setModalEntrega(null)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: '8px', background: 'white', cursor: 'pointer', fontWeight: 600 }}>
                Cancelar
              </button>
              <button onClick={confirmarEntrega} style={{ flex: 2, padding: '10px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
                Confirmar Entrega
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PanelRepartidor;
