// Types de mouvements autorisés
export type StockMovementType =
    | "ENTREE"
    | "SORTIE"
    | "REAPPROVISIONNEMENT"
    | "VENTE"
    | "INVENTAIRE";

// Détail d'un item de mouvement de stock
export interface StockMovementItem {
    id: string;
    stockMovementId: string;
    productId: string;
    quantity: number;
    purchasePrice?: number;
    product?: {
        id: string;
        name: string;
        unit: string;
    }; // Optionnel : si besoin côté affichage
}

// Entité principale de mouvement de stock
export interface StockMovement {
    id: string;
    companyId: string;
    type: StockMovementType;
    description?: string;
    createdBy?: string;
    createdAt: string;
    items: StockMovementItem[];
}

// Payload pour créer un mouvement
export interface CreateStockMovementPayload {
    companyId: string;
    type: StockMovementType;
    description?: string;
    createdBy?: string;
    items: {
        productId: string;
        quantity: number;
        purchasePrice?: number;
    }[];
}

// Payload pour mettre à jour un mouvement existant
export interface UpdateStockMovementPayload {
    type: StockMovementType;
    description?: string;
    createdBy?: string;
    items: {
        productId: string;
        quantity: number;
        purchasePrice?: number;
    }[];
}
