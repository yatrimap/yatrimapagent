import { AgentProvider } from '@/context/AgentContext';
import { ProtectedRoute } from '@/components/agent/ProtectedRoute';
import { AgentSidebar } from '@/components/agent/AgentSidebar';
import { AgentHeader } from '@/components/agent/AgentHeader';

export default function AgentDashboardLayout({
    children,
}) {
    return (
        <AgentProvider>
            <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/30">
                    <AgentSidebar />
                    <div className="lg:ml-72 min-h-screen flex flex-col">
                        <AgentHeader />
                        <main className="flex-1 p-4 lg:p-8">
                            <div className="max-w-7xl mx-auto">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </ProtectedRoute>
        </AgentProvider>
    );
}