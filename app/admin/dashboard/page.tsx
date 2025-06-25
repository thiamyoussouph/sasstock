'use client';

import { useAuthStore } from '@/stores/auth-store';
export default function DashboardPage() {
    const { user } = useAuthStore();

    // if (!user) {
    //     redirect('/login');
    // }

    return (
        <main className="flex-1 p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Bienvenue, {user?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
                Voici votre tableau de bord.
            </p>
        </main>
    );
}
