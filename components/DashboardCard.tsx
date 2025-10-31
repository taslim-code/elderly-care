
import React from 'react';

interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, icon, children, onClick, className = '' }) => {
  const cardClasses = `bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex items-center mb-4">
        <div className="bg-teal-100 p-3 rounded-full text-teal-600">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-800 ml-4">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default DashboardCard;
