'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Clock, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Eye,
  Download
} from 'lucide-react';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';

export default function ProcessingPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchProcessingAgents();
    
    if (autoRefresh) {
      const interval = setInterval(fetchProcessingAgents, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchProcessingAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/agents?status=processing');
      if (!response.ok) {
        throw new Error('Failed to fetch processing agents');
      }
      const data = await response.json();
      setAgents(data.agents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProcessingItems = (agent) => {
    return agent.schedule.generationHistory.filter(gen => gen.status === 'processing');
  };

  const getProcessingDuration = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const diffInMinutes = Math.floor((now - start) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getProcessingStatus = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const diffInMinutes = Math.floor((now - start) / (1000 * 60));
    
    if (diffInMinutes < 5) return { status: 'starting', color: 'text-blue-600' };
    if (diffInMinutes < 30) return { status: 'processing', color: 'text-yellow-600' };
    if (diffInMinutes < 60) return { status: 'taking-long', color: 'text-orange-600' };
    return { status: 'stuck', color: 'text-red-600' };
  };

  if (loading && agents.length === 0) {
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading processing queue</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={fetchProcessingAgents}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Try again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const totalProcessing = agents.reduce((sum, agent) => sum + agent.processingCount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Processing Queue</h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor currently processing video generations
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto-refresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="auto-refresh" className="ml-2 text-sm text-gray-700">
                Auto-refresh
              </label>
            </div>
            <button
              onClick={fetchProcessingAgents}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Currently Processing
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {totalProcessing} video{totalProcessing !== 1 ? 's' : ''}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Processing List */}
        <div className="space-y-4">
          {agents.length === 0 ? (
            <div className="text-center py-12">
              <Play className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No videos processing</h3>
              <p className="mt-1 text-sm text-gray-500">
                All video generations are up to date.
              </p>
            </div>
          ) : (
            agents.map((agent) => {
              const processingItems = getProcessingItems(agent);
              
              return (
                <div key={agent.agentId} className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {agent.agentName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {agent.agentRole} • {processingItems.length} video{processingItems.length !== 1 ? 's' : ''} processing
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Processing
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="space-y-3">
                        {processingItems.map((item, index) => {
                          const processingStatus = getProcessingStatus(item.date);
                          const duration = getProcessingDuration(item.date);
                          
                          return (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      Generation #{item.generationId.toString().slice(-8)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Started {formatRelativeTime(item.date)} • Running for {duration}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={cn(
                                    "text-sm font-medium",
                                    processingStatus.color
                                  )}>
                                    {processingStatus.status}
                                  </span>
                                  <div className="flex space-x-1">
                                    <button className="text-gray-400 hover:text-gray-600">
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <button className="text-gray-400 hover:text-gray-600">
                                      <Download className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Progress bar */}
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                                  <span>Progress</span>
                                  <span>{processingStatus.status}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={cn(
                                      "h-2 rounded-full transition-all duration-300",
                                      processingStatus.status === 'starting' ? "bg-blue-400 w-1/4" :
                                      processingStatus.status === 'processing' ? "bg-yellow-400 w-1/2" :
                                      processingStatus.status === 'taking-long' ? "bg-orange-400 w-3/4" :
                                      "bg-red-400 w-full"
                                    )}
                                  ></div>
                                </div>
                              </div>

                              {/* Additional details */}
                              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Script ID:</span>
                                  <span className="ml-2 text-gray-900">
                                    {item.scriptId || 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Video ID:</span>
                                  <span className="ml-2 text-gray-900">
                                    {item.videoId || 'Pending'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">User:</span>
                                  <span className="ml-2 text-gray-900">
                                    {agent.userId}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Processing Tips */}
        {totalProcessing > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Processing Tips
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Video processing typically takes 5-30 minutes depending on complexity</li>
                    <li>If a video has been processing for over 1 hour, it may be stuck</li>
                    <li>Check the system logs for any error messages if processing seems delayed</li>
                    <li>You can refresh this page to get the latest status updates</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
