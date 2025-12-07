'use client';

import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
                {/* Sidebar Skeleton */}
                <div className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-white/10 h-full p-6 space-y-6">
                    <div className="h-8 w-24 bg-slate-800/50 rounded animate-pulse" />
                    <div className="space-y-4 pt-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-10 w-full bg-slate-800/50" />
                        ))}
                    </div>
                </div>

                {/* Mobile Header Skeleton */}
                <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-white/10" />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 p-8 pt-20 md:pt-8">
                    <div className="space-y-6 max-w-7xl mx-auto">
                        <Skeleton className="h-12 w-64 bg-slate-800/50" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Skeleton className="h-32 rounded-xl bg-slate-800/50" />
                            <Skeleton className="h-32 rounded-xl bg-slate-800/50" />
                            <Skeleton className="h-32 rounded-xl bg-slate-800/50" />
                        </div>
                        <Skeleton className="h-96 rounded-xl bg-slate-800/50" />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
            <Sidebar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto pt-16 md:pt-0">
                <div className="container mx-auto px-4 py-8 md:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
