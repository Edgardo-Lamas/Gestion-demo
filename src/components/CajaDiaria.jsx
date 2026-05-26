import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CONCEPTOS = {
    ingreso: ['Venta en efectivo', 'Venta por transferencia', 'Cobro a cliente', 'Otro ingreso'],
    egreso:  ['Compra a proveedor', 'Pago a proveedor', 'Gasto operativo', 'Retiro', 'Otro egreso'],
};

const MEDIOS = ['efectivo', 'transferencia', 'cheque', 'otro'];

const today = () => new Date().toISOString().split('T')[0];
const fmt = n => (n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CajaDiaria() {
    const [caja, setCaja]           = useState(null);
    const [movimientos, setMovs]    = useState([]);
    const [loading, setLoading]     = useState(true);
    const [montoInicial, setMonto]  = useState('');
    const [showModal, setModal]     = useState(false);
    const [modalTipo, setTipo]      = useState('ingreso');
    const [saving, setSaving]       = useState(false);
    const [error, setError]         = useState('');
    const [form, setForm]           = useState({ concepto: '', medio_pago: 'efectivo', monto: '', descripcion: '' });

    const dateStr = new Date().toLocaleDateString('es-AR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    // ── fetch ──────────────────────────────────────────────────────
    const fetchCaja = async () => {
        setLoading(true);
        const { data: c } = await supabase.from('cajas').select('*').eq('fecha', today()).maybeSingle();
        if (c) {
            setCaja(c);
            const { data: m } = await supabase
                .from('movimientos_caja').select('*').eq('caja_id', c.id).order('created_at');
            setMovs(m || []);
        } else {
            setCaja(null); setMovs([]);
        }
        setLoading(false);
    };

    useEffect(() => { fetchCaja(); }, []);

    // ── acciones ───────────────────────────────────────────────────
    const abrirCaja = async () => {
        setSaving(true);
        setError('');
        const { data, err } = await supabase
            .from('cajas')
            .insert({ fecha: today(), monto_inicial: parseFloat(montoInicial) || 0 })
            .select().single();
        if (!err && data) { setCaja(data); setMonto(''); }
        else setError('No se pudo abrir la caja. Asegurate de haber ejecutado la migración SQL en Supabase.');
        setSaving(false);
    };

    const cerrarCaja = async () => {
        if (!window.confirm('¿Confirmás el cierre de caja del día?')) return;
        await supabase.from('cajas').update({ estado: 'cerrada' }).eq('id', caja.id);
        setCaja(p => ({ ...p, estado: 'cerrada' }));
    };

    const openModal = (tipo) => {
        setTipo(tipo);
        setForm({ concepto: CONCEPTOS[tipo][0], medio_pago: 'efectivo', monto: '', descripcion: '' });
        setModal(true);
    };

    const guardarMovimiento = async () => {
        if (!form.concepto || parseFloat(form.monto) <= 0) return;
        setSaving(true);
        const { data, error } = await supabase
            .from('movimientos_caja')
            .insert({ caja_id: caja.id, tipo: modalTipo, ...form, monto: parseFloat(form.monto) })
            .select().single();
        if (!error) { setMovs(p => [...p, data]); setModal(false); }
        setSaving(false);
    };

    const eliminar = async (id) => {
        if (!window.confirm('¿Eliminar este movimiento?')) return;
        await supabase.from('movimientos_caja').delete().eq('id', id);
        setMovs(p => p.filter(m => m.id !== id));
    };

    // ── stats ──────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const ing = movimientos.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0);
        const egr = movimientos.filter(m => m.tipo === 'egreso').reduce((s, m) => s + m.monto, 0);
        return { ing, egr, saldo: (caja?.monto_inicial || 0) + ing - egr };
    }, [movimientos, caja]);

    const ingresos = movimientos.filter(m => m.tipo === 'ingreso');
    const egresos  = movimientos.filter(m => m.tipo === 'egreso');

    // ── render ─────────────────────────────────────────────────────
    if (loading) return <div className="caja-spinner"><div className="spinner" /></div>;

    // Pantalla apertura
    if (!caja) return (
        <div className="caja-open-wrap">
            <div className="glass-card caja-open-card">
                <span className="caja-open-emoji">💰</span>
                <h2>Abrir Caja del Día</h2>
                <p className="caja-open-date">{dateStr}</p>
                <p className="caja-open-hint">Ingresá el dinero físico disponible al inicio del día</p>
                <div className="caja-open-row">
                    <span className="caja-peso">$</span>
                    <input
                        type="number" min="0" step="0.01"
                        value={montoInicial}
                        onChange={e => setMonto(e.target.value)}
                        placeholder="0.00"
                        className="caja-open-input"
                        onKeyDown={e => e.key === 'Enter' && abrirCaja()}
                        autoFocus
                    />
                </div>
                <button className="caja-open-btn" onClick={abrirCaja} disabled={saving}>
                    {saving ? 'Abriendo...' : '🔓 Abrir Caja'}
                </button>
                {error && <p className="caja-open-error">{error}</p>}
            </div>

            <style jsx>{`
                .caja-open-wrap { display:flex; align-items:center; justify-content:center; min-height:60vh; }
                .caja-open-card { max-width:420px; width:100%; padding:3rem 2.5rem; display:flex; flex-direction:column; align-items:center; gap:1rem; text-align:center; }
                .caja-open-emoji { font-size:3rem; }
                .caja-open-card h2 { font-size:1.5rem; color:var(--text); }
                .caja-open-date { font-size:.85rem; color:var(--text-muted); text-transform:capitalize; }
                .caja-open-hint { font-size:.87rem; color:var(--text-muted); line-height:1.5; }
                .caja-open-row { display:flex; align-items:center; gap:.5rem; background:var(--background); border:2px solid var(--border); border-radius:12px; padding:.75rem 1rem; width:100%; transition:border-color .2s; }
                .caja-open-row:focus-within { border-color:var(--primary); }
                .caja-peso { font-size:1.5rem; font-weight:800; color:var(--primary); }
                .caja-open-input { border:none; background:transparent; font-size:1.5rem; font-weight:800; color:var(--text); width:100%; outline:none; font-family:inherit; }
                .caja-open-btn { width:100%; background:var(--primary); color:white; border:none; padding:.9rem; border-radius:12px; font-size:1rem; font-weight:700; cursor:pointer; margin-top:.5rem; transition:all .2s; box-shadow:0 4px 12px rgba(59,122,87,.3); }
                .caja-open-btn:hover { background:var(--primary-hover); transform:translateY(-1px); }
                .caja-open-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }
                .caja-open-error { font-size:.8rem; color:#dc2626; background:rgba(220,38,38,.08); border:1px solid rgba(220,38,38,.2); border-radius:8px; padding:.5rem .9rem; width:100%; text-align:center; line-height:1.4; }
            `}</style>
        </div>
    );

    // Caja abierta / cerrada
    return (
        <div className="caja-root">

            {/* Header */}
            <div className="glass-card caja-header">
                <div className="caja-header-left">
                    <span className="caja-fecha-str">{dateStr}</span>
                    <span className={`estado-badge ${caja.estado === 'abierta' ? 'badge-open' : 'badge-closed'}`}>
                        {caja.estado === 'abierta' ? '🔓 Caja Abierta' : '🔒 Caja Cerrada'}
                    </span>
                </div>
                {caja.estado === 'abierta' && (
                    <button className="btn-cerrar" onClick={cerrarCaja}>🔒 Cerrar Caja</button>
                )}
            </div>

            {/* KPI cards */}
            <div className="caja-kpis">
                {[
                    { label: 'Caja Inicial',     value: caja.monto_inicial, color: '#64748b' },
                    { label: 'Total Ingresos',   value: stats.ing,          color: '#059669' },
                    { label: 'Total Egresos',    value: stats.egr,          color: '#dc2626' },
                    { label: 'Saldo Final',      value: stats.saldo,        color: '#C9A84C', focus: true },
                ].map(k => (
                    <div key={k.label} className={`caja-kpi${k.focus ? ' kpi-focus' : ''}`} style={{ '--kc': k.color }}>
                        <span className="kpi-lbl">{k.label}</span>
                        <span className="kpi-val" style={{ color: k.color }}>${fmt(k.value)}</span>
                    </div>
                ))}
            </div>

            {/* Paneles movimientos */}
            <div className="caja-panels">

                {/* Ingresos */}
                <div className="mov-panel">
                    <div className="panel-head">
                        <h3 className="panel-title" style={{ color: '#059669' }}>↓ Ingresos</h3>
                        {caja.estado === 'abierta' && (
                            <button className="btn-add green" onClick={() => openModal('ingreso')}>
                                <Plus size={14} /> Agregar
                            </button>
                        )}
                    </div>

                    {ingresos.length === 0
                        ? <p className="panel-empty">Sin ingresos registrados</p>
                        : <div className="mov-list">
                            {ingresos.map(m => (
                                <div key={m.id} className="mov-row ing-row">
                                    <div className="mov-info">
                                        <span className="mov-concepto">{m.concepto}</span>
                                        <span className="mov-medio">{m.medio_pago}{m.descripcion ? ` · ${m.descripcion}` : ''}</span>
                                    </div>
                                    <div className="mov-right">
                                        <span className="mov-monto" style={{ color: '#059669' }}>+${fmt(m.monto)}</span>
                                        {caja.estado === 'abierta' && <button className="btn-del" onClick={() => eliminar(m.id)}>×</button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    }

                    <div className="panel-subtotal">
                        <span>Subtotal</span>
                        <span style={{ color: '#059669', fontWeight: 800 }}>${fmt(stats.ing)}</span>
                    </div>
                </div>

                {/* Egresos */}
                <div className="mov-panel">
                    <div className="panel-head">
                        <h3 className="panel-title" style={{ color: '#dc2626' }}>↑ Egresos</h3>
                        {caja.estado === 'abierta' && (
                            <button className="btn-add red" onClick={() => openModal('egreso')}>
                                <Plus size={14} /> Agregar
                            </button>
                        )}
                    </div>

                    {egresos.length === 0
                        ? <p className="panel-empty">Sin egresos registrados</p>
                        : <div className="mov-list">
                            {egresos.map(m => (
                                <div key={m.id} className="mov-row egr-row">
                                    <div className="mov-info">
                                        <span className="mov-concepto">{m.concepto}</span>
                                        <span className="mov-medio">{m.medio_pago}{m.descripcion ? ` · ${m.descripcion}` : ''}</span>
                                    </div>
                                    <div className="mov-right">
                                        <span className="mov-monto" style={{ color: '#dc2626' }}>-${fmt(m.monto)}</span>
                                        {caja.estado === 'abierta' && <button className="btn-del" onClick={() => eliminar(m.id)}>×</button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    }

                    <div className="panel-subtotal">
                        <span>Subtotal</span>
                        <span style={{ color: '#dc2626', fontWeight: 800 }}>${fmt(stats.egr)}</span>
                    </div>
                </div>
            </div>

            {/* Modal nuevo movimiento */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{ color: modalTipo === 'ingreso' ? '#059669' : '#dc2626' }}>
                                {modalTipo === 'ingreso' ? '↓ Nuevo Ingreso' : '↑ Nuevo Egreso'}
                            </h2>
                            <button className="icon-btn delete" onClick={() => setModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="cj-field">
                                <label>Concepto</label>
                                <select value={form.concepto} onChange={e => setForm(f => ({ ...f, concepto: e.target.value }))}>
                                    {CONCEPTOS[modalTipo].map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="cj-field">
                                <label>Medio de pago</label>
                                <select value={form.medio_pago} onChange={e => setForm(f => ({ ...f, medio_pago: e.target.value }))}>
                                    {MEDIOS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                                </select>
                            </div>
                            <div className="cj-field">
                                <label>Monto *</label>
                                <input
                                    type="number" min="0.01" step="0.01" autoFocus
                                    value={form.monto}
                                    onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                                    placeholder="0.00"
                                    onKeyDown={e => e.key === 'Enter' && guardarMovimiento()}
                                />
                            </div>
                            <div className="cj-field">
                                <label>Descripción (opcional)</label>
                                <input
                                    type="text"
                                    value={form.descripcion}
                                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                                    placeholder="Detalle adicional..."
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="cj-btn-cancel" onClick={() => setModal(false)}>Cancelar</button>
                            <button
                                className="cj-btn-save"
                                onClick={guardarMovimiento}
                                disabled={saving || !form.monto || parseFloat(form.monto) <= 0}
                                style={{ background: modalTipo === 'ingreso' ? '#059669' : '#dc2626' }}
                            >
                                {saving ? 'Guardando...' : `Registrar ${modalTipo === 'ingreso' ? 'Ingreso' : 'Egreso'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .caja-spinner { display:flex; justify-content:center; padding:3rem; }
                .caja-root { display:flex; flex-direction:column; gap:1.5rem; animation:fadeSlideUp .4s ease-out; }
                @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

                /* Header */
                .caja-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
                .caja-header-left { display:flex; flex-direction:column; gap:.35rem; }
                .caja-fecha-str { font-size:.87rem; color:var(--text-muted); text-transform:capitalize; }
                .estado-badge { font-size:.82rem; font-weight:700; padding:.28rem .75rem; border-radius:20px; width:fit-content; }
                .badge-open   { background:rgba(5,150,105,.1); color:#059669; }
                .badge-closed { background:rgba(100,116,139,.1); color:#64748b; }
                .btn-cerrar { background:rgba(220,38,38,.08); color:#dc2626; border:1px solid rgba(220,38,38,.2); padding:.55rem 1.1rem; border-radius:10px; font-weight:700; font-size:.85rem; cursor:pointer; transition:all .2s; }
                .btn-cerrar:hover { background:rgba(220,38,38,.15); }

                /* KPIs */
                .caja-kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
                .caja-kpi { background:var(--surface); border-radius:12px; padding:1.2rem; box-shadow:var(--shadow); display:flex; flex-direction:column; gap:.45rem; border-top:4px solid var(--kc); transition:transform .2s; }
                .caja-kpi:hover { transform:translateY(-3px); }
                .kpi-focus { box-shadow:0 4px 20px rgba(201,168,76,.2); border:1px solid rgba(201,168,76,.25); border-top:4px solid var(--kc); }
                .kpi-lbl { font-size:.7rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.05em; }
                .kpi-val { font-size:1.4rem; font-weight:800; letter-spacing:-.3px; }

                /* Panels */
                .caja-panels { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
                .mov-panel { background:var(--glass); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,.3); border-radius:var(--radius); box-shadow:var(--shadow); padding:1.5rem; display:flex; flex-direction:column; gap:1rem; min-height:280px; }
                .panel-head { display:flex; align-items:center; justify-content:space-between; }
                .panel-title { font-size:1rem; font-weight:800; }
                .btn-add { display:flex; align-items:center; gap:.3rem; padding:.38rem .8rem; border-radius:8px; font-size:.78rem; font-weight:700; border:none; cursor:pointer; transition:all .2s; }
                .btn-add.green { background:rgba(5,150,105,.1); color:#059669; }
                .btn-add.green:hover { background:rgba(5,150,105,.2); }
                .btn-add.red   { background:rgba(220,38,38,.1); color:#dc2626; }
                .btn-add.red:hover { background:rgba(220,38,38,.2); }
                .panel-empty { font-size:.84rem; color:var(--text-muted); font-style:italic; text-align:center; padding:1.5rem 0; flex:1; display:flex; align-items:center; justify-content:center; }
                .mov-list { display:flex; flex-direction:column; gap:.45rem; }
                .mov-row { display:flex; align-items:center; justify-content:space-between; padding:.7rem .85rem; border-radius:9px; gap:.75rem; }
                .ing-row { background:rgba(5,150,105,.06); border:1px solid rgba(5,150,105,.12); }
                .egr-row { background:rgba(220,38,38,.06); border:1px solid rgba(220,38,38,.12); }
                .mov-info { display:flex; flex-direction:column; gap:.12rem; min-width:0; flex:1; }
                .mov-concepto { font-size:.87rem; font-weight:700; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
                .mov-medio { font-size:.7rem; color:var(--text-muted); text-transform:capitalize; }
                .mov-right { display:flex; align-items:center; gap:.45rem; flex-shrink:0; }
                .mov-monto { font-size:.93rem; font-weight:800; }
                .btn-del { background:none; border:none; color:var(--text-muted); font-size:1.1rem; cursor:pointer; padding:0 .15rem; line-height:1; transition:color .2s; }
                .btn-del:hover { color:var(--error); }
                .panel-subtotal { display:flex; justify-content:space-between; padding-top:.75rem; border-top:1px solid var(--border); font-size:.84rem; color:var(--text-muted); font-weight:600; margin-top:auto; }

                /* Modal form fields */
                .cj-field { display:flex; flex-direction:column; gap:.35rem; margin-bottom:.9rem; }
                .cj-field label { font-size:.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.04em; }
                .cj-field input, .cj-field select { padding:.62rem .9rem; border:1.5px solid var(--border); border-radius:9px; font-family:inherit; font-size:.95rem; color:var(--text); background:var(--surface); outline:none; transition:border-color .2s; }
                .cj-field input:focus, .cj-field select:focus { border-color:var(--primary); }
                .cj-btn-cancel { background:transparent; border:1.5px solid var(--border); color:var(--text-muted); padding:.65rem 1.4rem; border-radius:10px; font-weight:600; cursor:pointer; transition:all .2s; }
                .cj-btn-cancel:hover { border-color:var(--text-muted); }
                .cj-btn-save { color:white; border:none; padding:.65rem 1.6rem; border-radius:10px; font-weight:700; font-size:.9rem; cursor:pointer; transition:all .2s; box-shadow:0 4px 12px rgba(0,0,0,.15); }
                .cj-btn-save:hover { filter:brightness(1.1); transform:translateY(-1px); }
                .cj-btn-save:disabled { opacity:.5; cursor:not-allowed; transform:none; }

                @media (max-width:768px) {
                    .caja-kpis   { grid-template-columns:repeat(2,1fr); }
                    .caja-panels { grid-template-columns:1fr; }
                }
                @media (max-width:480px) {
                    .caja-kpis { grid-template-columns:1fr 1fr; }
                }
            `}</style>
        </div>
    );
}
