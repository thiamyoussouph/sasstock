// app/admin/invoices/page.tsx
import InvoiceList from '@/components/invoices/InvoiceList';
import { Metadata } from 'next';


export const metadata: Metadata = {
    title: 'Factures | Admin',
    description: 'Liste des factures',
};

export default function InvoicePage() {
    return (
        <div className="space-y-4">
           
            <InvoiceList />
        </div>
    );
}
