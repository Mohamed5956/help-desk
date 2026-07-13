import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));

    const login = useCallback(async (email, password) => {
        const { data } = await api.post('/login', { email, password });
        const { user: loggedInUser, token: authToken } = data.data;

        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        setToken(authToken);
        setUser(loggedInUser);

        return loggedInUser;
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/logout');
        } catch {
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    }, []);

    const value = {
        user,
        token,
        isAuthenticated: Boolean(token),
        isAdmin: user?.role === 'admin',
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}