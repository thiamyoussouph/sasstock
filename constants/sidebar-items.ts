import {
    Home,
    Settings,
    User,
    Box,
    FileText,
    List,
} from 'lucide-react'; // Pas besoin de ChevronLeft/ChevronRight ici

export const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { label: 'Produits', href: '/admin/products', icon: Box },
    { label: 'Catégories', href: '/admin/categories', icon: List }, // ✅ Ajouté ici
    { label: 'Utilisateurs', href: '/admin/users', icon: User },
    { label: 'Factures', href: '/admin/invoices', icon: FileText },
    { label: 'Paramètres', href: '/admin/settings', icon: Settings },
];
