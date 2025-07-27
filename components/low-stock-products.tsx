'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  quantity: number;
  stockMin: number;
}

interface LowStockProductsProps {
  products: Product[];
}

export function LowStockProducts({ products }: LowStockProductsProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>Stock actuel</TableHead>
            <TableHead>Stock minimum</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-green-600">
                Aucun produit en rupture de stock
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{product.stockMin}</TableCell>
                <TableCell>
                  {product.quantity === 0 ? (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>Rupture</span>
                    </div>
                  ) : product.quantity < product.stockMin ? (
                    <div className="flex items-center text-amber-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>Faible stock</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-green-600">
                      <span>Stock OK</span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}