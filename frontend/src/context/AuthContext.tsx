'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'member';
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    updateUser: (userData: User) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');

            if (token) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    const { data } = await api.get('/users/profile');
                    setUser({ ...data, token }); // Reconstruct user object with token
                } catch (error) {
                    console.error('Failed to fetch user profile', error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkUser();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('token', userData.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;

        if (userData.role === 'admin' || userData.role === 'manager') {
            router.push('/dashboard');
        } else {
            router.push('/panel');
        }
    };

    const updateUser = (userData: User) => {
        setUser(userData);
        // No need to update token usually, but if updated, save it.
        // Assuming update doesn't change token usually.
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
