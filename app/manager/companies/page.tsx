'use client';

import { useEffect, useState } from 'react';
import { useCompanyStore } from '@/stores/company-store';
import { usePlanStore } from '@/stores/plan-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Company } from '@/types/company';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CompanyPage() {
    const {
        companies,
        fetchCompanies,
        createCompany,
        updateCompany,
        totalPages,
        loading,
        error,
    } = useCompanyStore();

    const {
        plans,
        fetchPlans,
        loading: loadingPlans,
    } = usePlanStore();

    const [form, setForm] = useState<Partial<Company>>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchCompanies(page);
    }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchPlans();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = (key: keyof Company, value: string | undefined) => {
        setForm({ ...form, [key]: value });
    };

    const handleSubmit = async () => {
        if (!form.name || !form.email) {
            toast.error('Nom et email sont obligatoires');
            return;
        }

        setSubmitting(true);
        try {
            if (editingId) {
                await updateCompany({
                    id: editingId,
                    name: form.name,
                    email: form.email,
                    invoicePrefix: form.invoicePrefix ?? 'FAC',
                    phone: form.phone,
                    address: form.address,
                    planId: form.planId,
                    signatureUrl: form.signatureUrl,
                    stampUrl: form.stampUrl,
                });
                toast.success('Entreprise modifiée');
            } else {
                await createCompany({
                    name: form.name,
                    email: form.email,
                    invoicePrefix: form.invoicePrefix ?? 'FAC',
                    phone: form.phone,
                    address: form.address,
                    planId: form.planId,
                    signatureUrl: form.signatureUrl,
                    stampUrl: form.stampUrl,
                });
                toast.success('Entreprise créée');
            }

            setForm({});
            setEditingId(null);
            fetchCompanies(page); // refresh
        } catch {
            toast.error('Erreur lors de la soumission');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (company: Company) => {
        setForm(company);
        setEditingId(company.id ?? null);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6">
            {/* Liste des entreprises */}
            <div className="md:col-span-8 bg-white dark:bg-gray-900 p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-4">Entreprises</h2>
                {loading && <p className="text-sm text-gray-500">Chargement...</p>}
                {error && <p className="text-sm text-red-500">{error}</p>}

                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                            <th className="p-2 text-left">Nom</th>
                            <th className="p-2 text-left">Email</th>
                            <th className="p-2 text-left">Téléphone</th>
                            <th className="p-2 text-left">Plan</th>
                            <th className="p-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.length > 0 ? (
                            companies.map((company) => (
                                <tr
                                    key={company.id}
                                    className="border-b border-gray-200 dark:border-gray-700"
                                >
                                    <td className="p-2">{company.name}</td>
                                    <td className="p-2">{company.email}</td>
                                    <td className="p-2">{company.phone}</td>
                                    <td className="p-2">
                                        {company.plan?.name || <span className="text-gray-400">N/A</span>}
                                    </td>
                                    <td className="p-2 space-x-2">
                                        <Button className="bg-yellow-400 hover:bg-yellow-500" size="sm" onClick={() => handleEdit(company)}>
                                            Modifier
                                        </Button>
                                        <Button className="bg-green-500 hover:bg-green-600" size="sm">
                                            Abonnement
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-2 text-center text-gray-500">
                                    Aucune entreprise trouvée.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="flex justify-center mt-4 gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <Button
                                key={p}
                                variant={p === page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Formulaire */}
            <div className="md:col-span-4 bg-white dark:bg-gray-900 p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-4">
                    {editingId ? "Modifier l'entreprise" : 'Nouvelle entreprise'}
                </h2>

                <div className="space-y-3">
                    <div>
                        <Label>Nom *</Label>
                        <Input
                            value={form.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Email *</Label>
                        <Input
                            value={form.email || ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Téléphone</Label>
                        <Input
                            value={form.phone || ''}
                            onChange={(e) => handleChange('phone', e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Adresse</Label>
                        <Input
                            value={form.address || ''}
                            onChange={(e) => handleChange('address', e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Préfixe facture</Label>
                        <Input
                            value={form.invoicePrefix || ''}
                            onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Plan *</Label>
                        <select
                            className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                            value={form.planId || ''}
                            onChange={(e) => handleChange('planId', e.target.value)}
                        >
                            <option value="">Sélectionner un plan</option>
                            {loadingPlans ? (
                                <option disabled>Chargement...</option>
                            ) : (
                                plans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <Button onClick={handleSubmit} disabled={submitting} className="w-full mt-2">
                        {submitting ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                        ) : editingId ? (
                            'Mettre à jour'
                        ) : (
                            'Créer'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}