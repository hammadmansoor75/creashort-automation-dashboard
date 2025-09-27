'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import AgentCard from '@/components/AgentCard';
import AgentFilters from '@/components/AgentFilters';
import AgentDetailsModal from '@/components/AgentDetailsModal';
import VideoStreamModal from '@/components/VideoStreamModal';
import Pagination from '@/components/Pagination';
import { XCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actualSearchTerm, setActualSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  
  // Modal states
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentDetails, setAgentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchAgents();
  }, [actualSearchTerm, statusFilter, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: actualSearchTerm,
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

  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    setActualSearchTerm(searchTerm);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const fetchAgentDetails = async (agentId) => {
    try {
      setLoadingDetails(true);
      setAgentDetails(null);
      setSelectedAgent(agentId);
      
      const response = await fetch(`/api/dashboard/agents/${agentId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agent details: ${response.status}`);
      }
      
      const data = await response.json();
      setAgentDetails(data);
    } catch (err) {
      console.error('Error fetching agent details:', err);
      setAgentDetails(null);
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

  const handleViewDetails = (agentId) => {
    fetchAgentDetails(agentId);
  };


  const handleCloseModal = () => {
    setSelectedAgent(null);
    setAgentDetails(null);
  };

  const handleViewVideo = (video) => {
    setSelectedVideo(video);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
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
      <PageHeader 
        title="AI Agents"
        subtitle="Manage and monitor your AI video generation agents"
      >
        <button
          onClick={fetchAgents}
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

        {/* Filters */}
        <AgentFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearchInput}
          onSearchSubmit={handleSearchSubmit}
          onKeyPress={handleKeyPress}
          statusFilter={statusFilter}
          onStatusFilter={handleStatusFilter}
        />

        {/* Agents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentCard
              key={agent.agentId}
              agent={agent}
              onViewDetails={handleViewDetails}
              copiedId={copiedId}
              onCopyId={copyToClipboard}
            />
          ))}
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

        {/* Agent Details Modal */}
        <AgentDetailsModal
          isOpen={!!selectedAgent}
          onClose={handleCloseModal}
          agentDetails={agentDetails}
          loadingDetails={loadingDetails}
          onCopyId={copyToClipboard}
          copiedId={copiedId}
          onViewVideo={handleViewVideo}
        />

        {/* Video Streaming Modal */}
        <VideoStreamModal
          video={selectedVideo}
          onClose={handleCloseVideo}
        />

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}