'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AgentFilters({ 
  searchTerm, 
  onSearchChange, 
  onSearchSubmit,
  onKeyPress,
  statusFilter, 
  onStatusFilter, 
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by agent name, role, or user ID (press Enter to search)..."
              value={searchTerm}
              onChange={onSearchChange}
              onKeyPress={onKeyPress}
              className="pl-12 pr-4 py-4 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onStatusFilter('all')}
            className={cn(
              "px-6 py-4 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer",
              statusFilter === 'all'
                ? "bg-primary text-white shadow-lg"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-md border border-gray-200"
            )}
          >
            All
          </button>
          <button
            onClick={() => onStatusFilter('active')}
            className={cn(
              "px-6 py-4 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer",
              statusFilter === 'active'
                ? "bg-success text-white shadow-lg"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-md border border-gray-200"
            )}
          >
            Active
          </button>
          <button
            onClick={() => onStatusFilter('behind-schedule')}
            className={cn(
              "px-6 py-4 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer",
              statusFilter === 'behind-schedule'
                ? "bg-danger text-white shadow-lg"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-md border border-gray-200"
            )}
          >
            Behind Schedule
          </button>
          <button
            onClick={() => onStatusFilter('processing')}
            className={cn(
              "px-6 py-4 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer",
              statusFilter === 'processing'
                ? "bg-warning text-white shadow-lg"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-md border border-gray-200"
            )}
          >
            Processing
          </button>
          <button
            onClick={() => onStatusFilter('failed')}
            className={cn(
              "px-6 py-4 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer",
              statusFilter === 'failed'
                ? "bg-danger text-white shadow-lg"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-md border border-gray-200"
            )}
          >
            Failed
          </button>
        </div>
      </div>
    </div>
  );
}
