import React, { useState, useEffect } from 'react';
import { Package, CheckSquare, Square, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

const PanelArmado = ({ onUpdate }) => {
  const { addToast } = useToast();
  const [pedidos, setPedidos] = useState([]);
  const [items, setItems] = useState({});
  const [checkeados, setCheckeados] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchPedidos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('pedidos')
      .select('*, clientes(nombre, direccion, telefono)')
      .eq('estado', 'aprobado')
      .order('created_at');
    setPedidos(data || []);

    if (data?.length) {
      const ids = data.map(p => p.id);
      const { data: allItems } = await supabase
        .from('pedido_items')
        .select('*')
        .in('pedido_id', ids);
      const grouped = {};
      allItems?.forEach(item => {
        if (!grouped[item.pedido_id]) grouped[item.pedido_id] = [];
        grouped[item.pedido_id].push(item);
      });
      setItems(grouped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPedidos();
    const channel = supabase
      .channel('armado-pedidos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, fetchPedidos)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const toggleCheck = (pedidoId, itemId) => {
    setCheckeados(prev => ({
      ...prev,
      [pedidoId]: { ...(prev[pedidoId] || {}), [itemId]: !(prev[pedidoId]?.[itemId]) }
    }));
  };

  const todosCheckeados = (pedidoId) => {
    const pedidoItems = items[pedidoId] || [];
    if (!pedidoItems.length) return false;
    return pedidoItems.every(item => checkeados[pedidoId]?.[item.id]);
  };

  const despachar = async (pedido) => {
    if (!todosCheckeados(pedido.id)) {
      addToast('Chequeá todos los productos antes de despachar', 'error');
      return;
    }
    const { error: errPedido } = await supabase
      .from('pedidos')
      .update({ estado: 'despachado' })
      .eq('id', pedido.id);
    if (errPedido) { addToast('Error despachando', 'error'); return; }

    await supabase.from('entregas').insert([{
      pedido_id: pedido.id,
      estado: 'pendiente'
    }]);

    addToast(`Pedido de ${pedido.clientes?.nombre} despachado`, 'success');
    fetchPedidos();
    if (onUpdate) onUpdate();
  };

  const fmt = (n) => Number(n || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Cargando...</div>;

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.4rem', fontWeight: 700 }}>Panel de Armado</h2>

      {pedidos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Package size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>No hay pedidos aprobados para armar</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {pedidos.map(pedido => {
            const pedidoItems = items[pedido.id] || [];
            const completado = todosCheckeados(pedido.id);
            const checkeadosCount = pedidoItems.filter(i => checkeados[pedido.id]?.[i.id]).length;

            return (
              <div key={pedido.id} className="glass-card" style={{ padding: '1.2rem', borderTop: `3px solid ${completado ? '#22c55e' : '#3b82f6'}` }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{pedido.clientes?.nombre}</div>
                  {pedido.clientes?.direccion && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      📍 {pedido.clientes.direccion}
                    </div>
                  )}
                  {pedido.observaciones && (
                    <div style={{ fontSize: '0.82rem', background: '#fef3c7', padding: '4px 8px', borderRadius: '6px', marginTop: '6px' }}>
                      ⚠️ {pedido.observaciones}
                    </div>
                  )}
                </div>

                {/* Checklist de items */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                    PRODUCTOS ({checkeadosCount}/{pedidoItems.length})
                  </div>
                  {pedidoItems.map(item => {
                    const checked = checkeados[pedido.id]?.[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleCheck(pedido.id, item.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
                          background: checked ? '#f0fdf4' : '#f8fafc',
                          marginBottom: '4px', transition: 'background 0.15s',
                          textDecoration: checked ? 'line-through' : 'none',
                          color: checked ? '#86efac' : 'var(--text)'
                        }}
                      >
                        {checked ? <CheckSquare size={18} color="#22c55e" /> : <Square size={18} color="#94a3b8" />}
                        <span style={{ flex: 1, fontSize: '0.9rem' }}>{item.producto_nombre}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.cantidad}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700 }}>{fmt(pedido.total)}</span>
                  <button
                    onClick={() => despachar(pedido)}
                    disabled={!completado}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: completado ? '#22c55e' : '#e2e8f0',
                      color: completado ? 'white' : '#94a3b8',
                      border: 'none', borderRadius: '8px', padding: '8px 16px',
                      cursor: completado ? 'pointer' : 'not-allowed',
                      fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.2s'
                    }}
                  >
                    <Send size={14} /> Despachar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PanelArmado;
