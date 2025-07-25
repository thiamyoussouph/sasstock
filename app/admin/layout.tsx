'use client';

import '@/app/globals.css';
import { AdminHeader } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastContainer } from "react-toastify";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import "react-toastify/dist/ReactToastify.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, hydrated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (hydrated && !user) {
            router.push('/');
        }
    }, [hydrated, user, router]);

    // Attente que le store soit prêt (évite redirection prématurée côté client)
    if (!hydrated) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-600 dark:text-gray-200">
                Chargement...
            </div>
        );
    }

    if (!user) return null; // On ne montre rien si pas encore redirigé

    return (
        <div className="flex min-h-screen bg-gray-300 dark:bg-gray-900">
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
                <Sidebar />
                <main className="flex-1 flex flex-col">
                    <AdminHeader />
                    <ToastContainer position="top-right" autoClose={3000} />
                    <div className="p-6">{children}</div>
                </main>
            </ThemeProvider>
        </div>
    );
}
