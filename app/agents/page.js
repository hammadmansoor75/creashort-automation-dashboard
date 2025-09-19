'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Search, 
  Filter, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Calendar,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Settings,
  Video,
  FileText,
  User,
  Zap,
  Globe,
  Palette,
  Mic,
  Copy,
  ExternalLink,
  Download,
  Eye
} from 'lucide-react';
import { cn, formatDate, formatRelativeTime, getStatusColor, getFrequencyColor } from '@/lib/utils';
import Pagination from '@/components/Pagination';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [agentDetails, setAgentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchAgents();
  }, [searchTerm, statusFilter, currentPage]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        page: currentPage.toString(),
        limit: '10'
      });
      
      const response = await fetch(`/api/dashboard/agents?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      const data = await response.json();
      setAgents(data.agents);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const fetchAgentDetails = async (agentId) => {
    if (expandedAgent === agentId && agentDetails) {
      // Already loaded, just toggle
      setExpandedAgent(null);
      setAgentDetails(null);
      return;
    }

    try {
      setLoadingDetails(true);
      const response = await fetch(`/api/dashboard/agents/${agentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch agent details');
      }
      const data = await response.json();
      setAgentDetails(data);
      setExpandedAgent(agentId);
    } catch (err) {
      console.error('Error fetching agent details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(type);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusIcon = (agent) => {
    if (agent.isBehindSchedule) return AlertTriangle;
    if (agent.processingCount > 0) return Clock;
    if (agent.schedule.active) return Play;
    return Pause;
  };

  const getStatusText = (agent) => {
    if (agent.isBehindSchedule) return 'Behind Schedule';
    if (agent.processingCount > 0) return 'Processing';
    if (agent.schedule.active) return 'Active';
    return 'Paused';
  };

  const getStatusColorClass = (agent) => {
    if (agent.isBehindSchedule) return 'text-red-600';
    if (agent.processingCount > 0) return 'text-blue-600';
    if (agent.schedule.active) return 'text-green-600';
    return 'text-gray-600';
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading agents</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={fetchAgents}
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
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary">AI Agents</h1>
              <p className="mt-2 text-gray-600">
                Manage and monitor your AI video generation agents
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:scale-105">
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh
              </button>
              <button className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-blue-700 transition-all duration-200 hover:scale-105">
                <Zap className="h-5 w-5 mr-2" />
                Add New Agent
              </button>
              <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:scale-105">
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by agent name, role, or user ID (e.g., user_001)..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-12 pr-4 py-4 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleStatusFilter('all')}
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
                onClick={() => handleStatusFilter('active')}
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
                onClick={() => handleStatusFilter('behind-schedule')}
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
                onClick={() => handleStatusFilter('processing')}
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
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {agents.map((agent) => {
            const StatusIcon = getStatusIcon(agent);
            const isExpanded = expandedAgent === agent.agentId;
            
            return (
              <div
                key={agent.agentId}
                className="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl hover-lift overflow-hidden"
              >
                {/* Agent Card Header */}
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => fetchAgentDetails(agent.agentId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center",
                          agent.isBehindSchedule ? "bg-red-100" :
                          agent.processingCount > 0 ? "bg-blue-100" :
                          agent.schedule.active ? "bg-green-100" : "bg-gray-100"
                        )}>
                          <StatusIcon className={cn(
                            "h-6 w-6",
                            agent.isBehindSchedule ? "text-red-600" :
                            agent.processingCount > 0 ? "text-blue-600" :
                            agent.schedule.active ? "text-green-600" : "text-gray-600"
                          )} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {agent.agentName}
                          </h3>
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            getFrequencyColor(agent.frequency.intervalDays)
                          )}>
                            Every {agent.frequency.intervalDays}d
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {agent.agentRole}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-gray-500">
                            User: {agent.userId}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(agent.userId, `user-${agent.agentId}`);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy User ID"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500">
                            Agent ID: {agent.agentId}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(agent.agentId, `agent-${agent.agentId}`);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy Agent ID"
                          >
                            {copiedId === `agent-${agent.agentId}` ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {loadingDetails && expandedAgent === agent.agentId ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                      ) : (
                        isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )
                      )}
                    </div>
                  </div>

                  {/* Status and Metrics */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{agent.publishedCount}</span>
                        </div>
                        <p className="text-xs text-gray-500">Published</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{agent.processingCount}</span>
                        </div>
                        <p className="text-xs text-gray-500">Processing</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="font-medium">{agent.failedCount}</span>
                        </div>
                        <p className="text-xs text-gray-500">Failed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-medium",
                        agent.isBehindSchedule ? "text-red-600" :
                        agent.processingCount > 0 ? "text-blue-600" :
                        agent.schedule.active ? "text-green-600" : "text-gray-600"
                      )}>
                        {getStatusText(agent)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Next: {formatDate(agent.schedule.nextGenerationDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && agentDetails && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    <div className="p-6 space-y-6">
                      {/* Agent Configuration */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          Configuration & IDs
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Mic className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">Voice ID:</span>
                              <span className="text-sm font-medium text-gray-900">{agentDetails.voiceId}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Palette className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">Font:</span>
                              <span className="text-sm font-medium text-gray-900">{agentDetails.fontStyle}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">Language:</span>
                              <span className="text-sm font-medium text-gray-900">{agentDetails.language}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">MongoDB ID:</span>
                              <span className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                {agentDetails._id}
                              </span>
                              <button
                                onClick={() => copyToClipboard(agentDetails._id, `mongo-${agentDetails.agentId}`)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title="Copy MongoDB Object ID"
                              >
                                {copiedId === `mongo-${agentDetails.agentId}` ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">Plan:</span>
                              <span className="text-sm font-medium text-gray-900 capitalize">{agentDetails.frequency.plan}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">Monthly Videos:</span>
                              <span className="text-sm font-medium text-gray-900">{agentDetails.frequency.monthlyVideos}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Zap className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">Credits:</span>
                              <span className="text-sm font-medium text-gray-900">{agentDetails.frequency.credits}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Created:</span>
                              <span className="text-sm font-medium text-gray-900">{formatDate(agentDetails.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Last Generation */}
                      {agentDetails.lastGeneration && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            <Video className="h-4 w-4 mr-2" />
                            Last Generation
                          </h4>
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Date:</span>
                              <span className="text-sm font-medium text-gray-900">{formatDate(agentDetails.lastGeneration.date)}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Status:</span>
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                agentDetails.lastGeneration.status === 'published' ? "bg-green-100 text-green-800" :
                                agentDetails.lastGeneration.status === 'processing' ? "bg-blue-100 text-blue-800" :
                                agentDetails.lastGeneration.status === 'failed' ? "bg-red-100 text-red-800" :
                                "bg-yellow-100 text-yellow-800"
                              )}>
                                {agentDetails.lastGeneration.status}
                              </span>
                            </div>
                            {agentDetails.lastGeneration.videoUrl && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Video:</span>
                                <a 
                                  href={agentDetails.lastGeneration.videoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                                >
                                  View Video →
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* All Generations */}
                      {agentDetails.recentGenerations && agentDetails.recentGenerations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            <Video className="h-4 w-4 mr-2" />
                            All Video Generations ({agentDetails.recentGenerations.length})
                          </h4>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {agentDetails.recentGenerations.map((gen, index) => (
                              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <p className="text-sm font-medium text-gray-900">
                                        {formatDate(gen.date)}
                                      </p>
                                      <span className={cn(
                                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                        gen.status === 'published' ? "bg-green-100 text-green-800" :
                                        gen.status === 'processing' ? "bg-blue-100 text-blue-800" :
                                        gen.status === 'failed' ? "bg-red-100 text-red-800" :
                                        "bg-yellow-100 text-yellow-800"
                                      )}>
                                        {gen.status}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                                      {gen.scriptId && (
                                        <div className="flex items-center space-x-1">
                                          <FileText className="h-3 w-3" />
                                          <span>Script: {gen.scriptId}</span>
                                        </div>
                                      )}
                                      {gen.videoId && (
                                        <div className="flex items-center space-x-1">
                                          <Video className="h-3 w-3" />
                                          <span>Video: {gen.videoId}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center space-x-1">
                                        <span>Generation ID:</span>
                                        <span className="font-mono bg-gray-100 px-1 rounded">
                                          {gen.generationId.toString().slice(-8)}
                                        </span>
                                        <button
                                          onClick={() => copyToClipboard(gen.generationId.toString(), `gen-${index}`)}
                                          className="text-gray-400 hover:text-gray-600 transition-colors"
                                          title="Copy Generation ID"
                                        >
                                          {copiedId === `gen-${index}` ? (
                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                    {gen.error && (
                                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                                        <strong>Error:</strong> {gen.error}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    {gen.videoUrl && (
                                      <button
                                        onClick={() => setSelectedVideo({
                                          url: gen.videoUrl,
                                          title: `${agentDetails.agentName} - ${formatDate(gen.date)}`,
                                          generationId: gen.generationId.toString().slice(-8)
                                        })}
                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                                        title="Stream Video"
                                      >
                                        <Eye className="h-3 w-3 mr-1" />
                                        Stream
                                      </button>
                                    )}
                                    {gen.videoUrl && (
                                      <a
                                        href={gen.videoUrl}
                                        download
                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                                        title="Download Video"
                                      >
                                        <Download className="h-3 w-3 mr-1" />
                                        Download
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
                {' '}results
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.pages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}

        {/* Video Streaming Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setSelectedVideo(null)}
              ></div>

              {/* Modal panel */}
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedVideo.title}
                    </h3>
                    <button
                      onClick={() => setSelectedVideo(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="bg-black rounded-lg overflow-hidden">
                    <video
                      controls
                      autoPlay
                      className="w-full h-auto max-h-96"
                      onError={(e) => {
                        console.error('Video load error:', e);
                        alert('Failed to load video. Please try downloading instead.');
                      }}
                    >
                      <source src={selectedVideo.url} type="video/mp4" />
                      <source src={selectedVideo.url} type="video/webm" />
                      <source src={selectedVideo.url} type="video/ogg" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Generation ID: {selectedVideo.generationId}
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={selectedVideo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Open in New Tab
                      </a>
                      <a
                        href={selectedVideo.url}
                        download
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
