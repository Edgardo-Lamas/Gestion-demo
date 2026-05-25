import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, ChevronDown, Sparkles } from 'lucide-react';

const TOOL_LABELS = {
  consultar_productos: 'Consultando productos...',
  consultar_ventas: 'Consultando ventas...',
  consultar_compras: 'Consultando compras...',
  consultar_gastos: 'Consultando gastos...',
  consultar_clientes: 'Consultando clientes...',
  verificar_stock_bajo: 'Verificando stock...',
  resumen_diario: 'Generando resumen del día...'
};

const SUGERENCIAS = [
  '¿Qué stock tenemos hoy?',
  'Resumen del día',
  '¿Qué productos tienen stock bajo?',
  '¿Cuánto vendimos esta semana?'
];

function ToolIndicator({ tools }) {
  if (!tools?.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '6px' }}>
      {tools.map((t, i) => (
        <span key={i} style={{
          fontSize: '0.7rem',
          color: '#2A6B2A',
          background: 'rgba(42,107,42,0.08)',
          padding: '2px 8px',
          borderRadius: '10px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          width: 'fit-content'
        }}>
          <Sparkles size={10} />
          {TOOL_LABELS[t] || t}
        </span>
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '12px'
    }}>
      <div style={{ maxWidth: '85%' }}>
        {!isUser && <ToolIndicator tools={msg.toolsUsed} />}
        <div style={{
          padding: '10px 14px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: isUser ? '#2A6B2A' : 'white',
          color: isUser ? 'white' : '#1e293b',
          fontSize: '0.875rem',
          lineHeight: 1.55,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: isUser ? 'none' : '1px solid #e2e8f0',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {msg.content}
        </div>
        <div style={{
          fontSize: '0.65rem',
          color: '#94a3b8',
          marginTop: '3px',
          textAlign: isUser ? 'right' : 'left',
          paddingLeft: isUser ? 0 : '4px',
          paddingRight: isUser ? '4px' : 0
        }}>
          {msg.time}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
      <div style={{
        padding: '10px 14px',
        borderRadius: '16px 16px 16px 4px',
        background: 'white',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        display: 'flex',
        gap: '4px',
        alignItems: 'center'
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#2A6B2A',
            animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
            display: 'inline-block'
          }} />
        ))}
      </div>
    </div>
  );
}

export default function AgentChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola Gladis! Soy Agi, tu asistente de AGIAPURR. 🌿\n¿En qué te puedo ayudar hoy?',
      time: horaActual(),
      toolsUsed: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function sendMessage(text) {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput('');
    const userMsg = { role: 'user', content: userText, time: horaActual() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    // Historial en formato que espera la API
    const apiMessages = nextMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error del servidor');

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        time: horaActual(),
        toolsUsed: data.toolsUsed || []
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Lo siento, hubo un error: ${err.message}`,
        time: horaActual(),
        toolsUsed: []
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(42,107,42,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(42,107,42,0); }
          100% { box-shadow: 0 0 0 0 rgba(42,107,42,0); }
        }
      `}</style>

      {/* Panel del chat */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          width: 'min(380px, calc(100vw - 40px))',
          height: 'min(520px, calc(100vh - 120px))',
          background: '#f8faf8',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(42,107,42,0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9998,
          animation: 'slideUp 0.25s ease',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #2A6B2A, #4A8B35)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Bot size={20} color="white" />
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1 }}>Agi</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem', marginTop: '2px' }}>
                  {loading ? 'Consultando datos...' : 'Asistente AGIAPURR · en línea'}
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none', borderRadius: '8px',
              color: 'white', cursor: 'pointer',
              padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Mensajes */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column'
          }}>
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias (solo si 1 mensaje) */}
          {messages.length === 1 && !loading && (
            <div style={{ padding: '0 16px 10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SUGERENCIAS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  style={{
                    background: 'white',
                    border: '1px solid rgba(42,107,42,0.25)',
                    borderRadius: '20px',
                    padding: '5px 12px',
                    fontSize: '0.75rem',
                    color: '#2A6B2A',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 0.15s'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '12px',
            background: 'white',
            borderTop: '1px solid #e8f0e8',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end',
            flexShrink: 0
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribí tu pregunta o pedido..."
              rows={1}
              style={{
                flex: 1,
                border: '1px solid #d1e8d1',
                borderRadius: '12px',
                padding: '9px 12px',
                fontSize: '0.875rem',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.5,
                maxHeight: '80px',
                overflowY: 'auto',
                background: '#f8faf8',
                color: '#1e293b'
              }}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: '38px', height: '38px',
                borderRadius: '12px',
                background: input.trim() && !loading ? '#2A6B2A' : '#d1e8d1',
                border: 'none',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
            >
              {loading
                ? <Loader2 size={16} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                : <Send size={16} color={input.trim() ? 'white' : '#94a3b8'} />
              }
            </button>
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: isOpen ? '#1A4A1A' : 'linear-gradient(135deg, #2A6B2A, #4A8B35)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          boxShadow: '0 4px 20px rgba(42,107,42,0.4)',
          transition: 'all 0.2s',
          animation: !isOpen ? 'pulse-ring 2.5s infinite' : 'none'
        }}
        title={isOpen ? 'Cerrar Agi' : 'Abrir asistente Agi'}
      >
        {isOpen
          ? <X size={22} color="white" />
          : <Bot size={24} color="white" />
        }
      </button>
    </>
  );
}

function horaActual() {
  return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}
