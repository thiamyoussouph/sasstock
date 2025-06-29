export interface Product {
    id: string;
    companyId: string;
    categoryId?: string;
    tvaId?: string;
    name: string;
    codeBar?: string;
    description?: string;
    price: number;
    priceHalf?: number;
    priceWholesale?: number;
    unit: string;
    stockMin: number;
    mainImage?: string;
    createdAt: string;
    quantity: number; // ✅ Ajouté
    isActive: boolean; // ✅ Ajouté
    purchasePrice?: number; // ✅ Ajouté
    updatedAt: string;
}

export interface CreateProductPayload extends Omit<Product, 'id' | 'createdAt' | 'updatedAt'> { }

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
    id: string;
}