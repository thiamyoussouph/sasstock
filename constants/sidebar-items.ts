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
    Warehouse,
    ShoppingCart, // ✅ Icône pour les ventes
} from 'lucide-react';

export const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { label: 'Ventes', href: '/admin/sales', icon: ShoppingCart }, // ✅ Ajout du lien ventes
    { label: 'Produits', href: '/admin/products', icon: Box },
    { label: 'Factures', href: '/admin/invoices', icon: FileText },
    { label: 'Catégories', href: '/admin/categories', icon: List },
    { label: 'Clients', href: '/admin/customers', icon: Users },
    { label: 'Fournisseurs', href: '/admin/suppliers', icon: Building2 },
    { label: 'Stock', href: '/admin/stock-movements', icon: Warehouse },
    { label: 'Utilisateurs', href: '/admin/users', icon: User },
    { label: 'Paramètres', href: '/admin/settings', icon: Settings },
];
