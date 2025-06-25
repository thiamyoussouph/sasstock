import '@/app/globals.css';
import { AdminHeader } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ThemeProvider } from '@/components/providers/theme-provider';


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <Sidebar />
                <main className="flex-1 flex flex-col">
                    <AdminHeader />
                    <div className="p-6">{children}</div>
                </main>
            </ThemeProvider>
        </div>
    );
}
