import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let subscription = null;

        try {
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), 5000)
            );

            Promise.race([supabase.auth.getSession(), timeout])
                .then(({ data: { session } }) => {
                    setUser(session?.user ?? null);
                    setLoading(false);
                })
                .catch((error) => {
                    console.warn('Error al verificar sesión:', error);
                    setUser(null);
                    setLoading(false);
                });

            // Escuchamos cambios de autenticación (login, logout)
            const { data } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
            });
            subscription = data?.subscription;
        } catch (error) {
            console.warn('Error al inicializar autenticación:', error);
            setUser(null);
            setLoading(false);
        }

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
