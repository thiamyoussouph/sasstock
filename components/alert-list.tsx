'use client';

import { AlertCircle, Bell, CreditCard, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Alert {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

interface AlertListProps {
  alerts: Alert[];
}

export function AlertList({ alerts }: AlertListProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'STOCK_LOW':
        return <Package className="h-5 w-5 text-amber-500" />;
      case 'PAYMENT_OVERDUE':
        return <CreditCard className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertTypeText = (type: string) => {
    switch (type) {
      case 'STOCK_LOW':
        return 'Stock';
      case 'PAYMENT_OVERDUE':
        return 'Paiement';
      default:
        return 'Système';
    }
  };

  return (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <div className="text-center py-4 text-green-600">
          Aucune alerte récente
        </div>
      ) : (
        alerts.map((alert) => (
          <div 
            key={alert.id} 
            className="flex items-start p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
          >
            <div className="mt-1">
              {getAlertIcon(alert.type)}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {alert.message}
                </p>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {new Date(alert.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="mt-1">
                <Badge 
                  variant={
                    alert.type === 'PAYMENT_OVERDUE' ? 'destructive' : 
                    alert.type === 'STOCK_LOW' ? 'warning' : 'default'
                  }
                >
                  {getAlertTypeText(alert.type)}
                </Badge>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}