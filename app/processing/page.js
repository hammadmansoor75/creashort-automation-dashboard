'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { 
  Clock, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Server,
  Activity,
  TrendingUp,
  Timer,
  Zap,
  Users,
  BarChart3,
  Copy
} from 'lucide-react';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';

export default function ProcessingPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [stats, setStats] = useState({
    totalProcessing: 0,
    averageProcessingTime: 0,
    longestRunning: 0,
    serverBreakdown: {},
    statusBreakdown: {}
  });
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    fetchProcessingAgents();
    
    if (autoRefresh) {
      const interval = setInterval(fetchProcessingAgents, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProcessingAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/agents?status=processing');
      if (!response.ok) {
        throw new Error('Failed to fetch processing agents');
      }
      const data = await response.json();
      setAgents(data.agents);
      calculateStats(data.agents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (agentsList) => {
    const allProcessingItems = [];
    const serverBreakdown = {};
    const statusBreakdown = {
      starting: 0,
      processing: 0,
      'taking-long': 0,
      stuck: 0
    };

    agentsList.forEach(agent => {
      const processingItems = agent.schedule?.generationHistory?.filter(gen => gen.status === 'processing') || [];
      processingItems.forEach(item => {
        // Get server from processing lock or fallback
        const serverName = agent.processingLock?.lockedBy || 'unknown-server';
        allProcessingItems.push({
          ...item,
          agentName: agent.agentName,
          processingServer: serverName,
          lockExpiration: agent.processingLock?.expiresAt,
          lockStartTime: agent.processingLock?.lockedAt
        });
      });
    });

    // Calculate server breakdown
    allProcessingItems.forEach(item => {
      const server = item.processingServer || 'unknown-server';
      serverBreakdown[server] = (serverBreakdown[server] || 0) + 1;
    });

    // Calculate status breakdown and timing stats
    let totalProcessingTime = 0;
    let longestRunning = 0;

    allProcessingItems.forEach(item => {
      if (!item.date) return;
      const startDate = new Date(item.date);
      if (isNaN(startDate.getTime())) return;
      
      const processingTime = Math.floor((new Date() - startDate) / (1000 * 60));
      totalProcessingTime += processingTime;
      longestRunning = Math.max(longestRunning, processingTime);

      const status = getProcessingStatus(item.date).status;
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
    });

    setStats({
      totalProcessing: allProcessingItems.length,
      averageProcessingTime: allProcessingItems.length > 0 ? Math.round(totalProcessingTime / allProcessingItems.length) : 0,
      longestRunning,
      serverBreakdown,
      statusBreakdown
    });
  };

  const getProcessingItems = (agent) => {
    return agent.schedule?.generationHistory?.filter(gen => gen.status === 'processing') || [];
  };

  const getProcessingDuration = (startDate) => {
    if (!startDate) return 'Unknown';
    const now = new Date();
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return 'Invalid date';
    const diffInMinutes = Math.floor((now - start) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getProcessingStatus = (startDate) => {
    if (!startDate) return { status: 'unknown', color: 'text-gray-600' };
    const now = new Date();
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return { status: 'invalid-date', color: 'text-gray-600' };
    const diffInMinutes = Math.floor((now - start) / (1000 * 60));
    
    if (diffInMinutes < 5) return { status: 'starting', color: 'text-blue-600' };
    if (diffInMinutes < 30) return { status: 'processing', color: 'text-yellow-600' };
    if (diffInMinutes < 60) return { status: 'taking-long', color: 'text-orange-600' };
    return { status: 'stuck', color: 'text-red-600' };
  };

  const isLockExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  const getLockTimeRemaining = (expiresAt) => {
    if (!expiresAt) return 'No expiration';
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffInMinutes = Math.floor((expires - now) / (1000 * 60));
    
    if (diffInMinutes <= 0) return 'Expired';
    if (diffInMinutes < 60) return `${diffInMinutes}m remaining`;
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}m remaining`;
  };

  if (loading && agents.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-gray-600 font-medium">Loading processing queue...</p>
          </div>
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
            className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:shadow-lg disabled:opacity-50 transition-all duration-200 hover:scale-105 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const totalProcessing = agents.reduce((sum, agent) => sum + agent.processingCount, 0);

  return (
    <DashboardLayout>
      <PageHeader 
        title="Processing Queue"
        subtitle="Real-time monitoring of video generation processes across all servers"
      >
        <div className="flex items-center bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <input
            type="checkbox"
            id="auto-refresh"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="auto-refresh" className="ml-2 text-sm text-gray-700 font-medium cursor-pointer">
            Auto-refresh (30s)
          </label>
        </div>
        <button
          onClick={fetchProcessingAgents}
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Currently Processing */}
          <div className="bg-white overflow-hidden rounded-lg shadow-lg border border-gray-200 hover:shadow-xl hover-lift group cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1 group-hover:text-gray-700 transition-colors">
                    Currently Processing
                  </p>
                  <p className="text-4xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                    {stats.totalProcessing}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-primary">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Average Processing Time */}
          <div className="bg-white overflow-hidden rounded-lg shadow-lg border border-gray-200 hover:shadow-xl hover-lift group cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1 group-hover:text-gray-700 transition-colors">
                    Avg Processing Time
                  </p>
                  <p className="text-4xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                    {stats.averageProcessingTime}m
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-info">
                    <Timer className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Longest Running */}
          <div className="bg-white overflow-hidden rounded-lg shadow-lg border border-gray-200 hover:shadow-xl hover-lift group cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1 group-hover:text-gray-700 transition-colors">
                    Longest Running
                  </p>
                  <p className="text-4xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                    {stats.longestRunning}m
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-warning">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Servers */}
          <div className="bg-white overflow-hidden rounded-lg shadow-lg border border-gray-200 hover:shadow-xl hover-lift group cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1 group-hover:text-gray-700 transition-colors">
                    Active Servers
                  </p>
                  <p className="text-4xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                    {Object.keys(stats.serverBreakdown).length}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-success">
                    <Server className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Server Breakdown */}
        {Object.keys(stats.serverBreakdown).length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <Server className="h-6 w-6 text-primary mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Server Distribution</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stats.serverBreakdown).map(([server, count]) => (
                <div key={server} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-gray-700">{server}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(count / stats.totalProcessing) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                <div key={agent.agentId} className="bg-white shadow-lg rounded-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <div className="px-6 py-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Clock className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-xl font-bold text-gray-900">
                            {agent.agentName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {agent.agentRole} • {processingItems.length} video{processingItems.length !== 1 ? 's' : ''} processing
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
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
                            <div key={index} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] group">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                  <div className="flex-shrink-0">
                                    <div className={cn(
                                      "w-4 h-4 rounded-full animate-pulse shadow-lg",
                                      processingStatus.status === 'starting' ? "bg-gradient-to-r from-blue-400 to-blue-500" :
                                      processingStatus.status === 'processing' ? "bg-gradient-to-r from-yellow-400 to-orange-400" :
                                      processingStatus.status === 'taking-long' ? "bg-gradient-to-r from-orange-400 to-red-400" :
                                      processingStatus.status === 'unknown' || processingStatus.status === 'invalid-date' ? "bg-gradient-to-r from-gray-400 to-gray-500" :
                                      "bg-gradient-to-r from-red-400 to-red-500"
                                    )}></div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <p className="text-lg font-bold text-gray-900">
                                        Generation #{item.generationId ? item.generationId.toString().slice(-8) : 'N/A'}
                                      </p>
                                      <span className={cn(
                                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm",
                                        processingStatus.status === 'starting' ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300" :
                                        processingStatus.status === 'processing' ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300" :
                                        processingStatus.status === 'taking-long' ? "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300" :
                                        processingStatus.status === 'unknown' || processingStatus.status === 'invalid-date' ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300" :
                                        "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300"
                                      )}>
                                        {processingStatus.status.replace('-', ' ')}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                                      <span className="flex items-center bg-white px-3 py-1 rounded-lg shadow-sm">
                                        <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                        Started {item.date ? formatRelativeTime(item.date) : 'Unknown'}
                                      </span>
                                      <span className="flex items-center bg-white px-3 py-1 rounded-lg shadow-sm">
                                        <Timer className="h-4 w-4 mr-2 text-green-500" />
                                        Running for {duration}
                                      </span>
                                      <span className="flex items-center bg-white px-3 py-1 rounded-lg shadow-sm">
                                        <Server className="h-4 w-4 mr-2 text-purple-500" />
                                        <span className={cn(
                                          agent.processingLock && isLockExpired(agent.processingLock.expiresAt) 
                                            ? "text-red-600 font-semibold" 
                                            : "text-gray-700 font-medium"
                                        )}>
                                          Locked by: {agent.processingLock?.lockedBy || 'unknown-server'}
                                        </span>
                                        {agent.processingLock && isLockExpired(agent.processingLock.expiresAt) && (
                                          <AlertTriangle className="h-3 w-3 ml-1 text-red-500" />
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Progress bar */}
                              <div className="mt-4">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                  <span className="font-medium">Progress</span>
                                  <span className="font-semibold text-gray-800">{processingStatus.status}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                                  <div 
                                    className={cn(
                                      "h-3 rounded-full transition-all duration-500 shadow-sm",
                                      processingStatus.status === 'starting' ? "bg-gradient-to-r from-blue-400 to-blue-500 w-1/4" :
                                      processingStatus.status === 'processing' ? "bg-gradient-to-r from-yellow-400 to-orange-400 w-1/2" :
                                      processingStatus.status === 'taking-long' ? "bg-gradient-to-r from-orange-400 to-red-400 w-3/4" :
                                      processingStatus.status === 'unknown' || processingStatus.status === 'invalid-date' ? "bg-gradient-to-r from-gray-400 to-gray-500 w-1/2" :
                                      "bg-gradient-to-r from-red-400 to-red-500 w-full"
                                    )}
                                  ></div>
                                </div>
                              </div>

                              {/* Additional details */}
                              <div className="mt-6 bg-gradient-to-r from-gray-50 to-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                  <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                    <span className="text-gray-600 font-semibold">Agent ID:</span>
                                    <div className="flex items-center space-x-2">
                                      <code className="text-gray-900 bg-gray-100 px-3 py-1 rounded-lg text-xs font-mono border">
                                        {agent._id}
                                      </code>
                                      <button
                                        onClick={() => copyToClipboard(agent._id, `agent-${agent._id}`)}
                                        className="text-gray-400 hover:text-primary transition-all duration-200 cursor-pointer p-2 rounded-lg hover:bg-gray-100 hover:scale-110"
                                        title="Copy Agent ID"
                                      >
                                        <Copy className="h-4 w-4" />
                                      </button>
                                      {copiedId === `agent-${agent._id}` && (
                                        <span className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">Copied!</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                    <span className="text-gray-600 font-semibold">User ID:</span>
                                    <div className="flex items-center space-x-2">
                                      <code className="text-gray-900 bg-gray-100 px-3 py-1 rounded-lg text-xs font-mono border">
                                        {agent.userId}
                                      </code>
                                      <button
                                        onClick={() => copyToClipboard(agent.userId, `user-${agent.userId}`)}
                                        className="text-gray-400 hover:text-primary transition-all duration-200 cursor-pointer p-2 rounded-lg hover:bg-gray-100 hover:scale-110"
                                        title="Copy User ID"
                                      >
                                        <Copy className="h-4 w-4" />
                                      </button>
                                      {copiedId === `user-${agent.userId}` && (
                                        <span className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">Copied!</span>
                                      )}
                                    </div>
                                  </div>
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
        </div>
      </div>
    </DashboardLayout>
  );
}
