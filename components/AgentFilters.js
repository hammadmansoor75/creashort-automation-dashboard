'use client';

import { Search, RefreshCw, Settings, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AgentFilters({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusFilter, 
  onRefresh,
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by agent name, role, or user ID (e.g., user_001)..."
              value={searchTerm}
              onChange={onSearchChange}
              className="pl-12 pr-4 py-4 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onStatusFilter('all')}
            className={cn(
              "px-6 py-4 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105",
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
              "px-6 py-4 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105",
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
              "px-6 py-4 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105",
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
              "px-6 py-4 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105",
              statusFilter === 'processing'
                ? "bg-warning text-white shadow-lg"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-md border border-gray-200"
            )}
          >
            Processing
          </button>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button 
          onClick={onRefresh}
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:scale-105"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Refresh
        </button>
        <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:scale-105">
          <Settings className="h-5 w-5 mr-2" />
          Settings
        </button>
      </div>
    </div>
  );
}
