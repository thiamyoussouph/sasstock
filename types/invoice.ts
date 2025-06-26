export interface InvoiceItemPayload {
    name: string;
    quantity: number;
    unitPrice: number;
}

export interface CreateInvoicePayload {
    companyId: string;
    customerId?: string;
    quoteId?: string;
    title: string;
    dueDate?: Date;
    status: 'unpaid' | 'paid' | 'partial' | 'overdue';
    issueDate?: Date; // ✅ nouvelle propriété
    tva?: number;      // ✅ nouvelle propriété
    note?: string;     // ✅ nouvelle propriété
    comment?: string;  // ✅ nouvelle propriété
    invoiceItems: InvoiceItemPayload[];
}

export interface InvoiceItem {
    id: string;
    invoiceId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Customer {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
}

export interface Invoice {
    id: string;
    companyId: string;
    customerId?: string;
    quoteId?: string;
    title: string;
    total: number;
    dueDate?: string;
    invoiceNumber: string;
    issueDate?: string;   // ✅ nouvelle propriété
    status: 'unpaid' | 'paid' | 'partial' | 'overdue';
    invoiceItems: InvoiceItem[];
    customer?: Customer;
    tva?: number;          // ✅ nouvelle propriété
    note?: string;         // ✅ nouvelle propriété
    comment?: string;      // ✅ nouvelle propriété
    createdAt: string;
}
