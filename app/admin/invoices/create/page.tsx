// app/admin/invoices/page.tsx
import CreateInvoiceForm from '@/components/invoices/InvoiceForm';
import { Metadata } from 'next';


export const metadata: Metadata = {
    title: 'Factures | Admin',
    description: 'Liste des factures',
};

export default function CreateInvoicePage() {
    return (
        <div className="space-y-4">
           
            <CreateInvoiceForm />
        </div>
    );
}
