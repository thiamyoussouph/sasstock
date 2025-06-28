// types/supplier.ts
export interface Supplier {
    id: string;
    companyId: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    createdAt: string;
}

export interface CreateSupplierPayload {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    companyId: string;
}

export interface UpdateSupplierPayload {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
}
