'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import { Loader2, UploadCloud, Download } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';

export default function ProductImportForm() {
    const { user } = useAuthStore();
    const companyId = user?.company?.id;
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (
            selected &&
            ![
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/csv',
            ].includes(selected.type)
        ) {
            toast.error('Fichier non supporté. Choisissez un fichier Excel ou CSV.');
            return;
        }
        setFile(selected || null);
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Veuillez sélectionner un fichier.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('companyId', companyId!);

        setIsLoading(true);
        try {
            const res = await fetch('/api/products/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || 'Erreur lors de l’importation.');
            }

            toast.success(result.message || 'Produits importés avec succès !');
            setFile(null);
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message || 'Erreur inconnue.');
            } else {
                toast.error('Erreur inconnue.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded shadow space-y-4 container mx-auto">
            <h2 className="text-lg font-semibold">Importer des produits depuis un fichier</h2>

            <div className="space-y-2">
                <Label htmlFor="productFile">Fichier CSV ou Excel *</Label>
                <Input
                    type="file"
                    id="productFile"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileChange}
                />
            </div>

            {file && (
                <div className="text-sm text-gray-600">
                    Fichier sélectionné : <span className="font-medium">{file.name}</span>
                </div>
            )}

            <Button onClick={handleUpload} disabled={isLoading || !file}>
                {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <UploadCloud className="w-4 h-4 mr-2" />
                )}
                Importer
            </Button>

            <div className="pt-4">
                <p className="text-sm text-gray-600 mb-2">Besoin d’un modèle ?</p>
                <Link
                    href="/template_import_produits.xlsx"
                    download
                    className="inline-flex items-center gap-2 text-blue-600 text-sm hover:underline"
                >
                    <Download className="w-4 h-4" /> Télécharger le modèle Excel
                </Link>
            </div>
        </div>
    );
}
