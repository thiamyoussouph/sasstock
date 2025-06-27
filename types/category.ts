export interface Category {
    id: string;
    name: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryPayload {
    name: string;
    companyId: string;
}

export interface UpdateCategoryPayload {
    id: string;
    name: string;
}