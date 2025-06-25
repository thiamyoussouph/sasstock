import { Home, Settings, User, Box, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { label: 'Produits', href: '/admin/products', icon: Box },
    { label: 'Utilisateurs', href: '/admin/users', icon: User },
    { label: 'Factures', href: '/admin/invoices', icon: FileText }, // ✅ Factures ajoutées
    { label: 'Paramètres', href: '/admin/settings', icon: Settings },
];
