'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  RefreshCw, 
  XCircle,
  User,
  CheckCircle,
  Clock,
  Globe,
  FileText,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UserAgentsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actualSearchTerm, setActualSearchTerm] = useState('');
  const [customInstructionsSearch, setCustomInstructionsSearch] = useState('');
  const [actualCustomInstructionsSearch, setActualCustomInstructionsSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);

  useEffect(() => {
    fetchUsersAgents();
  }, [actualSearchTerm, actualCustomInstructionsSearch, currentPage, showDuplicatesOnly]);

  const fetchUsersAgents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (actualSearchTerm) {
        params.append('userId', actualSearchTerm);
      }
      
      if (actualCustomInstructionsSearch) {
        params.append('customInstructions', actualCustomInstructionsSearch);
      }
      
      if (showDuplicatesOnly) {
        params.append('duplicatesOnly', 'true');
      }
      
      const response = await fetch(`/api/dashboard/users-agents?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users and agents');
      }
      const data = await response.json();
      setUsers(data.users);
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

  const handleCustomInstructionsInput = (e) => {
    setCustomInstructionsSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    setActualSearchTerm(searchTerm);
    setActualCustomInstructionsSearch(customInstructionsSearch);
    setCurrentPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const toggleUserExpansion = (userId) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  if (loading && users.length === 0) {
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading users and agents</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={fetchUsersAgents}
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
        title="Users & Agents"
        subtitle="View all users and their associated agents"
      >
        <button
          onClick={fetchUsersAgents}
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
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by User ID..."
                      value={searchTerm}
                      onChange={handleSearchInput}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-black"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by Custom Instructions..."
                      value={customInstructionsSearch}
                      onChange={handleCustomInstructionsInput}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-black"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleSearchSubmit}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Search
                  </button>
                  <button
                    onClick={() => {
                      setShowDuplicatesOnly(!showDuplicatesOnly);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "px-6 py-3 rounded-lg transition-colors font-medium flex items-center justify-center",
                      showDuplicatesOnly
                        ? "bg-orange-600 text-white hover:bg-orange-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    )}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {showDuplicatesOnly ? 'Show All' : 'Show Duplicates Only'}
                  </button>
                  {(actualSearchTerm || actualCustomInstructionsSearch) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setActualSearchTerm('');
                        setCustomInstructionsSearch('');
                        setActualCustomInstructionsSearch('');
                        setCurrentPage(1);
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Agents
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Videos
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed Videos
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          {showDuplicatesOnly 
                            ? 'No users with duplicates found.' 
                            : (actualSearchTerm || actualCustomInstructionsSearch ? 'No users found matching your search.' : 'No users found.')}
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => {
                        const isExpanded = expandedUsers.has(user.userId);
                        const totalVideos = user.agents.reduce((sum, agent) => sum + (agent.totalVideos || 0), 0);
                        const totalCompleted = user.agents.reduce((sum, agent) => sum + (agent.completedVideos || 0), 0);

                        return (
                          <>
                            <tr 
                              key={user.userId}
                              className="hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => toggleUserExpansion(user.userId)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-gray-400" />
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <User className="h-5 w-5 text-gray-400 mr-2" />
                                  <span className="text-sm font-medium text-gray-900 font-mono">
                                    {user.userId}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900 font-semibold">
                                  {user.agents.length}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">
                                  {totalVideos}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900 font-semibold">
                                  {totalCompleted}
                                </span>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan="5" className="px-6 py-4 bg-gray-50">
                                  <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                      Agents for {user.userId}
                                    </h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                      {user.agents.map((agent) => (
                                        <div
                                          key={agent.agentId}
                                          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                          <div className="space-y-4">
                                            {/* Agent Name */}
                                            <div className="flex items-start justify-between">
                                              <div>
                                                <h4 className="text-lg font-bold text-gray-900">
                                                  {agent.agentName}
                                                </h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                  {agent.agentRole}
                                                </p>
                                              </div>
                                              <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-semibold",
                                                agent.schedule?.active
                                                  ? "bg-green-100 text-green-800"
                                                  : "bg-red-100 text-red-800"
                                              )}>
                                                {agent.schedule?.active ? 'Active' : 'Paused'}
                                              </span>
                                            </div>

                                            {/* Agent Details Grid */}
                                            <div className="grid grid-cols-2 gap-3">
                                              {/* Frequency */}
                                              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                                <div className="flex items-center space-x-2 mb-1">
                                                  <Zap className="h-4 w-4 text-blue-600" />
                                                  <span className="text-xs font-semibold text-blue-800">Frequency</span>
                                                </div>
                                                <p className="text-sm font-bold text-blue-900 capitalize">
                                                  {agent.frequency?.plan || 'N/A'}
                                                </p>
                                                <p className="text-xs text-blue-700">
                                                  {agent.frequency?.intervalDays || 0} days interval
                                                </p>
                                              </div>

                                              {/* Completed Videos */}
                                              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                                <div className="flex items-center space-x-2 mb-1">
                                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                                  <span className="text-xs font-semibold text-green-800">Completed</span>
                                                </div>
                                                <p className="text-sm font-bold text-green-900">
                                                  {agent.completedVideos || 0}
                                                </p>
                                                <p className="text-xs text-green-700">
                                                  of {agent.totalVideos || 0} total
                                                </p>
                                              </div>

                                              {/* Remaining Videos */}
                                              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                                                <div className="flex items-center space-x-2 mb-1">
                                                  <Clock className="h-4 w-4 text-yellow-600" />
                                                  <span className="text-xs font-semibold text-yellow-800">Remaining</span>
                                                </div>
                                                <p className="text-sm font-bold text-yellow-900">
                                                  {agent.remainingVideos || 0}
                                                </p>
                                                <p className="text-xs text-yellow-700">
                                                  videos left
                                                </p>
                                              </div>

                                              {/* Language */}
                                              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                                <div className="flex items-center space-x-2 mb-1">
                                                  <Globe className="h-4 w-4 text-purple-600" />
                                                  <span className="text-xs font-semibold text-purple-800">Language</span>
                                                </div>
                                                <p className="text-sm font-bold text-purple-900">
                                                  {agent.language || 'N/A'}
                                                </p>
                                              </div>
                                            </div>

                                            {/* Custom Instructions */}
                                            {agent.customInstructions && (
                                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-center space-x-2 mb-2">
                                                  <FileText className="h-4 w-4 text-gray-600" />
                                                  <span className="text-xs font-semibold text-gray-700">
                                                    Custom Instructions
                                                  </span>
                                                </div>
                                                <p className="text-sm text-gray-700 line-clamp-3">
                                                  {agent.customInstructions}
                                                </p>
                                              </div>
                                            )}

                                            {/* Additional Info */}
                                            <div className="pt-3 border-t border-gray-200">
                                              <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>Agent ID: <code className="bg-gray-100 px-1 rounded">{agent.agentId}</code></span>
                                                <span>Monthly: {agent.frequency?.monthlyVideos || 0}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing{' '}
                    <span className="font-semibold text-gray-900">{(currentPage - 1) * 20 + 1}</span>
                    {' '}to{' '}
                    <span className="font-semibold text-gray-900">
                      {Math.min(currentPage * 20, pagination.total)}
                    </span>
                    {' '}of{' '}
                    <span className="font-semibold text-gray-900">{pagination.total}</span>
                    {' '}users
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

