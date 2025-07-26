'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';

type Stats = {
  productsCount: number;
  customersCount: number;
  salesCount: number;
  salesTotal: number;
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Erreur de chargement');

        const data = await res.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les statistiques.');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <main className="flex-1 p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Bienvenue, {user?.name}
      </h1>

      <section>
        <h2 className="text-lg font-semibold">Statistiques générales</h2>

        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : stats ? (
          <ul className="space-y-2 mt-4 text-gray-700 dark:text-gray-200">
            <li>📦 Produits : <strong>{stats.productsCount}</strong></li>
            <li>👥 Clients : <strong>{stats.customersCount}</strong></li>
            <li>🧾 Ventes : <strong>{stats.salesCount}</strong></li>
            <li>💰 Total des ventes : <strong>{stats.salesTotal.toLocaleString()} FCFA</strong></li>
          </ul>
        ) : null}
      </section>
    </main>
  );
}
