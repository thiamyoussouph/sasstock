'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  AlertTriangle,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

ChartJS.register(
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Tooltip, 
  Legend,
  LineElement,
  PointElement,
  ArcElement
);

const DashboardPage = () => {
  const { user, logout, hydrated } = useAuthStore();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    productsCount: 0,
    customersCount: 0,
    salesCount: 0,
    salesTotal: 0,
  });
  const [salesData, setSalesData] = useState({
    daily: [] as Array<{ date: string; total: number }>,
    weekly: [] as Array<{ week: string; total: number }>,
    monthly: [] as Array<{ month: string; total: number }>,
  });
  const [stockAlerts, setStockAlerts] = useState<Array<{
    id: string;
    name: string;
    quantity: number;
    stockMin: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const chartRef = useRef(null);

  // Vérifier l'authentification
  useEffect(() => {
    if (hydrated && !user) {
      router.push('/auth/login');
      return;
    }
  }, [hydrated, user, router]);

  const getAuthToken = (): string | null => {
    // Essayer d'abord depuis le store Zustand
    const token = useAuthStore.getState().token;
    if (token) return token;
    
    // Fallback vers localStorage si disponible
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    
    return null;
  };

  const handleAuthError = useCallback(() => {
    // Nettoyer l'état d'authentification
    logout();
    // Rediriger vers la page de connexion
    router.push('/auth/login');
  }, [logout, router]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError('Session expirée. Veuillez vous reconnecter.');
        handleAuthError();
        return;
      }

      // Récupérer les statistiques générales
      const statsResponse = await fetch('/api/dashboard?type=stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        handleAuthError();
        return;
      }

      if (!statsResponse.ok) {
        const errorData = await statsResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors du chargement des statistiques');
      }

      const statsData = await statsResponse.json();
      setStats(statsData);

      // Récupérer les données de ventes
      const salesResponse = await fetch('/api/dashboard?type=sales-chart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (salesResponse.ok) {
        const salesChartData = await salesResponse.json();
        setSalesData(salesChartData);
      }

      // Récupérer les alertes de stock
      const stockResponse = await fetch('/api/dashboard?type=stock-alerts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (stockResponse.ok) {
        const stockAlertsData = await stockResponse.json();
        setStockAlerts(stockAlertsData);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      console.error('Erreur dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    // S'assurer que l'utilisateur est connecté avant de charger les données
    if (hydrated && user) {
      fetchDashboardData();
    }
  }, [hydrated, user, fetchDashboardData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Données pour le graphique des ventes
  const getSalesChartData = () => {
    const currentData = salesData[timeRange] || [];
    
    const getLabel = (item: { date?: string; week?: string; month?: string; total: number }) => {
      switch (timeRange) {
        case 'daily':
          return item.date || '';
        case 'weekly':
          return `Sem ${item.week || ''}`;
        case 'monthly':
          return item.month || '';
        default:
          return '';
      }
    };
    
    return {
      labels: currentData.map(getLabel),
      datasets: [
        {
          label: 'Ventes (FCFA)',
          data: currentData.map(item => item.total),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          borderRadius: 8,
          barPercentage: 0.7,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: { parsed: { y: number } }) {
            return `Ventes: ${formatCurrency(context.parsed.y)}`;
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function (tickValue: string | number) {
            if (typeof tickValue === 'number') {
              return formatCurrency(tickValue);
            }
            return tickValue;
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Afficher un loader pendant l'hydratation
  if (!hydrated) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="animate-spin h-5 w-5" />
          <span>Initialisation...</span>
        </div>
      </div>
    );
  }

  // Redirection en cours si pas d'utilisateur
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="animate-spin h-5 w-5" />
          <span>Chargement des statistiques...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
          <div className="mt-3 flex space-x-3">
            <button 
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Réessayer
            </button>
            {error.includes('Session expirée') && (
              <button 
                onClick={() => router.push('/auth/login')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Se reconnecter
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">Bonjour {user?.name}, voici un aperçu de votre activité</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chiffre d&apos;affaires</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.salesTotal)}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ventes totales</p>
              <p className="text-2xl font-bold text-gray-900">{stats.salesCount}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Produits</p>
              <p className="text-2xl font-bold text-gray-900">{stats.productsCount}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.customersCount}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphique des ventes */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Évolution des ventes</h2>
          <div className="flex space-x-2">
            {(['daily', 'weekly', 'monthly'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range === 'daily' ? 'Jour' : range === 'weekly' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>
        </div>
        <div className="h-80">
          <Bar ref={chartRef} data={getSalesChartData()} options={chartOptions} />
        </div>
      </div>

      {/* Alertes de stock */}
      {stockAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Alertes de stock</h2>
          </div>
          <div className="space-y-3">
            {stockAlerts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    Stock actuel: {product.quantity} (Min: {product.stockMin})
                  </p>
                </div>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                  Stock faible
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;