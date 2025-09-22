'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';

export default function SchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [daysFilter, setDaysFilter] = useState(7);
  const [expandedItems, setExpandedItems] = useState(new Set());

  useEffect(() => {
    fetchSchedule();
  }, [typeFilter, daysFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: typeFilter,
        days: daysFilter.toString()
      });
      
      const response = await fetch(`/api/dashboard/schedule?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }
      const data = await response.json();
      setSchedule(data.schedule);
      setSummary(data.summary);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Try again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track upcoming and overdue video generations
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Scheduled
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.total || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Overdue
                    </dt>
                    <dd className="text-lg font-medium text-red-600">
                      {summary.overdue || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Upcoming
                    </dt>
                    <dd className="text-lg font-medium text-blue-600">
                      {summary.upcoming || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md",
                  typeFilter === 'all'
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter('upcoming')}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md",
                  typeFilter === 'upcoming'
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                Upcoming
              </button>
              <button
                onClick={() => setTypeFilter('overdue')}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md",
                  typeFilter === 'overdue'
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                Overdue
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Days:</label>
              <select
                value={daysFilter}
                onChange={(e) => setDaysFilter(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={3}>3 days</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
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
                    "border rounded-lg p-4 transition-all duration-200",
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
                          className="text-gray-400 hover:text-gray-600"
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
                                      className="text-indigo-600 hover:text-indigo-900"
                                    >
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
      </div>
    </DashboardLayout>
  );
}
