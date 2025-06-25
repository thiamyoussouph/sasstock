// components/admin/Header.tsx
'use client';

import { useAuthStore } from '@/stores/auth-store';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AdminHeader() {
    const { user, logout } = useAuthStore();
    const { theme, setTheme } = useTheme();

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    return (
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#102452]">
            <h1 className="text-lg font-semibold">
                Bonjour{user ? `, ${user.name}` : ''}
            </h1>

            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Avatar className="cursor-pointer w-9 h-9">
                            <AvatarImage src="/images/avatar.png" alt={user?.name || 'Avatar'} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => alert('À implémenter')}>Profil</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert('À implémenter')}>Paramètres</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>Déconnexion</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
