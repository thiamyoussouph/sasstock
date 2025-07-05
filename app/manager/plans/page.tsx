'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description?: string;
  pricePerMonth?: number;
  maxUsers?: number;
  maxProducts?: number;
  maxSalesPerDay?: number;
  enableSync: boolean;
  enableReports: boolean;
  enableMultiPOS: boolean;
  enableExport: boolean;
}

type PlanForm = Omit<Plan, 'id'>;

export default function PlanManager() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState<PlanForm>({
    name: '',
    description: '',
    pricePerMonth: 0,
    maxUsers: 0,
    maxProducts: 0,
    maxSalesPerDay: 0,
    enableSync: false,
    enableReports: false,
    enableMultiPOS: false,
    enableExport: false,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/plans');
      const data: Plan[] = await res.json();
      setPlans(data);
    } catch {
      toast.error('Erreur lors du chargement des plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const method = editingPlan ? 'PUT' : 'POST';
      const endpoint = editingPlan
        ? `/api/plans/${editingPlan.id}`
        : '/api/plans';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }

      toast.success(
        editingPlan ? 'Plan modifié avec succès' : 'Plan créé avec succès'
      );

      setForm({
        name: '',
        description: '',
        pricePerMonth: 0,
        maxUsers: 0,
        maxProducts: 0,
        maxSalesPerDay: 0,
        enableSync: false,
        enableReports: false,
        enableMultiPOS: false,
        enableExport: false,
      });
      setEditingPlan(null);
      await fetchPlans();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Erreur lors de l'enregistrement");
      } else {
        toast.error('Erreur inconnue');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setForm(plan);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Liste des plans */}
      <div className="overflow-x-auto border rounded-md p-4">
        <h2 className="text-lg font-semibold mb-4">Plans existants</h2>
        <table className="min-w-full text-sm">
          <thead className="bg-muted dark:bg-gray-800">
            <tr>
              <th className="px-3 py-2 text-left">Nom</th>
              <th className="px-3 py-2 text-left">Prix/mois</th>
              <th className="px-3 py-2 text-left">Utilisateurs</th>
              <th className="px-3 py-2 text-left">Produits</th>
              <th className="px-3 py-2 text-left">Sync</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.length > 0 ? (
              plans.map((plan) => (
                <tr key={plan.id} className="border-b">
                  <td className="px-3 py-2">{plan.name}</td>
                  <td className="px-3 py-2">{plan.pricePerMonth} €</td>
                  <td className="px-3 py-2">{plan.maxUsers ?? '-'}</td>
                  <td className="px-3 py-2">{plan.maxProducts ?? '-'}</td>
                  <td className="px-3 py-2">
                    {plan.enableSync ? '✅' : '❌'}
                  </td>
                  <td className="px-3 py-2">
                    <Button size="sm" onClick={() => handleEdit(plan)}>
                      Modifier
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-4">
                  Aucun plan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Formulaire */}
      <div className="border rounded-md p-4">
        <h2 className="text-lg font-semibold mb-4">
          {editingPlan ? 'Modifier le plan' : 'Créer un nouveau plan'}
        </h2>

        <div className="space-y-3">
          <div>
            <Label>Nom *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Prix / mois</Label>
              <Input
                type="number"
                value={form.pricePerMonth || ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    pricePerMonth: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <Label>Max utilisateurs</Label>
              <Input
                type="number"
                value={form.maxUsers || ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    maxUsers: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Max produits</Label>
              <Input
                type="number"
                value={form.maxProducts || ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    maxProducts: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <Label>Ventes / jour</Label>
              <Input
                type="number"
                value={form.maxSalesPerDay || ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    maxSalesPerDay: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          {/* Switches */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex items-center justify-between">
              <Label>Synchronisation</Label>
              <Switch
                checked={form.enableSync}
                onCheckedChange={(val) =>
                  setForm((f) => ({ ...f, enableSync: val }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Rapports</Label>
              <Switch
                checked={form.enableReports}
                onCheckedChange={(val) =>
                  setForm((f) => ({ ...f, enableReports: val }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Multi POS</Label>
              <Switch
                checked={form.enableMultiPOS}
                onCheckedChange={(val) =>
                  setForm((f) => ({ ...f, enableMultiPOS: val }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Exportation</Label>
              <Switch
                checked={form.enableExport}
                onCheckedChange={(val) =>
                  setForm((f) => ({ ...f, enableExport: val }))
                }
              />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
}
