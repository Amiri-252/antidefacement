// frontend/src/components/StatCard.js
import React from 'react';

const StatCard = ({ title, value, change, icon: Icon, color }) => {
  const isPositive = change?.includes('↑');

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm text-gray-600 font-medium">{title}</span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-2">{value}</div>
      {change && (
        <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </div>
      )}
    </div>
  );
};

export default StatCard;