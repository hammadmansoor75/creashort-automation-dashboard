'use client';

import { cn } from '@/lib/utils';

export default function StatCard({ title, value, change, changeType, icon: Icon, className, color }) {
  const getColorClass = () => {
    switch (color) {
      case 'primary': return 'bg-primary';
      case 'secondary': return 'bg-secondary';
      case 'success': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'danger': return 'bg-danger';
      case 'info': return 'bg-info';
      default: return 'bg-primary';
    }
  };

  return (
    <div className={cn(
      "bg-white overflow-hidden rounded-lg shadow-lg border border-gray-200 hover:shadow-xl hover-lift group",
      className
    )}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2 group-hover:text-gray-700 transition-colors">
              {title}
            </p>
            <p className="text-4xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
              {value}
            </p>
            {change && (
              <div className={cn(
                "inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm",
                changeType === 'positive' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                changeType === 'negative' ? 'bg-red-100 text-red-800 border border-red-200' : 
                'bg-gray-100 text-gray-800 border border-gray-200'
              )}>
                {changeType === 'positive' && '↗ '}
                {changeType === 'negative' && '↘ '}
                {change}
              </div>
            )}
          </div>
          {Icon && (
            <div className="flex-shrink-0">
              <div className={cn(
                "w-16 h-16 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300",
                getColorClass()
              )}>
                <Icon className="h-8 w-8 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
