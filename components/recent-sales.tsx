'use client';
// components/recent-sales.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
}
from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Sale {
  id: string;
  customer: string;
  total: number;
  status: string;
  createdAt: string;
}

interface RecentSalesProps {
  sales: Sale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                Aucune vente récente
              </TableCell>
            </TableRow>
          ) : (
            sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium">{sale.customer}</TableCell>
                <TableCell>
                  {new Date(sale.createdAt).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>{sale.total.toLocaleString()} FCFA</TableCell>
                <TableCell>
                  <Badge variant={sale.status === 'Complété' ? 'success' : 'warning'}>
                    {sale.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}