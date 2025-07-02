import {
    Home,
    Settings,
    User,
    Box,
    FileText,
    List,
    Users,
    Building2,
    Warehouse,
    ShoppingCart, // ✅ Icône pour les ventes
} from 'lucide-react';

export const sidebarManagerItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { label: 'Produits', href: '/admin/products', icon: Box },
    { label: 'Catégories', href: '/admin/categories', icon: List },
    { label: 'Clients', href: '/admin/customers', icon: Users },
    { label: 'Fournisseurs', href: '/admin/suppliers', icon: Building2 },
    { label: 'Stock', href: '/admin/stock-movements', icon: Warehouse },
    { label: 'Ventes', href: '/admin/sales', icon: ShoppingCart }, // ✅ Ajout du lien ventes
    { label: 'Utilisateurs', href: '/admin/users', icon: User },
    { label: 'Factures', href: '/admin/invoices', icon: FileText },
    { label: 'Paramètres', href: '/admin/settings', icon: Settings },
];
