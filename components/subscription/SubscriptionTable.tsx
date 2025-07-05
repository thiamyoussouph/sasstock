'use client';

import { useEffect } from 'react';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { Loader2 } from 'lucide-react';

function getStatusBadge(status: string) {
    const base = "px-2 py-1 text-xs rounded font-medium";

    switch (status) {
        case 'ACTIVE':
            return <span className={`${base} bg-green-100 text-green-800`}>ACTIVE</span>;
        case 'EXPIRED':
            return <span className={`${base} bg-red-100 text-red-800`}>EXPIRED</span>;
        case 'CANCELLED':
            return <span className={`${base} bg-gray-200 text-gray-700`}>CANCELLED</span>;
        case 'PENDING':
            return <span className={`${base} bg-yellow-100 text-yellow-800`}>PENDING</span>;
        default:
            return <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>;
    }
}

export default function SubscriptionTable() {
    const {
        subscriptions = [],
        page,
        totalPages,
        fetchSubscriptions,
        setPage,
        loading,
        error,
    } = useSubscriptionStore();

    useEffect(() => {
        fetchSubscriptions();
    }, [page,fetchSubscriptions]);

    return (
        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow mt-6">
            <h2 className="text-lg font-semibold mb-4">Liste des abonnements</h2>

            {loading ? (
                <div className="flex items-center justify-center py-10 text-gray-500">
                    <Loader2 className="animate-spin w-6 h-6 mr-2" />
                    Chargement des abonnements...
                </div>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : subscriptions.length === 0 ? (
                <p className="text-center text-gray-400">Aucune souscription trouvée.</p>
            ) : (
                <>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800">
                                <th className="p-2 text-left">Entreprise</th>
                                <th className="p-2 text-left">Plan</th>
                                <th className="p-2 text-left">Durée</th>
                                <th className="p-2 text-left">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.map((s) => (
                                <tr key={s.id} className="border-b border-gray-300 dark:border-gray-700">
                                    <td className="p-2">{s.company?.name ?? 'N/A'}</td>
                                    <td className="p-2">{s.plan?.name ?? 'N/A'}</td>
                                    <td className="p-2">
                                        {new Date(s.startDate).toLocaleDateString()} →{' '}
                                        {new Date(s.endDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-2">{getStatusBadge(s.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={`page-${i + 1}`}
                                    onClick={() => setPage(i + 1)}
                                    className={`px-3 py-1 rounded ${page === i + 1
                                            ? 'bg-black text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
