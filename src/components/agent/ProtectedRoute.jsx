"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAgent } from '@/context/AgentContext';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAgent();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}