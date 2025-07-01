import { Customer } from "@prisma/client";

// types/sale.ts
export type SaleMode = 'DETAIL' | 'DEMI_GROS' | 'GROS';
export type PaymentType = 'CASH' | 'MOBILE_MONEY' | 'CARD';

export interface SaleItem {
    id: string;
    saleId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Payment {
    id: string;
    saleId: string;
    amount: number;
    montantRecu: number;
    monnaieRendue: number;
    method: PaymentType;
    paidAt: string;
    note?: string;
}

export interface Sale {
    id: string;
    companyId: string;
    numberSale: string;
    userId: string;
    customerId?: string;
    tvaId?: string;
    total: number;
    saleMode: SaleMode;
    paymentType: PaymentType;
    status: string;
    createdAt: string;
    saleItems: SaleItem[];
    payments: Payment[];
    customer?: Customer;
}

export interface CreateSalePayload {
    companyId: string;
    userId: string;
    customerId?: string;
    tvaId?: string;
    saleMode: SaleMode;
    paymentType: PaymentType;
    status: string;
    total: number;
    saleItems: Omit<SaleItem, 'id' | 'saleId'>[];
    payments: Omit<Payment, 'id' | 'saleId' | 'paidAt'>[];
}
export interface UpdateSalePayload {
    id: string;
    companyId: string;
    userId: string;
    customerId?: string;
    tvaId?: string;
    saleMode: SaleMode;
    paymentType: PaymentType;
    status: string;
    total: number;
    saleItems?: {
        productId: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
    payments?: {
        amount: number;
        montantRecu: number;
        monnaieRendue: number;
        method: PaymentType;
        note?: string;
    }[];
}
