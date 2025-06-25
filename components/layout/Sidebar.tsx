'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Settings, User, Box, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { label: 'Produits', href: '/admin/products', icon: Box },
    { label: 'Utilisateurs', href: '/admin/users', icon: User },
    { label: 'Paramètres', href: '/admin/settings', icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                'h-screen min-h-screen bg-[#102452] text-white p-4 flex flex-col transition-all duration-300 ease-in-out',
                collapsed ? 'w-20' : 'w-54',
                className
            )}
        >
            {/* LOGO + TOGGLE */}
            <div className="flex items-center justify-between mb-6">
                {!collapsed && <h2 className="text-2xl font-bold">Ladyges</h2>}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-white hover:text-blue-300 transition"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* NAVIGATION */}
            <nav className="space-y-3 flex-1">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href;

                    return (
                        <Link
                            key={label}
                            href={href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg transition',
                                isActive
                                    ? 'bg-white text-[#102452] font-semibold'
                                    : 'hover:bg-blue-900 text-white'
                            )}
                        >
                            <Icon size={20} />
                            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
