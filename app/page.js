'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  Play, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Calendar,
  RefreshCw,
  BarChart3,
  Filter,
  Search,
  Zap
} from 'lucide-react';

export default function Dashboard() {
  const { data: overview, loading, error, refresh } = useRealTimeData('/api/dashboard/overview', 30000);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const getFilteredOverview = () => {
    if (!overview) return overview;
    
    // For now, we'll return the overview as-is since the API doesn't support filtering
    // In a real implementation, you'd pass these filters to the API
    return overview;
  };

  const filteredOverview = getFilteredOverview();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <XCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading dashboard</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={refresh}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!overview) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2">Monitor your AI agent video generation system</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents, users, or metrics..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg w-full sm:w-80 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white"
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105",
                showFilters
                  ? "bg-primary text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200"
              )}
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
            
            {/* Refresh Button */}
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200 hover:scale-105"
            >
              <RefreshCw className={cn("h-5 w-5 mr-2", loading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Filter className="h-5 w-5 mr-2 text-indigo-500" />
                Filter Agents
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => handleStatusFilter('all')}
                className={cn(
                  "flex items-center justify-center px-6 py-4 rounded-lg transition-all duration-200 hover:scale-105",
                  statusFilter === 'all'
                    ? "bg-primary text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200"
                )}
              >
                <Users className="h-5 w-5 mr-2" />
                All Agents
              </button>
              
              <button
                onClick={() => handleStatusFilter('active')}
                className={cn(
                  "flex items-center justify-center px-6 py-4 rounded-lg transition-all duration-200 hover:scale-105",
                  statusFilter === 'active'
                    ? "bg-success text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200"
                )}
              >
                <Play className="h-5 w-5 mr-2" />
                Active
              </button>
              
              <button
                onClick={() => handleStatusFilter('behind-schedule')}
                className={cn(
                  "flex items-center justify-center px-6 py-4 rounded-lg transition-all duration-200 hover:scale-105",
                  statusFilter === 'behind-schedule'
                    ? "bg-danger text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200"
                )}
              >
                <AlertTriangle className="h-5 w-5 mr-2" />
                Behind Schedule
              </button>
              
              <button
                onClick={() => handleStatusFilter('processing')}
                className={cn(
                  "flex items-center justify-center px-6 py-4 rounded-lg transition-all duration-200 hover:scale-105",
                  statusFilter === 'processing'
                    ? "bg-warning text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200"
                )}
              >
                <Clock className="h-5 w-5 mr-2" />
                Processing
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Current filter: <span className="font-semibold text-gray-900 capitalize">{statusFilter.replace('-', ' ')}</span>
                </div>
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Agents"
            value={filteredOverview.totalAgents}
            icon={Users}
            color="primary"
          />
          <StatCard
            title="Active Agents"
            value={filteredOverview.activeAgents}
            icon={Play}
            color="success"
            change={`${Math.round((filteredOverview.activeAgents / filteredOverview.totalAgents) * 100)}%`}
            changeType="positive"
          />
          <StatCard
            title="Behind Schedule"
            value={filteredOverview.behindSchedule}
            icon={AlertTriangle}
            color="danger"
            changeType={filteredOverview.behindSchedule > 0 ? "negative" : "positive"}
          />
          <StatCard
            title="Processing Videos"
            value={filteredOverview.processingVideos}
            icon={Clock}
            color="warning"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Videos Today"
            value={filteredOverview.videosGeneratedToday}
            icon={Calendar}
            color="secondary"
            changeType="positive"
          />
          <StatCard
            title="Videos This Week"
            value={filteredOverview.videosGeneratedThisWeek}
            icon={TrendingUp}
            color="primary"
            changeType="positive"
          />
          <StatCard
            title="Failed Videos"
            value={filteredOverview.failedVideos}
            icon={XCircle}
            color="danger"
            changeType={filteredOverview.failedVideos > 0 ? "negative" : "positive"}
          />
          <StatCard
            title="Success Rate"
            value={`${Math.round(((filteredOverview.videosGeneratedThisWeek - filteredOverview.failedVideos) / Math.max(filteredOverview.videosGeneratedThisWeek, 1)) * 100)}%`}
            icon={CheckCircle}
            color="success"
            changeType="positive"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-primary shadow-2xl rounded-lg overflow-hidden">
          <div className="px-8 py-10">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
              <Zap className="h-6 w-6 mr-3" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Link 
                href="/agents"
                className="group bg-white/15 backdrop-blur-sm border border-white/30 rounded-lg p-6 hover:bg-white/25 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">View All Agents</p>
                    <p className="text-xs text-white/80">Manage agents</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                href="/schedule"
                className="group bg-white/15 backdrop-blur-sm border border-white/30 rounded-lg p-6 hover:bg-white/25 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Check Schedule</p>
                    <p className="text-xs text-white/80">View timeline</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                href="/analytics"
                className="group bg-white/15 backdrop-blur-sm border border-white/30 rounded-lg p-6 hover:bg-white/25 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">View Analytics</p>
                    <p className="text-xs text-white/80">See insights</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                href="/processing"
                className="group bg-white/15 backdrop-blur-sm border border-white/30 rounded-lg p-6 hover:bg-white/25 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Processing Queue</p>
                    <p className="text-xs text-white/80">Monitor status</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="h-6 w-6 mr-3 text-emerald-500" />
                Performance Insights
              </h3>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Success Rate</span>
                <span className="text-lg font-bold text-emerald-600">
                  {Math.round(((filteredOverview.videosGeneratedThisWeek - filteredOverview.failedVideos) / Math.max(filteredOverview.videosGeneratedThisWeek, 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-success h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${Math.round(((filteredOverview.videosGeneratedThisWeek - filteredOverview.failedVideos) / Math.max(filteredOverview.videosGeneratedThisWeek, 1)) * 100)}%` 
                  }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>This week: {filteredOverview.videosGeneratedThisWeek} videos</span>
                <span>Failed: {filteredOverview.failedVideos}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <CheckCircle className="h-6 w-6 mr-3 text-blue-500" />
                System Health
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-emerald-600 font-semibold">Healthy</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Active Agents</span>
                <span className="text-lg font-bold text-blue-600">{filteredOverview.activeAgents}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Behind Schedule</span>
                <span className={`text-lg font-bold ${filteredOverview.behindSchedule > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {filteredOverview.behindSchedule}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Processing Now</span>
                <span className="text-lg font-bold text-orange-600">{filteredOverview.processingVideos}</span>
              </div>
            </div>
          </div>
        </div>
    </div>
    </DashboardLayout>
  );
}