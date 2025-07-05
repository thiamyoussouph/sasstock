'use client';

import '@/app/globals.css';
import { ManagerHeader } from '@/components/layout/Header-manager';
import { ManagerSidebar } from '@/components/layout/Sidebar-manager';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastContainer } from "react-toastify";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import "react-toastify/dist/ReactToastify.css";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
    const { user, hydrated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (hydrated && !user) {
            router.push('/login');
        }
    }, [hydrated, user, router]);

    if (!hydrated) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-600 dark:text-gray-200">
                Chargement...
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-gray-500 dark:bg-gray-900">
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
                <ManagerSidebar />
                <main className="flex-1 flex flex-col">
                    <ManagerHeader />
                    <ToastContainer position="top-right" autoClose={3000} />
                    <div className="p-6">{children}</div>
                </main>
            </ThemeProvider>
        </div>
    );
}
