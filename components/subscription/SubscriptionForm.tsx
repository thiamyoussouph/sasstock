'use client';

import { useState, useEffect } from 'react';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useCompanyStore } from '@/stores/company-store';
import { usePlanStore } from '@/stores/plan-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

interface FormData {
    companyId: string;
    planId: string;
    durationInMonths: number;
}

export default function SubscriptionForm() {
    const [form, setForm] = useState<FormData>({
        companyId: '',
        planId: '',
        durationInMonths: 1,
    });

    const { createSubscription, submitting, fetchSubscriptions } = useSubscriptionStore();
    const { companies, fetchCompanies } = useCompanyStore();
    const { plans, fetchPlans } = usePlanStore();

    useEffect(() => {
        fetchCompanies();
        fetchPlans();
    }, [fetchCompanies, fetchPlans]); // ✅ Dépendances ajoutées

    const handleChange = <K extends keyof FormData>(key: K, value: FormData[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        try {
            await createSubscription(form);
            toast.success('Abonnement créé avec succès');
            fetchSubscriptions();
            setForm({ companyId: '', planId: '', durationInMonths: 1 });
        } catch (e) {
            const error = e as Error;
            toast.error(error.message || 'Erreur lors de la création');
        }
    };

    return (
        <div className="space-y-4 bg-white dark:bg-gray-900 p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Nouvel abonnement</h2>

            <div>
                <Label>Entreprise *</Label>
                <select
                    value={form.companyId}
                    onChange={(e) => handleChange('companyId', e.target.value)}
                    className="w-full p-2 border rounded"
                >
                    <option value="">Sélectionner</option>
                    {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <Label>Plan *</Label>
                <select
                    value={form.planId}
                    onChange={(e) => handleChange('planId', e.target.value)}
                    className="w-full p-2 border rounded"
                >
                    <option value="">Sélectionner</option>
                    {plans.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <Label>Durée (mois) *</Label>
                <Input
                    type="number"
                    value={form.durationInMonths}
                    min={1}
                    max={24}
                    onChange={(e) => handleChange('durationInMonths', Number(e.target.value))}
                />
            </div>

            <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Création en cours...' : 'Créer abonnement'}
            </Button>
        </div>
    );
}
