'use client';

import { useEffect, useState } from 'react';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useCompanyStore } from '@/stores/company-store';
import { usePlanStore } from '@/stores/plan-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function SubscriptionFilters() {
    const { setFilters, fetchSubscriptions } = useSubscriptionStore();
    const { companies, fetchCompanies } = useCompanyStore();
    const { plans, fetchPlans } = usePlanStore();

    const [filters, setLocalFilters] = useState({
        companyId: '',
        planId: '',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        fetchCompanies();
        fetchPlans();
    }, [fetchPlans, fetchCompanies]);

    const applyFilters = () => {
        setFilters(filters);
        fetchSubscriptions();
    };

    const resetFilters = () => {
        const initial = {
            companyId: '',
            planId: '',
            startDate: '',
            endDate: '',
        };
        setLocalFilters(initial);
        setFilters(initial);
        fetchSubscriptions();
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow mt-6">
            <h2 className="text-lg font-semibold mb-4">Filtres</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Label>Entreprise</Label>
                    <select
                        value={filters.companyId}
                        onChange={(e) =>
                            setLocalFilters({ ...filters, companyId: e.target.value })
                        }
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Toutes</option>
                        {companies.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label>Plan</Label>
                    <select
                        value={filters.planId}
                        onChange={(e) =>
                            setLocalFilters({ ...filters, planId: e.target.value })
                        }
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Tous</option>
                        {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label>Date début</Label>
                    <Input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) =>
                            setLocalFilters({ ...filters, startDate: e.target.value })
                        }
                    />
                </div>

                <div>
                    <Label>Date fin</Label>
                    <Input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) =>
                            setLocalFilters({ ...filters, endDate: e.target.value })
                        }
                    />
                </div>
            </div>

            <div className="flex gap-4 mt-4">
                <Button onClick={applyFilters}>Appliquer les filtres</Button>
                <Button variant="outline" onClick={resetFilters}>
                    Réinitialiser
                </Button>
            </div>
        </div>
    );
}
