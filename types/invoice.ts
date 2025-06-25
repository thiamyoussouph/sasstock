// types/invoice.ts

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
    items: InvoiceItemPayload[];
}

export interface InvoiceItem {
    id: string;
    invoiceId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Invoice {
    id: string;
    companyId: string;
    customerId?: string;
    quoteId?: string;
    title: string;
    total: number;
    dueDate?: string;
    status: 'unpaid' | 'paid' | 'partial' | 'overdue';
    invoiceItems: InvoiceItem[];
    createdAt: string;
}
