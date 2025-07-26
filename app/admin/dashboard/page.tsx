'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [companyStats, setCompanyStats] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/dashboard', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!res.ok) throw new Error('Erreur lors du chargement des données');
        const data = await res.json();
        setCompanyStats(data);
      } catch (error) {
        console.error('Erreur :', error);
      }
    }

    fetchData();
  }, []);

  return (
    <main className="flex-1 p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Bienvenue, {user?.name}
      </h1>

      <section>
        <h2 className="text-lg font-semibold">Statistiques générales</h2>
        {companyStats ? (
          <ul>
            <li>Produits : {companyStats.productsCount}</li>
            <li>Clients : {companyStats.customersCount}</li>
            <li>Ventes : {companyStats.salesCount}</li>
            <li>Total ventes : {companyStats.salesTotal} FCFA</li>
          </ul>
        ) : (
          <p>Chargement...</p>

        
        )}
      </section>
    </main>
  );
}
