'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Users,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const links = user?.role === 'member' ? [
        { href: '/panel', label: 'My Workspace', icon: LayoutDashboard },
        { href: '/panel/tasks', label: 'My Tasks', icon: CheckSquare },
        { href: '/panel/settings', label: 'Settings', icon: Settings },
    ] : [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
        { href: '/dashboard/tasks', label: 'My Tasks', icon: CheckSquare },
        { href: '/dashboard/team', label: 'Team', icon: Users },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ];

    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

    return (
        <>
            {/* Mobile Header Trigger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-white/10 flex items-center justify-between px-4 z-50">
                <span className="font-bold text-xl text-white">MPMS</span>
                <button onClick={toggleMobile} className="text-white p-2">
                    {isMobileOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-white/10 
                    transform transition-transform duration-300 ease-in-out
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0 md:static md:h-screen
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center px-6 border-b border-white/10">
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                            MPMS
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                                        ${isActive
                                            ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'}
                                    `}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : ''}`} />
                                    <span className="font-medium">{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-white/10 bg-black/20">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                    {user?.role || 'Member'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    onClick={() => setIsMobileOpen(false)}
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                />
            )}
        </>
    );
}
