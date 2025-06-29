import {
    Home,
    Settings,
    User,
    Box,
    FileText,
    List,
    Users,
    Building2,
    Archive,
    Warehouse, // Icône pour mouvements de stock
} from 'lucide-react';

export const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { label: 'Produits', href: '/admin/products', icon: Box },
    { label: 'Catégories', href: '/admin/categories', icon: List },
    { label: 'Clients', href: '/admin/customers', icon: Users },
    { label: 'Fournisseurs', href: '/admin/suppliers', icon: Building2 },
    { label: 'Stock', href: '/admin/stock-movements', icon: Warehouse }, // ✅ Ajout ici
    { label: 'Utilisateurs', href: '/admin/users', icon: User },
    { label: 'Factures', href: '/admin/invoices', icon: FileText },
    { label: 'Paramètres', href: '/admin/settings', icon: Settings },
];
