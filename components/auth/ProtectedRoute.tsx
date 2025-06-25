// components/auth/ProtectedRoute.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import Loader from './Loader';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // simulate auth check delay (optional if Zustand already has token)
        const timer = setTimeout(() => {
            if (!user) {
                router.replace('/');
            } else {
                setChecking(false);
            }
        }, 300); // tu peux augmenter si tu veux une animation visible

        return () => clearTimeout(timer);
    }, [user, router]);

    if (checking) return <Loader />;

    return <>{children}</>;
}
