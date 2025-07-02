'use client';
import '@/app/globals.css';
import { AdminHeader } from '@/components/layout/Header';
import { ManagerHeader } from '@/components/layout/Header-manager';
import { ManagerSidebar } from '@/components/layout/Sidebar-manager';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
