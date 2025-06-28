// --- types/customer.ts ---
export interface Customer {
    id: string;
    companyId: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    credit: number;
    creditLimit?: number;
    createdAt: string;
}

export interface CreateCustomerPayload {
    companyId: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    creditLimit?: number;
}

export interface UpdateCustomerPayload {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    creditLimit?: number;
}
