import React, { useMemo, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Receipt,
    BadgeDollarSign,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEMANA = ['L','M','X','J','V','S','D'];

const Dashboard = ({ compras, ventas, gastos, productos, stock_actual, onNavigate }) => {
    const [now, setNow] = useState(new Date());
    const [pedidosPendientes, setPedidosPendientes] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchPendientes = async () => {
            const { count } = await supabase
                .from('pedidos')
                .select('*', { count: 'exact', head: true })
                .in('estado', ['pendiente', 'aprobado']);
            setPedidosPendientes(count ?? 0);
        };
        fetchPendientes();
        // Refresca cada 60s para que el badge se mantenga actualizado
        const interval = setInterval(fetchPendientes, 60000);
        return () => clearInterval(interval);
    }, []);

    const estadisticas = useMemo(() => {
        const total_ingresos = (ventas || []).reduce((sum, v) => sum + (v.ingreso_total || 0), 0);
        const total_costo_mercaderia = (ventas || []).reduce((sum, v) => sum + (v.costo_calculado || 0), 0);
        const ganancia_bruta = total_ingresos - total_costo_mercaderia;
        const total_gastos = (gastos || []).reduce((sum, g) => sum + (g.monto || 0), 0);
        const resultado_final = ganancia_bruta - total_gastos;
        return { total_ingresos, total_costo_mercaderia, ganancia_bruta, total_gastos, resultado_final };
    }, [ventas, gastos]);

    const mesStats = useMemo(() => {
        const cm = now.getMonth(), cy = now.getFullYear();
        const pm = cm === 0 ? 11 : cm - 1, py = cm === 0 ? cy - 1 : cy;
        const byMonth = (arr, m, y) => (arr || []).filter(item => {
            const d = new Date(item.fecha + 'T00:00:00');
            return d.getMonth() === m && d.getFullYear() === y;
        });
        const ventasStats = (arr) => ({
            ingresos: arr.reduce((s, v) => s + (v.ingreso_total || 0), 0),
            costo: arr.reduce((s, v) => s + (v.costo_calculado || 0), 0),
        });
        const totalGastos = (arr) => arr.reduce((s, g) => s + (g.monto || 0), 0);
        const vA = ventasStats(byMonth(ventas, cm, cy));
        const vP = ventasStats(byMonth(ventas, pm, py));
        const gA = totalGastos(byMonth(gastos, cm, cy));
        const gP = totalGastos(byMonth(gastos, pm, py));
        const ganA = vA.ingresos - vA.costo;
        const ganP = vP.ingresos - vP.costo;
        const pct = (a, p) => p === 0 ? (a > 0 ? 100 : 0) : ((a - p) / p) * 100;
        return {
            monthName: now.toLocaleDateString('es-AR', { month: 'long' }),
            ingresos: vA.ingresos, cambioIngresos: pct(vA.ingresos, vP.ingresos),
            ganancia: ganA, cambioGanancia: pct(ganA, ganP),
            gastos: gA, cambioGastos: pct(gA, gP),
        };
    }, [ventas, gastos, now]);

    const stockAlertas = useMemo(() => {
        if (!productos || !stock_actual) return [];
        return productos
            .map(p => ({ ...p, stock: stock_actual[p.id] || 0 }))
            .filter(p => p.stock < 10)
            .sort((a, b) => a.stock - b.stock);
    }, [productos, stock_actual]);

    const dataIngresosGastos = useMemo(() => {
        const data = {};
        (ventas || []).forEach(v => {
            const date = v.fecha;
            if (!data[date]) data[date] = { name: date, ingresos: 0, gastos: 0 };
            data[date].ingresos += v.ingreso_total;
        });
        (gastos || []).forEach(g => {
            const date = g.fecha;
            if (!data[date]) data[date] = { name: date, ingresos: 0, gastos: 0 };
            data[date].gastos += g.monto;
        });
        return Object.values(data).sort((a, b) => new Date(a.name) - new Date(b.name)).slice(-7);
    }, [ventas, gastos]);

    const dataGastosCat = useMemo(() => {
        const data = {};
        (gastos || []).forEach(g => {
            const cat = g.categoria || 'Otros';
            if (!data[cat]) data[cat] = 0;
            data[cat] += (g.monto || 0);
        });
        return Object.entries(data)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [gastos]);

    const dataVentasProducto = useMemo(() => {
        const data = {};
        (ventas || []).forEach(v => {
            if (!v.producto_nombre) return;
            if (!data[v.producto_nombre]) data[v.producto_nombre] = 0;
            data[v.producto_nombre] += (v.cantidad_vendida || v.cantidad || 0);
        });
        return Object.entries(data)
            .map(([name, value]) => ({ name, value: value || 0 }))
            .sort((a, b) => b.value - a.value);
    }, [ventas]);

    // Calendar data
    const calendarData = useMemo(() => {
        const year = now.getFullYear();
        const month = now.getMonth();
        const rawFirst = new Date(year, month, 1).getDay(); // 0=Dom
        const firstDay = rawFirst === 0 ? 6 : rawFirst - 1; // Semana empieza Lunes
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const ventasDays = new Set(
            (ventas || [])
                .filter(v => {
                    const d = new Date(v.fecha + 'T00:00:00');
                    return d.getMonth() === month && d.getFullYear() === year;
                })
                .map(v => new Date(v.fecha + 'T00:00:00').getDate())
        );
        return { firstDay, daysInMonth, ventasDays, today: now.getDate(), month, year };
    }, [ventas, now]);

    const calendarCells = useMemo(() => {
        const cells = [];
        for (let i = 0; i < calendarData.firstDay; i++) cells.push(null);
        for (let d = 1; d <= calendarData.daysInMonth; d++) cells.push(d);
        return cells;
    }, [calendarData]);

    // Clock & greeting
    const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const dateStr = now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

    const COLORS = ['#3B7A57', '#C9A84C', '#8B5E3C', '#8b5cf6', '#0ea5e9'];
    const GASTOS_COLORS = ['#C9A84C', '#8B5E3C', '#3B7A57', '#0ea5e9', '#8b5cf6', '#f59e0b'];

    const tarjetas = [
        { label: 'Ingresos Totales', value: estadisticas.total_ingresos, icon: DollarSign, color: '#3B7A57' },
        { label: 'Costos Mercadería', value: estadisticas.total_costo_mercaderia, icon: TrendingDown, color: '#64748b' },
        { label: 'Ganancia Bruta', value: estadisticas.ganancia_bruta, icon: TrendingUp, color: '#059669' },
        { label: 'Total de Gastos', value: estadisticas.total_gastos, icon: Receipt, color: '#ef4444' },
        {
            label: 'Resultado Final',
            value: estadisticas.resultado_final,
            icon: BadgeDollarSign,
            color: estadisticas.resultado_final >= 0 ? '#C9A84C' : '#ef4444',
            focus: true
        },
    ];

    const fmt = (n, dec = 0) => (n || 0).toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

    return (
        <div className="db-root">
            {/* ── STOCK ALERT ── */}
            {stockAlertas.length > 0 && (
                <div className="stock-alert-banner">
                    <span className="alert-icon">⚠</span>
                    <span className="alert-title">Stock bajo:</span>
                    <div className="alert-items">
                        {stockAlertas.map(p => (
                            <span key={p.id} className={`alert-chip ${p.stock === 0 ? 'sin-stock' : ''}`}>
                                {p.nombre} — {p.stock === 0 ? 'Sin stock' : `${p.stock.toFixed(1)} kg`}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── HERO BANNER ── */}
            <div className="hero-banner">
                {/* leaf pattern overlay */}
                <div className="hero-pattern" aria-hidden="true" />
                <div className="hero-inner">
                    <div className="hero-left">
                        <span className="hero-leaf-icon">🌿</span>
                        <div>
                            <p className="hero-greeting">{greeting}, <strong>Gladys</strong></p>
                            <p className="hero-date">{dateStr}</p>
                        </div>
                    </div>
                    <div className="hero-clock-wrap">
                        <span className="hero-clock">{timeStr}</span>
                    </div>
                </div>
                <div className="hero-pills">
                    <span className="hpill green">
                        <span className="hpill-dot" />
                        Ingresos del mes <strong>${fmt(mesStats.ingresos)}</strong>
                    </span>
                    <span className="hpill gold">
                        <span className="hpill-dot" />
                        Ganancia bruta <strong>${fmt(mesStats.ganancia)}</strong>
                    </span>
                    <span className={`hpill ${estadisticas.resultado_final >= 0 ? 'result-pos' : 'result-neg'}`}>
                        <span className="hpill-dot" />
                        Resultado <strong>${fmt(estadisticas.resultado_final)}</strong>
                    </span>
                </div>
            </div>

            {/* ── ACCIONES RÁPIDAS ── */}
            <div className="quick-actions">
                <button className="qa-card qa-venta" onClick={() => onNavigate?.('sales')}>
                    <span className="qa-emoji">💰</span>
                    <div className="qa-info">
                        <span className="qa-title">Nueva Venta</span>
                        <span className="qa-sub">Registrar venta rápida</span>
                    </div>
                    <span className="qa-arrow">→</span>
                </button>

                <button className="qa-card qa-pedidos" onClick={() => onNavigate?.('pedidos')}>
                    <div className="qa-emoji-wrap">
                        <span className="qa-emoji">📋</span>
                        {pedidosPendientes > 0 && (
                            <span className="qa-badge">{pedidosPendientes}</span>
                        )}
                    </div>
                    <div className="qa-info">
                        <span className="qa-title">
                            {pedidosPendientes === null
                                ? 'Pedidos...'
                                : pedidosPendientes === 0
                                    ? 'Sin pedidos pendientes'
                                    : `${pedidosPendientes} pedido${pedidosPendientes !== 1 ? 's' : ''} pendiente${pedidosPendientes !== 1 ? 's' : ''}`
                            }
                        </span>
                        <span className="qa-sub">Ver panel de recepción</span>
                    </div>
                    <span className="qa-arrow">→</span>
                </button>

                <button className="qa-card qa-caja" onClick={() => onNavigate?.('caja')}>
                    <span className="qa-emoji">🧾</span>
                    <div className="qa-info">
                        <span className="qa-title">Caja del Día</span>
                        <span className="qa-sub">Ingresos y egresos</span>
                    </div>
                    <span className="qa-arrow">→</span>
                </button>
            </div>

            {/* ── MES + CALENDARIO ── */}
            <div className="month-cal-row">
                <div className="mes-section">
                    <h3 className="section-label">Resumen de {mesStats.monthName}</h3>
                    <div className="mes-cards">
                        {[
                            { label: 'Ingresos', value: mesStats.ingresos, cambio: mesStats.cambioIngresos, color: '#3B7A57' },
                            { label: 'Ganancia bruta', value: mesStats.ganancia, cambio: mesStats.cambioGanancia, color: '#059669' },
                            { label: 'Gastos', value: mesStats.gastos, cambio: mesStats.cambioGastos, color: '#ef4444', invertir: true },
                        ].map((m) => {
                            const positivo = m.invertir ? m.cambio <= 0 : m.cambio >= 0;
                            return (
                                <div key={m.label} className="mes-card-v2">
                                    <div className="mes-accent" style={{ background: m.color }} />
                                    <div className="mes-body">
                                        <span className="mes-lbl">{m.label}</span>
                                        <span className="mes-val">${fmt(m.value)}</span>
                                        <span className={`mes-badge ${positivo ? 'badge-up' : 'badge-down'}`}>
                                            {positivo ? '▲' : '▼'} {Math.abs(m.cambio).toFixed(1)}% vs anterior
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mini calendario */}
                <div className="mini-cal glass-card">
                    <div className="cal-head">
                        <span className="cal-month">{MESES[calendarData.month]}</span>
                        <span className="cal-year">{calendarData.year}</span>
                    </div>
                    <div className="cal-grid">
                        {DIAS_SEMANA.map(d => (
                            <div key={d} className="cal-dow">{d}</div>
                        ))}
                        {calendarCells.map((day, idx) => (
                            <div
                                key={idx}
                                className={`cal-cell${!day ? ' cal-empty' : ''}${day === calendarData.today ? ' cal-today' : ''}`}
                            >
                                {day && (
                                    <>
                                        {day}
                                        {calendarData.ventasDays.has(day) && <span className="cal-dot" />}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="cal-legend">
                        <span className="cal-dot-demo" /><span>días con ventas</span>
                    </div>
                </div>
            </div>

            {/* ── KPI CARDS ── */}
            <div className="kpi-section">
                <h3 className="section-label">Acumulado total del período</h3>
                <div className="kpi-grid">
                    {tarjetas.map((t, i) => (
                        <div key={i} className={`kpi-card${t.focus ? ' kpi-focus' : ''}`}>
                            <div className="kpi-top-bar" style={{ background: t.color }} />
                            <div className="kpi-body">
                                <div className="kpi-icon" style={{ background: t.color + '18', color: t.color }}>
                                    <t.icon size={18} />
                                </div>
                                <span className="kpi-lbl">{t.label}</span>
                                <span className="kpi-val" style={{ color: t.focus && t.value < 0 ? '#ef4444' : 'var(--text)' }}>
                                    ${fmt(t.value, 2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── GRÁFICOS ── */}
            <div className="charts-grid">
                <section className="glass-card chart-card chart-card-double">
                    <h3>Ingresos vs Gastos</h3>
                    <p className="chart-hint">
                        <span style={{ color: '#10b981' }}>■</span> Ingresos &nbsp;
                        <span style={{ color: '#ef4444' }}>■</span> Gastos — últimos 7 días con actividad
                    </p>
                    <ResponsiveContainer width="100%" height={210}>
                        <AreaChart data={dataIngresosGastos}>
                            <defs>
                                <linearGradient id="gIngresos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gGastos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.7} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11}
                                tickFormatter={v => new Date(v).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${v}`} />
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <Tooltip
                                contentStyle={{ background: 'rgba(255,255,255,0.95)', borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={v => [`$${v}`, '']}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="ingresos" stroke="#10b981" fill="url(#gIngresos)" name="Ingresos" />
                            <Area type="monotone" dataKey="gastos" stroke="#ef4444" fill="url(#gGastos)" name="Gastos" />
                        </AreaChart>
                    </ResponsiveContainer>

                    <div className="chart-divider" />

                    <h3>Egresos por categoría</h3>
                    <p className="chart-hint">¿En qué se está gastando el negocio?</p>
                    {dataGastosCat.length > 0 ? (
                        <ResponsiveContainer width="100%" height={dataGastosCat.length * 38 + 16}>
                            <BarChart
                                data={dataGastosCat}
                                layout="vertical"
                                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                            >
                                <XAxis
                                    type="number"
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    width={88}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                                <Tooltip
                                    contentStyle={{ background: 'rgba(255,255,255,0.97)', borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={v => [`$${v.toLocaleString('es-AR')}`, 'Total']}
                                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                                />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
                                    {dataGastosCat.map((_, i) => (
                                        <Cell key={i} fill={GASTOS_COLORS[i % GASTOS_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="no-data">Registrá gastos para ver el desglose</p>
                    )}
                </section>

                <section className="glass-card chart-card">
                    <h3>Productos más vendidos</h3>
                    <div className="ranking-list">
                        {dataVentasProducto.length > 0 ? dataVentasProducto.map((item, index) => {
                            const maxVal = dataVentasProducto[0]?.value || 1;
                            return (
                                <div key={item.name} className="rank-item">
                                    <span className="rank-pos" style={{ background: COLORS[index % COLORS.length] + '20', color: COLORS[index % COLORS.length] }}>
                                        {index + 1}
                                    </span>
                                    <div className="rank-info">
                                        <div className="rank-header">
                                            <span className="rank-name">{item.name}</span>
                                            <span className="rank-val">{item.value.toFixed(1)} kg</span>
                                        </div>
                                        <div className="rank-bar-bg">
                                            <div className="rank-bar-fill" style={{ width: `${(item.value / maxVal) * 100}%`, background: COLORS[index % COLORS.length] }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="no-data">Registrá ventas para ver el ranking</p>
                        )}
                    </div>
                </section>
            </div>

            {/* ── FOOTER ── */}
            <div className="db-footer">
                <section className="glass-card rent-card">
                    <h3>Análisis de Rentabilidad</h3>
                    <div className="rent-inner">
                        <div className="donut-wrap">
                            <div className="donut" style={{
                                backgroundImage: `conic-gradient(
                                    #64748b 0% ${(estadisticas.total_costo_mercaderia / (estadisticas.total_ingresos || 1)) * 100}%,
                                    #ef4444 ${(estadisticas.total_costo_mercaderia / (estadisticas.total_ingresos || 1)) * 100}% ${((estadisticas.total_costo_mercaderia + estadisticas.total_gastos) / (estadisticas.total_ingresos || 1)) * 100}%,
                                    #10b981 ${((estadisticas.total_costo_mercaderia + estadisticas.total_gastos) / (estadisticas.total_ingresos || 1)) * 100}% 100%
                                )`
                            }}>
                                <div className="donut-hole"><span>%</span></div>
                            </div>
                            <div className="donut-legend">
                                <div className="dl-item"><span style={{ background: '#64748b' }} />Costos</div>
                                <div className="dl-item"><span style={{ background: '#ef4444' }} />Gastos</div>
                                <div className="dl-item"><span style={{ background: '#10b981' }} />Beneficio</div>
                            </div>
                        </div>
                        <div className="rent-progress">
                            <div>
                                <div className="prog-label">
                                    <span>Margen Bruto</span>
                                    <span>{estadisticas.total_ingresos > 0 ? ((estadisticas.ganancia_bruta / estadisticas.total_ingresos) * 100).toFixed(1) : 0}%</span>
                                </div>
                                <div className="prog-bar">
                                    <div className="prog-fill" style={{
                                        width: `${Math.max(0, Math.min(100, estadisticas.total_ingresos > 0 ? (estadisticas.ganancia_bruta / estadisticas.total_ingresos) * 100 : 0))}%`,
                                        background: '#10b981'
                                    }} />
                                </div>
                            </div>
                            <p className="insight">
                                {estadisticas.resultado_final > 0
                                    ? '✅ Tu negocio está generando ganancias netas positivas.'
                                    : '⚠️ Revisá costos y gastos para mejorar el resultado.'}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="glass-card expansion-card">
                    <div className="exp-badge">PRÓXIMAMENTE</div>
                    <h3>Generador de Ventas</h3>
                    <p>Compartí tu catálogo actualizado en tiempo real con tus clientes por WhatsApp.</p>
                    <button className="exp-btn" disabled>
                        Compartir Catálogo (WhatsApp)
                    </button>
                </section>
            </div>

            <style jsx>{`
                .db-root {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    animation: fadeSlideUp 0.4s ease-out;
                }

                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ── ALERT ── */
                .stock-alert-banner {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    padding: 0.875rem 1.25rem;
                    background: rgba(245,158,11,0.08);
                    border: 1px solid rgba(245,158,11,0.28);
                    border-radius: 10px;
                    flex-wrap: wrap;
                }
                .alert-icon { font-size: 1rem; color: #b45309; flex-shrink: 0; }
                .alert-title { font-weight: 700; color: #b45309; font-size: 0.85rem; flex-shrink: 0; }
                .alert-items { display: flex; flex-wrap: wrap; gap: 0.4rem; }
                .alert-chip {
                    background: rgba(245,158,11,0.12);
                    color: #b45309;
                    border: 1px solid rgba(245,158,11,0.25);
                    border-radius: 20px;
                    padding: 0.18rem 0.6rem;
                    font-size: 0.77rem;
                    font-weight: 600;
                }
                .alert-chip.sin-stock { background: rgba(239,68,68,0.1); color: var(--error); border-color: rgba(239,68,68,0.25); }

                /* ── HERO ── */
                .hero-banner {
                    position: relative;
                    background: linear-gradient(135deg, #1B3A2A 0%, #2D5A40 55%, #3B7A57 100%);
                    border-radius: 16px;
                    overflow: hidden;
                    padding: 2rem 2rem 1.5rem;
                    box-shadow: 0 8px 32px rgba(27,58,42,0.35);
                }

                /* SVG leaf pattern as background texture */
                .hero-pattern {
                    position: absolute;
                    inset: 0;
                    background-image:
                        radial-gradient(circle at 20% 30%, rgba(201,168,76,0.08) 0%, transparent 50%),
                        radial-gradient(circle at 80% 70%, rgba(255,255,255,0.04) 0%, transparent 40%);
                    pointer-events: none;
                }

                .hero-inner {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1.5rem;
                    flex-wrap: wrap;
                    margin-bottom: 1.5rem;
                }

                .hero-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .hero-leaf-icon {
                    font-size: 2.5rem;
                    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
                }

                .hero-greeting {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #E8F4EF;
                    margin: 0;
                    line-height: 1.2;
                }

                .hero-greeting strong {
                    color: #C9A84C;
                }

                .hero-date {
                    font-size: 0.85rem;
                    color: rgba(232,244,239,0.65);
                    margin: 0.25rem 0 0;
                    text-transform: capitalize;
                    letter-spacing: 0.02em;
                }

                .hero-clock-wrap {
                    text-align: right;
                }

                .hero-clock {
                    font-family: 'Courier New', 'Menlo', monospace;
                    font-size: 2.4rem;
                    font-weight: 700;
                    color: #C9A84C;
                    letter-spacing: 0.06em;
                    text-shadow: 0 0 20px rgba(201,168,76,0.4);
                    display: block;
                }

                /* Quick pills inside hero */
                .hero-pills {
                    position: relative;
                    display: flex;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                }

                .hpill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.4rem 0.9rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    backdrop-filter: blur(4px);
                }

                .hpill strong { font-weight: 800; }

                .hpill-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .hpill.green {
                    background: rgba(59,122,87,0.35);
                    color: #a8e6c3;
                    border: 1px solid rgba(59,122,87,0.4);
                }
                .hpill.green .hpill-dot { background: #10b981; }

                .hpill.gold {
                    background: rgba(201,168,76,0.2);
                    color: #f0d98a;
                    border: 1px solid rgba(201,168,76,0.35);
                }
                .hpill.gold .hpill-dot { background: #C9A84C; }

                .hpill.result-pos {
                    background: rgba(201,168,76,0.18);
                    color: #f0d98a;
                    border: 1px solid rgba(201,168,76,0.3);
                }
                .hpill.result-pos .hpill-dot { background: #C9A84C; }

                .hpill.result-neg {
                    background: rgba(239,68,68,0.15);
                    color: #fca5a5;
                    border: 1px solid rgba(239,68,68,0.3);
                }
                .hpill.result-neg .hpill-dot { background: #ef4444; }

                /* ── ACCIONES RÁPIDAS ── */
                .quick-actions {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                }

                .qa-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.1rem 1.25rem;
                    background: var(--surface);
                    border-radius: 12px;
                    box-shadow: var(--shadow);
                    border: 1px solid var(--border);
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                }

                .qa-card::before {
                    content: '';
                    position: absolute;
                    left: 0; top: 0; bottom: 0;
                    width: 4px;
                }

                .qa-venta::before   { background: #3B7A57; }
                .qa-pedidos::before { background: #C9A84C; }
                .qa-caja::before    { background: #8B5E3C; }

                .qa-card:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-lg);
                }

                .qa-venta:hover   { border-color: rgba(59,122,87,0.3); background: rgba(59,122,87,0.04); }
                .qa-pedidos:hover { border-color: rgba(201,168,76,0.3); background: rgba(201,168,76,0.04); }
                .qa-caja:hover    { border-color: rgba(139,94,60,0.3); background: rgba(139,94,60,0.04); }

                .qa-emoji {
                    font-size: 1.6rem;
                    flex-shrink: 0;
                    line-height: 1;
                }

                .qa-emoji-wrap {
                    position: relative;
                    flex-shrink: 0;
                    line-height: 1;
                    font-size: 1.6rem;
                }

                .qa-badge {
                    position: absolute;
                    top: -6px;
                    right: -8px;
                    background: #ef4444;
                    color: white;
                    font-size: 0.65rem;
                    font-weight: 800;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid var(--surface);
                    font-family: inherit;
                }

                .qa-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                    flex: 1;
                    min-width: 0;
                }

                .qa-title {
                    font-size: 0.92rem;
                    font-weight: 700;
                    color: var(--text);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .qa-sub {
                    font-size: 0.72rem;
                    color: var(--text-muted);
                }

                .qa-arrow {
                    font-size: 1.1rem;
                    color: var(--text-muted);
                    flex-shrink: 0;
                    transition: transform 0.2s;
                }

                .qa-card:hover .qa-arrow { transform: translateX(3px); }

                /* ── MES + CALENDARIO ── */
                .month-cal-row {
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 1.5rem;
                    align-items: start;
                }

                .mes-section {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .section-label {
                    font-size: 0.78rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.07em;
                    margin: 0;
                }

                .mes-cards {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                }

                .mes-card-v2 {
                    background: var(--surface);
                    border-radius: 12px;
                    box-shadow: var(--shadow);
                    display: flex;
                    overflow: hidden;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .mes-card-v2:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-lg);
                }

                .mes-accent {
                    width: 5px;
                    flex-shrink: 0;
                }

                .mes-body {
                    padding: 1rem 1.1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.3rem;
                    flex: 1;
                }

                .mes-lbl {
                    font-size: 0.73rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .mes-val {
                    font-size: 1.45rem;
                    font-weight: 800;
                    color: var(--text);
                    letter-spacing: -0.3px;
                    line-height: 1.1;
                }

                .mes-badge {
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 0.15rem 0.5rem;
                    border-radius: 10px;
                    width: fit-content;
                }
                .mes-badge.badge-up { background: rgba(16,185,129,0.1); color: #059669; }
                .mes-badge.badge-down { background: rgba(239,68,68,0.1); color: #dc2626; }

                /* ── MINI CALENDARIO ── */
                .mini-cal {
                    width: 240px;
                    flex-shrink: 0;
                }

                .cal-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    margin-bottom: 0.75rem;
                }

                .cal-month {
                    font-weight: 800;
                    font-size: 0.95rem;
                    color: var(--text);
                    text-transform: capitalize;
                }

                .cal-year {
                    font-size: 0.78rem;
                    color: var(--text-muted);
                }

                .cal-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 2px;
                }

                .cal-dow {
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-align: center;
                    padding: 0.2rem 0;
                    text-transform: uppercase;
                }

                .cal-cell {
                    position: relative;
                    font-size: 0.72rem;
                    font-weight: 600;
                    text-align: center;
                    padding: 0.3rem 0.1rem;
                    border-radius: 6px;
                    color: var(--text);
                    line-height: 1.2;
                    cursor: default;
                }

                .cal-cell.cal-empty { visibility: hidden; }

                .cal-cell.cal-today {
                    background: var(--primary);
                    color: white;
                    font-weight: 800;
                }

                .cal-dot {
                    display: block;
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: var(--accent);
                    margin: 1px auto 0;
                }

                .cal-cell.cal-today .cal-dot { background: rgba(255,255,255,0.75); }

                .cal-legend {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    margin-top: 0.75rem;
                    padding-top: 0.75rem;
                    border-top: 1px solid var(--border);
                    font-size: 0.67rem;
                    color: var(--text-muted);
                }

                .cal-dot-demo {
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--accent);
                    flex-shrink: 0;
                }

                /* ── KPI CARDS ── */
                .kpi-section {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 1rem;
                }

                .kpi-card {
                    background: var(--surface);
                    border-radius: 12px;
                    box-shadow: var(--shadow);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .kpi-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                }

                .kpi-card.kpi-focus {
                    background: linear-gradient(160deg, #fffef8, #fdf9ec);
                    border: 1px solid rgba(201,168,76,0.25);
                    box-shadow: 0 4px 20px rgba(201,168,76,0.15);
                }

                .kpi-top-bar {
                    height: 4px;
                    width: 100%;
                }

                .kpi-body {
                    padding: 1.1rem 1.1rem 1.3rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .kpi-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .kpi-lbl {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    line-height: 1.3;
                }

                .kpi-val {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--text);
                    letter-spacing: -0.3px;
                }

                /* ── CHARTS ── */
                .charts-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1.5rem;
                }

                .chart-card h3 {
                    font-size: 1rem;
                    color: var(--text);
                    margin-bottom: 0.35rem;
                }

                .chart-hint {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-bottom: 1rem;
                }

                .ranking-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.7rem;
                    padding-top: 0.5rem;
                }

                .rank-item {
                    display: flex;
                    align-items: center;
                    gap: 0.7rem;
                }

                .rank-pos {
                    width: 28px;
                    height: 28px;
                    border-radius: 7px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 0.82rem;
                    flex-shrink: 0;
                }

                .rank-info { flex: 1; min-width: 0; }

                .rank-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    margin-bottom: 0.28rem;
                }

                .rank-name {
                    font-weight: 600;
                    font-size: 0.88rem;
                    color: var(--text);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .rank-val {
                    font-size: 0.78rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    flex-shrink: 0;
                    margin-left: 0.4rem;
                }

                .rank-bar-bg {
                    height: 5px;
                    background: #e2e8f0;
                    border-radius: 3px;
                    overflow: hidden;
                }

                .rank-bar-fill {
                    height: 100%;
                    border-radius: 3px;
                    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .no-data { color: var(--text-muted); font-style: italic; font-size: 0.9rem; }

                .chart-divider {
                    height: 1px;
                    background: var(--border);
                    margin: 1.5rem 0 1.25rem;
                }

                .chart-card-double {
                    display: flex;
                    flex-direction: column;
                }

                /* ── FOOTER ── */
                .db-footer {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .rent-card h3 { font-size: 1rem; margin-bottom: 1.5rem; }

                .rent-inner {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: 2rem;
                    align-items: center;
                }

                .donut-wrap {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                }

                .donut {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .donut-hole {
                    width: 68%;
                    height: 68%;
                    background: var(--surface);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.85rem;
                    font-weight: 800;
                    color: var(--text-muted);
                    box-shadow: inset 0 2px 5px rgba(0,0,0,0.06);
                }

                .donut-legend { display: flex; flex-direction: column; gap: 0.3rem; }

                .dl-item {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.78rem;
                    color: var(--text-muted);
                }

                .dl-item span {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .rent-progress { display: flex; flex-direction: column; gap: 1.25rem; min-width: 0; }

                .prog-label {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.4rem;
                    font-weight: 700;
                    font-size: 0.88rem;
                    color: var(--text);
                }

                .prog-bar {
                    height: 9px;
                    background: #e2e8f0;
                    border-radius: 5px;
                    overflow: hidden;
                }

                .prog-fill {
                    height: 100%;
                    border-radius: 5px;
                    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .insight {
                    font-size: 0.83rem;
                    color: var(--text-muted);
                    padding-left: 0.9rem;
                    border-left: 2px solid var(--border);
                    line-height: 1.5;
                }

                /* ── EXPANSION CARD ── */
                .expansion-card {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 0.75rem;
                    background: linear-gradient(135deg, rgba(201,168,76,0.06), var(--glass));
                }

                .exp-badge {
                    background: var(--primary);
                    color: white;
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 0.22rem 0.7rem;
                    border-radius: 20px;
                    width: fit-content;
                    letter-spacing: 0.08em;
                }

                .expansion-card h3 { font-size: 1rem; }

                .expansion-card p {
                    font-size: 0.87rem;
                    color: var(--text-muted);
                    margin: 0;
                }

                .exp-btn {
                    background: #25d366;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.2rem;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 0.88rem;
                    cursor: not-allowed;
                    opacity: 0.6;
                    width: fit-content;
                }

                /* ── RESPONSIVE ── */
                @media (max-width: 1200px) {
                    .kpi-grid { grid-template-columns: repeat(3, 1fr); }
                }

                @media (max-width: 768px) {
                    .quick-actions { grid-template-columns: 1fr; }
                }

                @media (max-width: 1024px) {
                    .month-cal-row { grid-template-columns: 1fr; }
                    .mini-cal { width: 100%; }
                    .cal-grid { max-width: 320px; }
                    .charts-grid { grid-template-columns: 1fr; }
                    .db-footer { grid-template-columns: 1fr; }
                    .rent-inner { grid-template-columns: auto 1fr; }
                }

                @media (max-width: 768px) {
                    .hero-banner { padding: 1.5rem 1.25rem 1.25rem; }
                    .hero-clock { font-size: 1.8rem; }
                    .hero-greeting { font-size: 1.2rem; }
                    .mes-cards { grid-template-columns: 1fr; gap: 0.75rem; }
                    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
                    .kpi-card.kpi-focus { grid-column: span 2; }
                }

                @media (max-width: 480px) {
                    .hero-inner { flex-direction: column; align-items: flex-start; }
                    .hero-clock-wrap { align-self: flex-end; margin-top: -2.5rem; }
                    .kpi-grid { grid-template-columns: 1fr 1fr; }
                    .rent-inner { grid-template-columns: 1fr; justify-items: center; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
