import { Company } from './company';
import { Plan } from './plan';

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
export type PaymentStatus = 'PAID' | 'UNPAID' | 'FAILED';

export type Subscription = {
    id: string;
    companyId: string;
    planId: string;
    startDate: string;
    endDate: string;
    status: SubscriptionStatus;
    paymentStatus: PaymentStatus;
    createdAt: string;
};

export type SubscriptionPayment = {
    id: string;
    subscriptionId: string;
    amount: number;
    paymentMethod: string;
    status: PaymentStatus;
    paidAt: string | null;
    createdAt: string;
};

export type SubscriptionWithRelations = Subscription & {
    company?: Company;
    plan?: Plan;
    payments?: SubscriptionPayment[];
};

export type CreateSubscriptionPayload = {
    companyId: string;
    planId: string;
    durationInMonths: number;
};

export type CreateSubscriptionPaymentPayload = {
    subscriptionId: string;
    amount: number;
    paymentMethod: string;
};
