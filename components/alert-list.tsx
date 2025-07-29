// components/alert-list.tsx
import React from 'react';

interface Alert {
  id: string;
  message: string;
  type: 'warning' | 'error' | 'info';
}

interface AlertListProps {
  alerts: Alert[];
}

const AlertList: React.FC<AlertListProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-3 rounded-lg border ${
            alert.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : alert.type === 'warning'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {alert.message}
          <button className="ml-2 text-sm text-gray-500">Dismiss</button>
        </div>
      ))}
    </div>
  );
};

export default AlertList;