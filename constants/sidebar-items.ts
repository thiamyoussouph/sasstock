import {
    Home,
    Settings,
    User,
    Box,
    FileText,
    List,
    Users,
} from 'lucide-react'; // Ajout de l'icône Users

export const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { label: 'Produits', href: '/admin/products', icon: Box },
    { label: 'Catégories', href: '/admin/categories', icon: List },
    { label: 'Clients', href: '/admin/customers', icon: Users }, // ✅ Clients ajoutés ici
    { label: 'Utilisateurs', href: '/admin/users', icon: User },
    { label: 'Factures', href: '/admin/invoices', icon: FileText },
    { label: 'Paramètres', href: '/admin/settings', icon: Settings },
];
