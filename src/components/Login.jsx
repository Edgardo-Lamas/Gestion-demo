import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Users, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Login = ({ onGoToStorefront }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            addToast('Acceso denegado: ' + error.message, 'error');
        } else {
            addToast('¡Bienvenida! Preparando panel...', 'success');
        }
        setLoading(false);
    };

    return (
        <div className="login-wrapper">
            {/* Animated Background Mesh */}
            <div className="bg-shape shape-1"></div>
            <div className="bg-shape shape-2"></div>
            <div className="bg-shape shape-3"></div>

            <div className="login-container">
                <div className="login-card premium-glass">
                    <div className="brand-header">
                        <div className="logo-ring">
                            <span className="logo-letter">🌿</span>
                        </div>
                        <h1 className="brand-title">AGIAPURR Gestión</h1>
                        <p className="brand-subtitle">Panel de Control</p>
                    </div>

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <div className="input-box">
                                <Mail size={20} className="input-icon" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Correo Electrónico"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    spellCheck="false"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-box">
                                <Lock size={20} className="input-icon" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Contraseña"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`submit-btn ${loading ? 'loading' : ''}`}
                            disabled={loading || !email || !password}
                        >
                            <span className="btn-text">
                                {loading ? 'Ingresando...' : 'Entrar'}
                            </span>
                            {!loading && <ArrowRight size={20} className="btn-icon" />}
                        </button>
                    </form>

                    <div className="login-footer">
                        <button onClick={onGoToStorefront} className="storefront-link">
                            <span className="icon-circle">
                                <Users size={16} />
                            </span>
                            <span className="link-text">Ir al Catálogo de Clientes</span>
                        </button>

                        <a href="?view=propuesta" className="storefront-link" style={{ textDecoration: 'none', marginTop: '0.5rem' }}>
                            <span className="icon-circle">
                                <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                                </svg>
                            </span>
                            <span className="link-text">Ver propuesta del sistema</span>
                        </a>

                        <a
                            href="https://studio-lamas.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                                marginTop: '1.5rem', opacity: 0.4, textDecoration: 'none',
                                transition: 'opacity 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
                        >
                            <svg viewBox="0 0 14 22" fill="none" width="10" height="16" aria-hidden="true">
                                <rect x="0" y="0" width="3.5" height="22" rx="1.75" fill="#c9a227"/>
                                <rect x="0" y="0" width="11" height="3.5" rx="1.75" fill="#c9a227"/>
                                <rect x="0" y="9.25" width="8" height="3.5" rx="1.75" fill="#c9a227"/>
                                <rect x="0" y="18.5" width="11" height="3.5" rx="1.75" fill="#c9a227"/>
                            </svg>
                            <span style={{ fontSize: '0.62rem', color: 'white', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                Studio Lamas
                            </span>
                        </a>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .login-wrapper {
                    min-height: 100vh;
                    min-height: 100dvh; /* Para navegadores móviles modernos con barras dinámicas */
                    width: 100vw;
                    background-color: #0f172a; /* Slate 900 de base */
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* --- FONDOS ANIMADOS MESH GRADIENT --- */
                .bg-shape {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.6;
                    animation: floatGlow 15s infinite alternate ease-in-out;
                    pointer-events: none;
                }

                .shape-1 {
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, #2d6148, #3B7A57); /* Verde forestal AGIAPURR */
                    top: -100px;
                    right: -50px;
                }

                .shape-2 {
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, #6b4226, #8B5E3C); /* Madera AGIAPURR */
                    bottom: -150px;
                    left: -150px;
                    animation-duration: 25s;
                    animation-delay: -5s;
                }

                .shape-3 {
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, #1e293b, #334155); /* Azul muy oscuro para balancear */
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    animation-duration: 20s;
                    opacity: 0.8;
                }

                @keyframes floatGlow {
                    0% { transform: scale(1) translate(0px, 0px); }
                    33% { transform: scale(1.1) translate(30px, -40px); }
                    66% { transform: scale(0.9) translate(-40px, 20px); }
                    100% { transform: scale(1.05) translate(0px, 0px); }
                }

                /* --- CONTENEDOR PRINCIPAL --- */
                .login-container {
                    width: 100%;
                    max-width: 420px;
                    padding: 1.5rem;
                    z-index: 10;
                    position: relative;
                }

                /* GLASSMORPHISM CARD PREMIUM */
                .premium-glass {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 2.5rem 2rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0;
                    transform: translateY(30px);
                }

                @keyframes slideUpFade {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* --- HEADER --- */
                .brand-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .logo-ring {
                    width: 72px;
                    height: 72px;
                    margin: 0 auto 1rem auto;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3B7A57, #2d6148);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 20px rgba(59, 122, 87, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3);
                    border: 2px solid rgba(255, 255, 255, 0.1);
                }

                .logo-letter {
                    font-size: 2.2rem;
                    font-weight: 800;
                    color: white;
                    font-family: inherit;
                    letter-spacing: -1px;
                }

                .brand-title {
                    color: white;
                    font-size: 1.8rem;
                    font-weight: 700;
                    margin: 0 0 0.25rem 0;
                    letter-spacing: -0.5px;
                }

                .brand-subtitle {
                    color: #cbd5e1; /* slate-300 */
                    font-size: 0.95rem;
                    margin: 0;
                    font-weight: 400;
                }

                /* --- FORMULARIO --- */
                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .input-box {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 1.25rem;
                    color: #94a3b8; /* slate-400 */
                    transition: color 0.3s;
                }

                .input-box input {
                    width: 100%;
                    padding: 1.15rem 1.25rem 1.15rem 3.25rem;
                    background: rgba(15, 23, 42, 0.4); /* slate-900 translúcido */
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    color: white;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    /* Prevenir zoom en iOS */
                    appearance: none; 
                }

                .input-box input::placeholder {
                    color: #64748b; /* slate-500 */
                }

                .input-box input:focus {
                    background: rgba(15, 23, 42, 0.6);
                    border-color: #3B7A57;
                    box-shadow: 0 0 0 4px rgba(59, 122, 87, 0.15);
                }

                .input-box input:focus + .input-icon,
                .input-box input:not(:placeholder-shown) ~ .input-icon {
                    color: #3B7A57;
                }

                /* --- BOTÓN PRINCIPAL --- */
                .submit-btn {
                    margin-top: 0.5rem;
                    width: 100%;
                    padding: 1.15rem;
                    background: linear-gradient(to right, #3B7A57, #2d6148);
                    border: none;
                    border-radius: 16px;
                    color: white;
                    font-size: 1.05rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    transition: all 0.3s;
                    box-shadow: 0 8px 20px -6px rgba(59, 122, 87, 0.5);
                    position: relative;
                    overflow: hidden;
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 25px -6px rgba(59, 122, 87, 0.6);
                }

                .submit-btn:active:not(:disabled) {
                    transform: translateY(1px);
                }

                .submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    background: #475569; /* slate-600 para estado deshabilitado */
                    box-shadow: none;
                }

                .btn-text {
                    position: relative;
                    z-index: 1;
                }

                .btn-icon {
                    transition: transform 0.3s;
                }

                .submit-btn:hover:not(:disabled) .btn-icon {
                    transform: translateX(4px);
                }

                /* EFECTO DE CARGA DEL BOTÓN */
                .submit-btn.loading {
                    color: transparent;
                }
                .submit-btn.loading::after {
                    content: '';
                    position: absolute;
                    width: 24px;
                    height: 24px;
                    top: 50%;
                    left: 50%;
                    margin-top: -12px;
                    margin-left: -12px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* --- FOOTER / LINK SECUNDARIO --- */
                .login-footer {
                    margin-top: 2.5rem;
                    text-align: center;
                }

                .storefront-link {
                    background: transparent;
                    border: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    padding: 0.5rem 1rem;
                    border-radius: 99px;
                    transition: all 0.3s;
                }

                .icon-circle {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #e2e8f0; /* slate-200 */
                    transition: all 0.3s;
                }

                .link-text {
                    color: #94a3b8; /* slate-400 */
                    font-size: 0.95rem;
                    font-weight: 500;
                    transition: color 0.3s;
                }

                .storefront-link:hover .icon-circle {
                    background: rgba(59, 122, 87, 0.2);
                    color: #3B7A57;
                }

                .storefront-link:hover .link-text {
                    color: white;
                }

                /* --- AJUSTES EXTRA MÓVIL PEQUEÑO --- */
                @media (max-width: 380px) {
                    .premium-glass {
                        padding: 2rem 1.5rem;
                    }
                    .logo-ring {
                        width: 60px;
                        height: 60px;
                    }
                    .logo-letter {
                        font-size: 1.8rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
