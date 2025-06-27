'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/auth-store';
import { useCategoryStore } from '@/stores/category-store';
import { Loader2, Pencil } from 'lucide-react';
import jsPDF from "jspdf";
import "jspdf-autotable";
export default function AdminCategoryPage() {
    const { user } = useAuthStore();
    const companyId = user?.company.id;
    const {
        categories,
        fetchCategories,
        createCategory,
        updateCategory,
    } = useCategoryStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [name, setName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (companyId) fetchCategories(companyId);
    }, [companyId]);

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Le nom est requis.");
            return;
        }

        setIsLoading(true);

        try {
            if (editingId) {
                await updateCategory({ id: editingId, name });
                toast.success('Catégorie modifiée');
            } else {
                await createCategory({ name, companyId: companyId! });
                toast.success('Catégorie créée');
            }

            // Réinitialisation
            setName('');
            setEditingId(null);
        } catch (e: any) {
            const message = typeof e === 'string' ? e : e?.message;

            toast.error(message || 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };



    // const exportPDF = () => {
    //     const doc: any = new jsPDF();
    //     doc.text('Liste des catégories', 10, 10);
    //     doc.autoTable({
    //         head: [['Nom']],
    //         body: filteredCategories.map((cat) => [cat.name]),
    //     });
    //     doc.save('categories.pdf');
    // };

    function exportToPDF() {
        const doc = new jsPDF();
        doc.text("Liste des tarifications", 14, 14);
        const tableData = categories.map((c) => [
            c.name
        ]);
        doc.autoTable({
            startY: 20,
            head: [['Nom']],
            body: tableData,
        });
        doc.save('categories.pdf');

    }

    return (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-6'>
            {/* Liste */}
            <div className='md:col-span-2 space-y-4'>
                <div className='flex justify-between items-center'>
                    <Input
                        placeholder='Recherche...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-1/2'
                    />
                    <Button variant='outline' onClick={exportToPDF}>Exporter PDF</Button>
                </div>

                <div className='bg-white shadow p-4 rounded'>
                    <h2 className='font-bold text-lg mb-4'>Catégories</h2>
                    <ul className='space-y-2'>
                        {filteredCategories.map((cat) => (
                            <li key={cat.id} className='flex justify-between items-center border-b pb-2 text-orange-400'>
                                <span>{cat.name}</span>
                                <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => {
                                        setEditingId(cat.id);
                                        setName(cat.name);
                                    }}
                                >
                                    <Pencil size={16} className='mr-2' />
                                    Modifier
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Formulaire */}
            <div className='space-y-4 bg-white shadow p-4 rounded'>
                <h2 className='font-bold text-lg mb-2'>
                    {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                </h2>
                <Label>Nom</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />

                <Button
                    className='w-full bg-blue-600 hover:bg-blue-700'
                    onClick={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className='animate-spin' /> : 'Sauvegarder'}
                </Button>
            </div>
        </div>
    );
}
