'use client';

import { useRef } from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DashboardPage = () => {
  const chartRef = useRef(null);

  const data = {
    labels: ['10/10', '11/10', '12/10', '13/10', '14/10', '15/10'],
    datasets: [
      {
        label: 'Ventes (FCFA)',
        data: [4500, 5200, 4800, 6100, 7300, 6800],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `Ventes: ${context.parsed.y.toLocaleString()} FCFA`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (this: any, tickValue: string | number) {
            if (typeof tickValue === 'number') {
              return tickValue.toLocaleString() + ' FCFA';
            }
            return tickValue;
          },
        },
      },
    },
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord simplifié</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <Bar ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
};

export default DashboardPage;
