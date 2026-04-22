"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';


const AgentContext = createContext(undefined);

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export function AgentProvider({ children }) {
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('agent_token');
        if (token) {
            fetchAgentData(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchAgentData = async (token) => {
        try {
            const res = await fetch(`${baseUrl}/agent-dashboard/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setAgent(data.data);
            } else {
                localStorage.removeItem('agent_token');
            }
        } catch (error) {
            console.error('Failed to fetch agent:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl}/agent-dashboard/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (data.status == 'SUCCESS') {
                localStorage.setItem('agent_token', data.token);
                setAgent(data.data);
                router.push('/dashboard');
            } else {
                throw new Error(data.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('agent_token');
        setAgent(null);
        router.push('/login');
    };

    const refreshAgent = async () => {
        const token = localStorage.getItem('agent_token');
        if (token) {
            await fetchAgentData(token);
        }
    };

    return (
        <AgentContext.Provider value={{
            agent,
            loading,
            login,
            logout,
            refreshAgent,
            isAuthenticated: !!agent
        }}>
            {children}
        </AgentContext.Provider>
    );
}

export const useAgent = () => {
    const context = useContext(AgentContext);
    if (!context) throw new Error('useAgent must be used within AgentProvider');
    return context;
};