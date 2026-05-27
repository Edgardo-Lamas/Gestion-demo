import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database, UploadCloud, CheckCircle, AlertTriangle } from 'lucide-react';

export default function MigrationHelper() {
    const [status, setStatus] = useState('idle'); // idle, checking, needs_migration, migrating, done, error
    const [details, setDetails] = useState('');

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        setStatus('checking');
        try {
            // Revisar si hay algo en Supabase (ej. productos)
            const { data: prods, error } = await supabase.from('productos').select('id').limit(1);
            if (error) throw error;

            if (prods && prods.length > 0) {
                // Ya hay datos en la nube
                setStatus('done');
            } else {
                // Revisar si hay datos en localStorage
                const localProds = localStorage.getItem('sabri_v2_productos');
                if (localProds && JSON.parse(localProds).length > 0) {
                    setStatus('needs_migration');
                } else {
                    setStatus('done'); // Nada que migrar
                }
            }
        } catch (err) {
            console.error('Error verificando estado:', err);
            setDetails(err.message);
            setStatus('error');
        }
    };

    const runMigration = async () => {
        if (!window.confirm('¿Iniciar la migración de datos a la nube?')) return;

        setStatus('migrating');
        setDetails('Iniciando...');

        try {
            // Leer localStorage
            const productos = JSON.parse(localStorage.getItem('sabri_v2_productos') || '[]');
            const compras = JSON.parse(localStorage.getItem('sabri_v2_compras') || '[]');
            const ventas = JSON.parse(localStorage.getItem('sabri_v2_ventas') || '[]');
            const gastos = JSON.parse(localStorage.getItem('sabri_v2_gastos') || '[]');
            const distribuciones = JSON.parse(localStorage.getItem('sabri_v2_distribuciones') || '[]');

            // Subir Productos
            if (productos.length > 0) {
                setDetails(`Subiendo ${productos.length} productos...`);
                // Asegurar formato correcto. supabase no usa createdAt camelCase
                const prodsClean = productos.map(p => ({
                    id: p.id,
                    nombre: p.nombre,
                    margen_ganancia: p.margen_ganancia ? parseFloat(p.margen_ganancia) : null,
                    oculto_catalogo: p.oculto_catalogo === true ? true : false,
                    precio_catalogo: p.precio_catalogo ? parseFloat(p.precio_catalogo) : null
                }));
                const { error: errP } = await supabase.from('productos').upsert(prodsClean);
                if (errP) throw errP;
            }

            // Subir Compras
            if (compras.length > 0) {
                setDetails(`Subiendo ${compras.length} compras...`);
                const compClean = compras.map(c => ({
                    id: c.id,
                    producto_id: c.producto_id,
                    cantidad_kg: parseFloat(c.cantidad_kg),
                    cantidad_disponible: parseFloat(c.cantidad_disponible),
                    costo_unitario: parseFloat(c.costo_unitario),
                    fecha: c.fecha,
                    creado_en: c.creado_en || Date.now()
                }));
                const { error: errC } = await supabase.from('compras').upsert(compClean);
                if (errC) throw errC;
            }

            // Subir Ventas
            if (ventas.length > 0) {
                setDetails(`Subiendo ${ventas.length} ventas...`);
                const ventClean = ventas.map(v => ({
                    id: v.id,
                    producto_id: v.producto_id,
                    producto_nombre: v.producto_nombre,
                    cantidad_vendida: parseFloat(v.cantidad_vendida),
                    precio_venta_unitario: parseFloat(v.precio_venta_unitario),
                    ingreso_total: parseFloat(v.ingreso_total),
                    costo_calculado: parseFloat(v.costo_calculado),
                    ganancia: parseFloat(v.ganancia),
                    fecha: v.fecha
                }));
                const { error: errV } = await supabase.from('ventas').upsert(ventClean);
                if (errV) throw errV;
            }

            // Subir Gastos
            if (gastos.length > 0) {
                setDetails(`Subiendo ${gastos.length} gastos...`);
                const gastClean = gastos.map(g => ({
                    id: g.id,
                    fecha: g.fecha,
                    descripcion: g.descripcion,
                    categoria: g.categoria,
                    monto: parseFloat(g.monto)
                }));
                const { error: errG } = await supabase.from('gastos').upsert(gastClean);
                if (errG) throw errG;
            }

            // Subir Distribuciones
            if (distribuciones.length > 0) {
                setDetails(`Subiendo ${distribuciones.length} distribuciones...`);
                const distClean = distribuciones.map(d => ({
                    id: d.id,
                    fecha: d.fecha || new Date().toISOString().split('T')[0],
                    empleado_id: d.empleado_id,
                    producto_id: d.producto_id,
                    cantidad_kg: parseFloat(d.cantidad_kg),
                    precio_base: parseFloat(d.precio_base),
                    precio_venta: parseFloat(d.precio_venta),
                    monto_total: parseFloat(d.monto_total),
                    pago_entregado: parseFloat(d.pago_entregado || 0),
                    saldo_pendiente: parseFloat(d.saldo_pendiente),
                    estado_pago: d.estado_pago,
                    notas: d.notas || ''
                }));
                const { error: errD } = await supabase.from('distribuciones').upsert(distClean);
                if (errD) throw errD;
            }

            setStatus('done');
            window.location.reload(); // Recargar la pag para que lea de la nube tras migrar

        } catch (err) {
            console.error('Migración fallida:', err);
            setDetails(err.message);
            setStatus('error');
        }
    };

    if (status === 'checking' || status === 'done') return null;

    return (
        <div style={{
            position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
            background: 'white', padding: '1rem', borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0',
            maxWidth: '350px'
        }}>
            {status === 'needs_migration' && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#3B7A57' }}>
                        <Database size={20} />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Sincronización a la Nube</h3>
                    </div>
                    <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#64748b' }}>
                        Hemos detectado datos locales en tu computadora que no están en la nueva base de datos.
                    </p>
                    <button
                        onClick={runMigration}
                        style={{
                            width: '100%', background: '#3B7A57', color: 'white', border: 'none',
                            padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold'
                        }}
                    >
                        <UploadCloud size={18} /> Subir Datos a Supabase
                    </button>
                </div>
            )}

            {status === 'migrating' && (
                <div style={{ textAlign: 'center', padding: '10px' }}>
                    <div className="spinner" style={{ margin: '0 auto 10px' }}></div>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#3b82f6' }}>Migrando datos...</p>
                    <small style={{ color: '#64748b' }}>{details}</small>
                </div>
            )}

            {status === 'error' && (
                <div style={{ color: '#ef4444' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <AlertTriangle size={20} />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Error en la migración</h3>
                    </div>
                    <p style={{ fontSize: '0.85rem' }}>{details}</p>
                    <button
                        onClick={() => setStatus('needs_migration')}
                        style={{ marginTop: '10px', background: '#e2e8f0', border: 'none', padding: '5px 10px', borderRadius: '5px' }}
                    >
                        Reintentar
                    </button>
                </div>
            )}

            <style jsx>{`
                .spinner {
                    border: 3px solid rgba(59, 130, 246, 0.3);
                    border-radius: 50%;
                    border-top: 3px solid #3b82f6;
                    width: 24px;
                    height: 24px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
