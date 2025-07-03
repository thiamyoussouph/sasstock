'use client';

import SubscriptionFilters from '@/components/subscription/SubscriptionFilters';
import SubscriptionForm from '@/components/subscription/SubscriptionForm';
import SubscriptionTable from '@/components/subscription/SubscriptionTable';

export default function SubscriptionsPage() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
            {/* Colonne gauche : Filtres + Tableau */}
            <div className="md:col-span-8 space-y-6">
                <SubscriptionFilters />
                <SubscriptionTable />
            </div>

            {/* Colonne droite : Formulaire */}
            <div className="md:col-span-4">
                <SubscriptionForm />
            </div>
        </div>
    );
}
