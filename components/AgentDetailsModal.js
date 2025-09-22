'use client';

import { 
  X, 
  Settings, 
  Activity, 
  Video, 
  CheckCircle, 
  Copy, 
  Eye, 
  Download,
  User,
  Calendar,
  Clock,
  Globe,
  Mic,
  Palette,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { cn, formatDate, getFrequencyColor } from '@/lib/utils';

export default function AgentDetailsModal({ 
  isOpen, 
  onClose, 
  agentDetails, 
  loadingDetails, 
  onCopyId, 
  copiedId, 
  onViewVideo 
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
          
          {loadingDetails ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
              <div>
                <h2 className="text-2xl font-bold">Loading Agent Details...</h2>
                <p className="text-blue-100">Please wait while we fetch the information</p>
              </div>
            </div>
          ) : (
            <div className="pr-12">
              <div className="flex items-center space-x-4 mb-2">
                <div className="bg-white/20 rounded-full p-3">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{agentDetails?.agentName || 'Agent Details'}</h2>
                  <p className="text-xl text-blue-100">{agentDetails?.agentRole || 'Loading...'}</p>
                </div>
              </div>
              
              {agentDetails && (
                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      agentDetails.schedule?.active ? "bg-green-400" : "bg-red-400"
                    )}></div>
                    <span className="text-sm font-medium">
                      {agentDetails.schedule?.active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-100">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Next: {formatDate(agentDetails.schedule?.nextGenerationDate)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {loadingDetails ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Fetching agent details...</p>
              </div>
            </div>
          ) : agentDetails ? (
            <div className="p-8 space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <Video className="h-8 w-8 text-blue-600" />
                    <span className="text-3xl font-bold text-blue-700">{agentDetails.totalGenerations || 0}</span>
                  </div>
                  <p className="text-blue-800 font-semibold">Total Videos</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <span className="text-3xl font-bold text-green-700">{agentDetails.completedCount || 0}</span>
                  </div>
                  <p className="text-green-800 font-semibold">Completed</p>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <span className="text-3xl font-bold text-red-700">{agentDetails.failedGenerations || 0}</span>
                  </div>
                  <p className="text-red-800 font-semibold">Failed</p>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <span className="text-3xl font-bold text-yellow-700">{agentDetails.processingCount || 0}</span>
                  </div>
                  <p className="text-yellow-800 font-semibold">Processing</p>
                </div>
              </div>

              {/* Configuration & Schedule */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Settings className="h-6 w-6 mr-3 text-blue-600" />
                    Configuration
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">User ID</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">{agentDetails.userId}</code>
                        <button
                          onClick={() => onCopyId(agentDetails.userId, `user-${agentDetails.agentId}`)}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                        >
                          {copiedId === `user-${agentDetails.agentId}` ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Zap className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Agent ID</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">{agentDetails.agentId}</code>
                        <button
                          onClick={() => onCopyId(agentDetails.agentId, `agent-${agentDetails.agentId}`)}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                        >
                          {copiedId === `agent-${agentDetails.agentId}` ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Settings className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">MongoDB ID</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">{agentDetails._id}</code>
                        <button
                          onClick={() => onCopyId(agentDetails._id, `mongo-${agentDetails._id}`)}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                        >
                          {copiedId === `mongo-${agentDetails._id}` ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Mic className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Voice ID</span>
                      </div>
                      <span className="text-gray-900 font-medium">{agentDetails.voiceId}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Palette className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Font Style</span>
                      </div>
                      <span className="text-gray-900 font-medium">{agentDetails.fontStyle}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Language</span>
                      </div>
                      <span className="text-gray-900 font-medium">{agentDetails.language}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Palette className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Text Color</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded border border-gray-300" 
                          style={{ backgroundColor: agentDetails.textColor }}
                        ></div>
                        <span className="text-gray-900 font-mono text-sm">{agentDetails.textColor}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Social Media</span>
                      </div>
                      <span className="text-gray-900 font-medium capitalize">{agentDetails.selectedSocialMediaAccount}</span>
                    </div>
                  </div>
                </div>

                {/* Schedule & Status */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Activity className="h-6 w-6 mr-3 text-purple-600" />
                    Schedule & Status
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Status</span>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm font-semibold",
                        agentDetails.schedule?.active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      )}>
                        {agentDetails.schedule?.active ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Plan</span>
                      </div>
                      <span className="text-gray-900 font-medium capitalize">
                        {agentDetails.frequency?.plan || 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Interval Days</span>
                      </div>
                      <span className="text-gray-900 font-medium">
                        {agentDetails.frequency?.intervalDays || 'N/A'} days
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Video className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Monthly Videos</span>
                      </div>
                      <span className="text-gray-900 font-medium">
                        {agentDetails.frequency?.monthlyVideos || 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Zap className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Credits</span>
                      </div>
                      <span className="text-gray-900 font-medium">
                        {agentDetails.frequency?.credits || 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Next Generation</span>
                      </div>
                      <span className="text-gray-900 font-medium">
                        {formatDate(agentDetails.schedule?.nextGenerationDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Created</span>
                      </div>
                      <span className="text-gray-900 font-medium">
                        {formatDate(agentDetails.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Last Updated</span>
                      </div>
                      <span className="text-gray-900 font-medium">
                        {formatDate(agentDetails.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prompt Templates */}
              {(agentDetails.promptTemplate || agentDetails.originalPromptTemplate || agentDetails.customInstructions) && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Settings className="h-6 w-6 mr-3 text-indigo-600" />
                    Prompt Templates & Instructions
                  </h3>
                  
                  <div className="space-y-6">
                    {agentDetails.promptTemplate && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Current Prompt Template</h4>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                            {agentDetails.promptTemplate}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {agentDetails.originalPromptTemplate && agentDetails.originalPromptTemplate !== agentDetails.promptTemplate && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Original Prompt Template</h4>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                            {agentDetails.originalPromptTemplate}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {agentDetails.customInstructions && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Custom Instructions</h4>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-700">
                            {agentDetails.customInstructions || 'No custom instructions provided'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Video Generations */}
              {agentDetails.recentGenerations && agentDetails.recentGenerations.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Video className="h-6 w-6 mr-3 text-indigo-600" />
                    Recent Video Generations
                    <span className="ml-2 bg-indigo-100 text-indigo-800 text-sm font-semibold px-2 py-1 rounded-full">
                      {agentDetails.recentGenerations.length}
                    </span>
                  </h3>
                  
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {agentDetails.recentGenerations.map((gen, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {formatDate(gen.date)}
                              </span>
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-semibold",
                              gen.status === 'success' || gen.status === 'completed' ? "bg-green-100 text-green-800" :
                              gen.status === 'failed' ? "bg-red-100 text-red-800" :
                              "bg-yellow-100 text-yellow-800"
                              )}>
                                {gen.status}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                              <div>Generation: <code className="bg-gray-100 px-1 rounded">{gen.generationId}</code></div>
                              <div>
                                {gen.processingStartedAt && gen.completedAt && (
                                  <>Processing Time: {Math.round((new Date(gen.completedAt) - new Date(gen.processingStartedAt)) / 1000)}s</>
                                )}
                              </div>
                            </div>
                            
                            {gen.script && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <h5 className="text-xs font-semibold text-blue-800 mb-1">Script Content</h5>
                                <p className="text-xs text-blue-700 line-clamp-3">
                                  {gen.script.length > 200 ? `${gen.script.substring(0, 200)}...` : gen.script}
                                </p>
                              </div>
                            )}
                            
                            {gen.error && (
                              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start space-x-2">
                                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                  <div className="text-xs text-red-700">
                                    <strong>Error:</strong> {gen.error}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {gen.videoUrl && (
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => onViewVideo({
                                  url: gen.videoUrl,
                                  title: `${agentDetails.agentName} - ${formatDate(gen.date)}`,
                                  generationId: gen.generationId.toString().slice(-8)
                                })}
                                className="inline-flex items-center px-3 py-2 text-xs font-medium text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                title="Stream Video"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Stream
                              </button>
                              <a
                                href={gen.videoUrl}
                                download
                                className="inline-flex items-center px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Download Video"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Agent Details</h3>
                <p className="text-gray-600">There was an error loading the agent information.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}