'use client';

import {
    Command,
    CommandInput,
    CommandItem,
    CommandEmpty,
    CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Product {
    id: string;
    name: string;
    codeBar?: string;
}

interface Props {
    products: Product[];
    onSelect: (productId: string) => void;
}

export default function ProductSearchSelect({ products, onSelect }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedLabel, setSelectedLabel] = useState('');

    const filtered = searchTerm.length >= 1
        ? products.filter((p) =>
            `${p.name} ${p.codeBar || ''}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        )
        : [];

    const handleSelect = (product: Product) => {
        setSelectedProductId(product.id);
        setSelectedLabel(`${product.name}${product.codeBar ? ` - ${product.codeBar}` : ''}`);
        setSearchTerm(`${product.name}${product.codeBar ? ` - ${product.codeBar}` : ''}`);
    };

    const handleAdd = () => {
        if (selectedProductId) {
            onSelect(selectedProductId);
            setSearchTerm('');
            setSelectedProductId('');
            setSelectedLabel('');
        }
    };

    return (
        <div>
            <label className="text-sm font-medium block mb-1">Rechercher un produit</label>

            <Command className="border rounded-md w-full max-w-md bg-white">
                <CommandInput
                    placeholder="Nom ou code-barres"
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                />
                {searchTerm && (
                    <CommandList>
                        <CommandEmpty>Aucun produit trouvé</CommandEmpty>
                        {filtered.map((product) => {
                            const label = `${product.name}${product.codeBar ? ` - ${product.codeBar}` : ''}`;
                            return (
                                <CommandItem
                                    key={product.id}
                                    value={label}
                                    onSelect={() => handleSelect(product)}
                                >
                                    {label}
                                </CommandItem>
                            );
                        })}
                    </CommandList>
                )}
            </Command>

            <Button
                className="mt-2 bg-blue-600 hover:bg-blue-700"
                disabled={!selectedProductId}
                onClick={handleAdd}
            >
                Ajouter
            </Button>
        </div>
    );
}
