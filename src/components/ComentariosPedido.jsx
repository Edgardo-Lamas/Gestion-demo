import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const COLORES = {
    'Recepción':  '#3b82f6',
    'Armado':     '#8b5cf6',
    'Repartidor': '#10b981',
};

const timeAgo = (str) => {
    const diff = Date.now() - new Date(str).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'ahora';
    if (m < 60) return `hace ${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `hace ${h}h`;
    return new Date(str).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
};

export default function ComentariosPedido({ pedidoId, autor }) {
    const [comentarios, setComentarios] = useState([]);
    const [texto, setTexto]             = useState('');
    const [saving, setSaving]           = useState(false);
    const [abierto, setAbierto]         = useState(false);
    const bottomRef                     = useRef(null);
    const inputRef                      = useRef(null);

    const color = COLORES[autor] || '#64748b';

    const fetch = async () => {
        const { data } = await supabase
            .from('comentarios_pedido')
            .select('*')
            .eq('pedido_id', pedidoId)
            .order('created_at');
        setComentarios(data || []);
    };

    useEffect(() => {
        if (!pedidoId) return;
        fetch();
    }, [pedidoId]);

    useEffect(() => {
        if (abierto) {
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                inputRef.current?.focus();
            }, 50);
        }
    }, [abierto]);

    useEffect(() => {
        if (abierto) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comentarios]);

    const enviar = async () => {
        if (!texto.trim() || saving) return;
        setSaving(true);
        const { data } = await supabase
            .from('comentarios_pedido')
            .insert({ pedido_id: pedidoId, autor, texto: texto.trim() })
            .select().single();
        if (data) {
            setComentarios(p => [...p, data]);
            setTexto('');
        }
        setSaving(false);
    };

    const count = comentarios.length;

    return (
        <div className="cp-root">
            {/* Toggle */}
            <button
                className="cp-toggle"
                onClick={() => setAbierto(a => !a)}
                style={{ '--cc': color }}
            >
                <span className="cp-toggle-icon">💬</span>
                <span className="cp-toggle-label">
                    {count === 0 ? 'Agregar nota' : `${count} nota${count !== 1 ? 's' : ''}`}
                </span>
                {count > 0 && <span className="cp-count-badge" style={{ background: color }}>{count}</span>}
                <span className="cp-chevron">{abierto ? '▲' : '▼'}</span>
            </button>

            {/* Panel */}
            {abierto && (
                <div className="cp-panel">
                    {/* Thread */}
                    <div className="cp-thread">
                        {count === 0 ? (
                            <p className="cp-empty">Sin notas aún.</p>
                        ) : (
                            comentarios.map(c => {
                                const cc = COLORES[c.autor] || '#64748b';
                                const esPropio = c.autor === autor;
                                return (
                                    <div key={c.id} className={`cp-msg ${esPropio ? 'cp-propio' : 'cp-ajeno'}`}>
                                        <div
                                            className="cp-avatar"
                                            style={{ background: cc + '18', color: cc, border: `1.5px solid ${cc}30` }}
                                            title={c.autor}
                                        >
                                            {c.autor[0]}
                                        </div>
                                        <div className="cp-bubble" style={{ borderLeft: `3px solid ${cc}` }}>
                                            <div className="cp-meta">
                                                <span className="cp-autor" style={{ color: cc }}>{c.autor}</span>
                                                <span className="cp-time">{timeAgo(c.created_at)}</span>
                                            </div>
                                            <p className="cp-texto">{c.texto}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="cp-input-row">
                        <div className="cp-input-autor" style={{ background: color + '18', color }}>
                            {autor[0]}
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            className="cp-input"
                            value={texto}
                            onChange={e => setTexto(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviar()}
                            placeholder={`Nota de ${autor}... (Enter para enviar)`}
                            maxLength={500}
                        />
                        <button
                            className="cp-send"
                            onClick={enviar}
                            disabled={saving || !texto.trim()}
                            style={{ background: color }}
                            title="Enviar"
                        >
                            ↑
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .cp-root {
                    margin-top: 0.85rem;
                    border-top: 1px solid var(--border);
                    padding-top: 0.75rem;
                }

                /* Toggle button */
                .cp-toggle {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    background: none;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 0.38rem 0.75rem;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    transition: all 0.2s;
                    width: 100%;
                }
                .cp-toggle:hover {
                    border-color: var(--cc);
                    color: var(--cc);
                    background: rgba(0,0,0,0.02);
                }
                .cp-toggle-icon { font-size: 0.9rem; }
                .cp-toggle-label { flex: 1; text-align: left; }
                .cp-count-badge {
                    color: white;
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 0.1rem 0.45rem;
                    border-radius: 10px;
                    min-width: 18px;
                    text-align: center;
                }
                .cp-chevron { font-size: 0.6rem; color: var(--text-muted); }

                /* Panel */
                .cp-panel {
                    margin-top: 0.6rem;
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    overflow: hidden;
                    background: var(--surface);
                }

                /* Thread */
                .cp-thread {
                    max-height: 220px;
                    overflow-y: auto;
                    padding: 0.75rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.65rem;
                    scroll-behavior: smooth;
                }

                .cp-empty {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-style: italic;
                    text-align: center;
                    padding: 0.75rem 0;
                }

                .cp-msg {
                    display: flex;
                    gap: 0.55rem;
                    align-items: flex-start;
                }

                .cp-avatar {
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.72rem;
                    font-weight: 800;
                    flex-shrink: 0;
                }

                .cp-bubble {
                    flex: 1;
                    min-width: 0;
                    background: var(--background);
                    border-radius: 0 8px 8px 8px;
                    padding: 0.45rem 0.65rem;
                }

                .cp-meta {
                    display: flex;
                    align-items: baseline;
                    gap: 0.5rem;
                    margin-bottom: 0.2rem;
                }

                .cp-autor {
                    font-size: 0.72rem;
                    font-weight: 800;
                }

                .cp-time {
                    font-size: 0.67rem;
                    color: var(--text-muted);
                }

                .cp-texto {
                    font-size: 0.82rem;
                    color: var(--text);
                    line-height: 1.45;
                    margin: 0;
                    word-break: break-word;
                }

                /* Input */
                .cp-input-row {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    border-top: 1px solid var(--border);
                    padding: 0.5rem 0.6rem;
                    gap: 0.5rem;
                    background: var(--surface);
                }

                .cp-input-autor {
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.72rem;
                    font-weight: 800;
                    flex-shrink: 0;
                }

                .cp-input {
                    flex: 1;
                    border: none;
                    background: var(--background);
                    border-radius: 6px;
                    padding: 0.42rem 0.7rem;
                    font-family: inherit;
                    font-size: 0.82rem;
                    color: var(--text);
                    outline: none;
                    min-width: 0;
                }

                .cp-input::placeholder { color: var(--text-muted); }

                .cp-send {
                    width: 30px;
                    height: 30px;
                    border-radius: 8px;
                    border: none;
                    color: white;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: all 0.2s;
                    line-height: 1;
                }

                .cp-send:hover:not(:disabled) { filter: brightness(1.12); transform: translateY(-1px); }
                .cp-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
            `}</style>
        </div>
    );
}
