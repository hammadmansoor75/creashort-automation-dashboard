'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  TrendingUp,
  Activity
} from 'lucide-react';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';

export default function SchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [daysFilter, setDaysFilter] = useState(7);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedItems, setExpandedItems] = useState(new Set());

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchSchedule();
  }, [typeFilter, daysFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchSchedule();
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: typeFilter,
        days: daysFilter.toString(),
        page: currentPage.toString(),
        limit: '10'
      });
      
      const response = await fetch(`/api/dashboard/schedule?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }
      const data = await response.json();
      setSchedule(data.schedule);
      setSummary(data.summary);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (agentId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(agentId)) {
      newExpanded.delete(agentId);
    } else {
      newExpanded.add(agentId);
    }
    setExpandedItems(newExpanded);
  };

  const getPriorityColor = (item) => {
    if (item.isOverdue) return 'border-red-200 bg-red-50';
    if (item.daysUntilNext <= 1) return 'border-yellow-200 bg-yellow-50';
    if (item.daysUntilNext <= 3) return 'border-blue-200 bg-blue-50';
    return 'border-gray-200 bg-white';
  };

  const getPriorityIcon = (item) => {
    if (item.isOverdue) return AlertTriangle;
    if (item.daysUntilNext <= 1) return Clock;
    return Calendar;
  };

  const getPriorityText = (item) => {
    if (item.isOverdue) return 'Overdue';
    if (item.daysUntilNext <= 1) return 'Due Soon';
    if (item.daysUntilNext <= 3) return 'Upcoming';
    return 'Scheduled';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-gray-600 font-medium">Loading schedule...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading schedule</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={fetchSchedule}
            className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:shadow-lg disabled:opacity-50 transition-all duration-200 hover:scale-105 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader 
        title="Schedule Overview"
        subtitle="Track upcoming and overdue video generations across all agents"
      >
        <button
          onClick={fetchSchedule}
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Total Scheduled */}
          <div className="bg-white overflow-hidden rounded-lg shadow-lg border border-gray-200 hover:shadow-xl hover-lift group cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1 group-hover:text-gray-700 transition-colors">
                    Total Scheduled
                  </p>
                  <p className="text-4xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                    {summary.total || 0}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-primary">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-white overflow-hidden rounded-lg shadow-lg border border-gray-200 hover:shadow-xl hover-lift group cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1 group-hover:text-gray-700 transition-colors">
                    Overdue
                  </p>
                  <p className="text-4xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                    {summary.overdue || 0}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-danger">
                    <AlertTriangle className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming */}
          <div className="bg-white overflow-hidden rounded-lg shadow-lg border border-gray-200 hover:shadow-xl hover-lift group cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1 group-hover:text-gray-700 transition-colors">
                    Upcoming
                  </p>
                  <p className="text-4xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                    {summary.upcoming || 0}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-info">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setTypeFilter('all')}
                className={cn(
                  "px-6 py-4 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer",
                  typeFilter === 'all'
                    ? "bg-primary text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-md border border-gray-200"
                )}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter('upcoming')}
                className={cn(
                  "px-6 py-4 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer",
                  typeFilter === 'upcoming'
                    ? "bg-info text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-md border border-gray-200"
                )}
              >
                Upcoming
              </button>
              <button
                onClick={() => setTypeFilter('overdue')}
                className={cn(
                  "px-6 py-4 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer",
                  typeFilter === 'overdue'
                    ? "bg-danger text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-md border border-gray-200"
                )}
              >
                Overdue
              </button>
            </div>
            
            {/* Days Filter */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Time Range:
              </label>
              <div className="flex gap-2">
                {[
                  { value: 3, label: '3d' },
                  { value: 7, label: '7d' },
                  { value: 14, label: '14d' },
                  { value: 30, label: '30d' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDaysFilter(option.value)}
                    className={cn(
                      "px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer min-w-[50px]",
                      daysFilter === option.value
                        ? "bg-secondary text-white shadow-lg"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-md border border-gray-200"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule List */}
        <div className="space-y-4">
          {schedule.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No scheduled items</h3>
              <p className="mt-1 text-sm text-gray-500">
                No video generations scheduled for the selected period.
              </p>
            </div>
          ) : (
            schedule.map((item) => {
              const PriorityIcon = getPriorityIcon(item);
              const isExpanded = expandedItems.has(item.agentId);
              
              return (
                <div
                  key={item.agentId}
                  className={cn(
                    "border rounded-lg p-6 transition-all duration-200 shadow-sm hover:shadow-lg cursor-pointer",
                    getPriorityColor(item)
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <PriorityIcon className={cn(
                        "h-5 w-5",
                        item.isOverdue ? "text-red-500" : 
                        item.daysUntilNext <= 1 ? "text-yellow-500" : "text-blue-500"
                      )} />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {item.agentName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {item.agentRole} • Every {item.frequency.intervalDays} day{item.frequency.intervalDays > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(item.nextGenerationDate)}
                        </p>
                        <p className={cn(
                          "text-sm",
                          item.isOverdue ? "text-red-600" : 
                          item.daysUntilNext <= 1 ? "text-yellow-600" : "text-gray-500"
                        )}>
                          {item.isOverdue 
                            ? `${Math.abs(item.daysUntilNext)} days overdue`
                            : item.daysUntilNext === 0 
                              ? 'Due today'
                              : `${item.daysUntilNext} days remaining`
                          }
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          item.isOverdue ? "bg-red-100 text-red-800" :
                          item.daysUntilNext <= 1 ? "bg-yellow-100 text-yellow-800" :
                          item.daysUntilNext <= 3 ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        )}>
                          {getPriorityText(item)}
                        </span>
                        <button
                          onClick={() => toggleExpanded(item.agentId)}
                          className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Agent Details</h4>
                          <dl className="space-y-1">
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-500">User ID:</dt>
                              <dd className="text-sm text-gray-900">{item.userId}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-500">Plan:</dt>
                              <dd className="text-sm text-gray-900 capitalize">{item.frequency.plan}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-500">Monthly Videos:</dt>
                              <dd className="text-sm text-gray-900">{item.frequency.monthlyVideos}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-500">Credits:</dt>
                              <dd className="text-sm text-gray-900">{item.frequency.credits}</dd>
                            </div>
                          </dl>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Last Generation</h4>
                          {item.lastGeneration ? (
                            <dl className="space-y-1">
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Date:</dt>
                                <dd className="text-sm text-gray-900">{formatDate(item.lastGeneration.date)}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Status:</dt>
                                <dd className="text-sm">
                                  <span className={cn(
                                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                    item.lastGeneration.status === 'published' ? "bg-green-100 text-green-800" :
                                    item.lastGeneration.status === 'processing' ? "bg-blue-100 text-blue-800" :
                                    item.lastGeneration.status === 'failed' ? "bg-red-100 text-red-800" :
                                    "bg-yellow-100 text-yellow-800"
                                  )}>
                                    {item.lastGeneration.status}
                                  </span>
                                </dd>
                              </div>
                              {item.lastGeneration.videoUrl && (
                                <div className="flex justify-between">
                                  <dt className="text-sm text-gray-500">Video:</dt>
                                  <dd className="text-sm">
                                    <a 
                                      href={item.lastGeneration.videoUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-indigo-600 hover:text-indigo-900 font-medium hover:underline cursor-pointer"
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      View Video
                                    </a>
                                  </dd>
                                </div>
                              )}
                            </dl>
                          ) : (
                            <p className="text-sm text-gray-500">No previous generations</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing{' '}
                <span className="font-semibold text-gray-900">{(currentPage - 1) * 10 + 1}</span>
                {' '}to{' '}
                <span className="font-semibold text-gray-900">
                  {Math.min(currentPage * 10, pagination.total)}
                </span>
                {' '}of{' '}
                <span className="font-semibold text-gray-900">{pagination.total}</span>
                {' '}scheduled items
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.pages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
