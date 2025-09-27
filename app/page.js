'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import PageHeader from '@/components/PageHeader';
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
  Zap,
  Trash2,
  User
} from 'lucide-react';

export default function Dashboard() {
  const { data: overview, loading, error, refresh } = useRealTimeData('/api/dashboard/overview', 30000);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState('');

  const handleCleanupFailed = async () => {
    if (!confirm('Are you sure you want to remove all failed generation history? This action cannot be undone.')) {
      return;
    }

    setCleanupLoading(true);
    setCleanupMessage('');

    try {
      const response = await fetch('/api/dashboard/cleanup', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        setCleanupMessage(`Successfully cleaned up ${result.modifiedAgents} agents. Removed all failed generation history.`);
        // Refresh the overview data
        refresh();
      } else {
        setCleanupMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setCleanupMessage(`Error: ${error.message}`);
    } finally {
      setCleanupLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => setCleanupMessage(''), 5000);
    }
  };

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
            Try again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!overview) return null;

  return (
    <DashboardLayout>
      <PageHeader 
        title="Dashboard Overview"
        subtitle="Monitor your AI agent video generation system"
      >
        <button
          onClick={handleCleanupFailed}
          disabled={cleanupLoading || loading}
          className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all duration-200 hover:scale-105 cursor-pointer"
        >
          <Trash2 className={cn("h-5 w-5 mr-2", cleanupLoading && "animate-spin")} />
          {cleanupLoading ? 'Cleaning...' : 'Clean Failed'}
        </button>
        
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200 hover:scale-105 cursor-pointer"
        >
          <RefreshCw className={cn("h-5 w-5 mr-2", loading && "animate-spin")} />
          Refresh
        </button>
      </PageHeader>

      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Cleanup Message */}
            {cleanupMessage && (
              <div className={cn(
                "p-4 rounded-lg border",
                cleanupMessage.includes('Successfully') 
                  ? "bg-green-50 border-green-200 text-green-800" 
                  : "bg-red-50 border-red-200 text-red-800"
              )}>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {cleanupMessage}
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Agents"
                value={overview.totalAgents}
                icon={Users}
                color="primary"
              />
              <StatCard
                title="Unique Users"
                value={overview.uniqueUsers}
                icon={User}
                color="info"
              />
              <StatCard
                title="Active Agents"
                value={overview.activeAgents}
                icon={Play}
                color="success"
              />
              <StatCard
                title="Videos Today"
                value={overview.videosGeneratedToday}
                icon={Calendar}
                color="info"
                subtitle={overview.dateRanges?.today?.label}
              />
              <StatCard
                title="Videos This Week"
                value={overview.videosGeneratedThisWeek}
                icon={TrendingUp}
                color="warning"
                subtitle={overview.dateRanges?.thisWeek?.label}
              />
              <StatCard
                title="Behind Schedule"
                value={overview.behindSchedule}
                icon={AlertTriangle}
                color="danger"
              />
              <StatCard
                title="Processing Videos"
                value={overview.processingVideos}
                icon={Play}
                color="warning"
              />
              <StatCard
                title="Failed Videos"
                value={overview.failedVideos}
                icon={XCircle}
                color="danger"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 hover-lift">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Zap className="h-6 w-6 mr-3 text-amber-500" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Link
                  href="/agents"
                  className="group flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 hover:scale-105 cursor-pointer"
                >
                  <Users className="h-8 w-8 text-blue-600 mr-4" />
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">Manage Agents</h4>
                    <p className="text-sm text-gray-600">Configure and monitor AI agents</p>
                  </div>
                </Link>
                <Link
                  href="/schedule"
                  className="group flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 hover:scale-105 cursor-pointer"
                >
                  <Clock className="h-8 w-8 text-green-600 mr-4" />
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-green-600">View Schedule</h4>
                    <p className="text-sm text-gray-600">Check generation timeline</p>
                  </div>
                </Link>
                <Link
                  href="/processing"
                  className="group flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-all duration-200 hover:scale-105 cursor-pointer"
                >
                  <Play className="h-8 w-8 text-orange-600 mr-4" />
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-orange-600">Processing Queue</h4>
                    <p className="text-sm text-gray-600">Monitor active processes</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 hover-lift">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <TrendingUp className="h-6 w-6 mr-3 text-green-500" />
                    Performance Metrics
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-semibold">Optimal</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Success Rate</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {Math.max(0, Math.round(((overview.videosGeneratedThisWeek - overview.failedVideos) / Math.max(1, overview.videosGeneratedThisWeek)) * 100))}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Daily Average</span>
                    <span className="text-lg font-bold text-blue-600">
                      {Math.round(overview.videosGeneratedThisWeek / 7)} videos
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Failed Videos</span>
                    <span className="text-lg font-bold text-red-600">
                      {overview.failedVideos}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="text-sm font-medium text-gray-700 mb-2">Weekly Progress</div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min(100, (overview.videosGeneratedThisWeek / Math.max(1, overview.totalAgents * 7)) * 100)}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>This week: {overview.videosGeneratedThisWeek} videos</span>
                      <span>Failed: {overview.failedVideos}</span>
                    </div>
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
                    <span className="text-lg font-bold text-blue-600">{overview.activeAgents}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Behind Schedule</span>
                    <span className={`text-lg font-bold ${overview.behindSchedule > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {overview.behindSchedule}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Processing Now</span>
                    <span className="text-lg font-bold text-orange-600">{overview.processingVideos}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}