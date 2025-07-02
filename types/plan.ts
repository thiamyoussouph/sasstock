export interface Plan {
    id: string;
    name: string;
    description?: string;
    pricePerMonth?: number;
    maxUsers?: number;
    maxProducts?: number;
    maxSalesPerDay?: number;
    enableSync: boolean;
    enableReports: boolean;
    enableMultiPOS: boolean;
    enableExport: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePlanPayload extends Omit<Plan, 'id' | 'createdAt' | 'updatedAt'> { }
export interface UpdatePlanPayload extends Partial<CreatePlanPayload> {
    id: string;
}