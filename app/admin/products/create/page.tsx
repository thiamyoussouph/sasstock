'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import CreateProductForm from '@/components/product/CreateProductForm';
import ProductImportForm from '@/components/product/ProductImportForm';

export default function ProductCreatePage() {
    const [mode, setMode] = useState<'manual' | 'import'>('manual');

    return (
        <div className="p-6 bg-white rounded shadow space-y-6">
            <div className="flex gap-2 mb-4">
                <Button
                    variant={mode === 'manual' ? 'default' : 'outline'}
                    onClick={() => setMode('manual')}
                >
                    Saisie manuelle
                </Button>
                <Button
                    variant={mode === 'import' ? 'default' : 'outline'}
                    onClick={() => setMode('import')}
                >
                    Importer un fichier
                </Button>
            </div>

            {mode === 'manual' && <CreateProductForm />}
            {mode === 'import' && <ProductImportForm />}
        </div>
    );
}
