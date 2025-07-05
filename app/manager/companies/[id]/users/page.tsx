'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Download, Pencil, ShieldCheck, Eye, Power, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useUserStore } from '@/stores/user-store';
import { CreateUserPayload, UserWithRole } from '@/types/user';
import { useParams } from 'next/navigation';

export default function UserManagementPage() {
    const { id: companyId } = useParams() as { id: string };

    console.log('ID de l\'entreprise :', companyId); // ➜ doit afficher ton UUID
    const params = useParams();
    console.log(params);

    const { users, fetchUsers, updateUser, createUser, loading } = useUserStore();

    const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState<Partial<CreateUserPayload>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        console.log(`Chargement des utilisateurs pour l'entreprise ${companyId}`);
        if (companyId) {

            fetchUsers(companyId).catch((err) => {

                toast.error("Erreur lors du chargement des utilisateurs : " + err.message);
            });
        }
    }, [companyId, fetchUsers]);

    useEffect(() => {
        if (selectedUser) {
            setForm({
                name: selectedUser.name,
                email: selectedUser.email,
            });
        } else {
            setForm({});
        }
    }, [selectedUser]);

    const filteredUsers = users.filter((u) =>
        (u.name || '').toLowerCase().includes(search.toLowerCase())
    );

    const exportToPDF = () => {
        alert('Export PDF non encore implémenté');
    };

    const handleActivate = async (user: UserWithRole) => {
        try {
            await updateUser({ id: user.id, status: !user.status });
            toast.success(`Utilisateur ${user.status ? 'désactivé' : 'activé'}`);
        } catch (e: unknown) {
            if (e instanceof Error) {
                toast.error(e.message);
            } else {
                toast.error("Erreur lors de l'enregistrement");
            }
        }
    };

    const handleSubmit = async () => {
        if (!form.name || !form.email) {
            toast.error("Nom et email sont requis");
            return;
        }

        if (!companyId) {
            toast.error("Entreprise introuvable");
            return;
        }

        const payload = {
            ...form,
            companyId,
        } as CreateUserPayload;

        try {
            setSubmitting(true);
            if (selectedUser) {
                await updateUser({ id: selectedUser.id, ...payload });
                toast.success("Utilisateur mis à jour");
            } else {
                if (!form.password) return toast.error("Mot de passe requis");
                await createUser(payload);
                toast.success("Utilisateur créé");
            }
            setForm({});
            setSelectedUser(null);
            fetchUsers(companyId);
        } catch (e: unknown) {
            if (e instanceof Error) {
                toast.error(e.message);
            } else {
                toast.error("Erreur lors de l'enregistrement");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6">
            {/* Liste utilisateurs */}
            <div className="md:col-span-7 bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Utilisateurs</h2>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Rechercher par nom..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button variant="outline" onClick={exportToPDF}>
                            <Download className="w-4 h-4 mr-1" /> Export PDF
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-10 text-gray-500">
                        <Loader2 className="animate-spin w-5 h-5 mr-2" /> Chargement des utilisateurs...
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800">
                                <th className="p-2 text-left">Nom</th>
                                <th className="p-2 text-left">Email</th>
                                <th className="p-2 text-left">Rôle</th>
                                <th className="p-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700">
                                    <td className="p-2">{user.name}</td>
                                    <td className="p-2">{user.email}</td>
                                    <td className="p-2">{user.role?.name || 'N/A'}</td>
                                    <td className="p-2 flex flex-wrap gap-2">
                                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600" onClick={() => setSelectedUser(user)}>
                                            <Pencil className="w-4 h-4 mr-1" />
                                        </Button>
                                        <Button size="sm" className="bg-green-500 hover:bg-green-600">
                                            <Eye className="w-4 h-4 mr-1" />
                                        </Button>
                                        <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                                            <ShieldCheck className="w-4 h-4 mr-1" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            className={user.status ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-400 hover:bg-yellow-500'}
                                            onClick={() => handleActivate(user)}
                                        >
                                            <Power className="w-4 h-4 mr-1" /> {user.status ? 'Désactiver' : 'Activer'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Formulaire */}
            <div className="md:col-span-5 bg-white dark:bg-gray-900 p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-4">
                    {selectedUser ? 'Modifier utilisateur' : 'Nouveau utilisateur'}
                </h2>

                <div className="space-y-3">
                    <div>
                        <Label>Nom</Label>
                        <Input
                            value={form.name || ''}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input
                            value={form.email || ''}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>
                    {!selectedUser && (
                        <div>
                            <Label>Mot de passe</Label>
                            <Input
                                type="password"
                                value={form.password || ''}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                        </div>
                    )}
                    <Button onClick={handleSubmit} className="w-full mt-2" disabled={submitting}>
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Soumission...
                            </span>
                        ) : (
                            selectedUser ? 'Mettre à jour' : 'Créer utilisateur'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
