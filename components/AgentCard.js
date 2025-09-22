'use client';

import { useState } from 'react';
import { 
  AlertTriangle, 
  Play, 
  Pause, 
  Clock, 
  Calendar, 
  CheckCircle, 
  Copy, 
  User, 
  Settings, 
  Info 
} from 'lucide-react';
import { cn, formatRelativeTime, getFrequencyColor } from '@/lib/utils';

export default function AgentCard({ agent, onViewDetails, copiedId, onCopyId }) {
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

  const getStatusIconColor = (agent) => {
    if (agent.isBehindSchedule) return 'text-red-400';
    if (agent.processingCount > 0) return 'text-blue-400';
    if (agent.schedule.active) return 'text-green-400';
    return 'text-gray-400';
  };

  const StatusIcon = getStatusIcon(agent);
  const statusText = getStatusText(agent);
  const statusIconColor = getStatusIconColor(agent);

  return (
    <div
      className="group bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => onViewDetails(agent.agentId)}
    >
      {/* Card Header */}
      <div className="bg-primary p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{agent.agentName}</h3>
            <p className="text-blue-100 text-sm">{agent.agentRole}</p>
          </div>
          <div className={cn(
            "flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm",
            statusText === 'Active' ? 'text-green-200' :
            statusText === 'Processing' ? 'text-yellow-200' :
            statusText === 'Behind Schedule' ? 'text-red-200' :
            'text-gray-200'
          )}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusText}
          </div>
        </div>
        
        {/* User ID and Agent ID with Copy */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-blue-200" />
            <span className="text-sm text-blue-100">User: {agent.userId}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyId(agent.userId, `user-${agent.agentId}`);
              }}
              className="text-blue-200 hover:text-white transition-colors"
              title="Copy User ID"
            >
              {copiedId === `user-${agent.agentId}` ? (
                <CheckCircle className="h-3 w-3 text-green-300" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-blue-200" />
            <span className="text-sm text-blue-100">ID: {agent._id}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyId(agent._id, `mongo-${agent._id}`);
              }}
              className="text-blue-200 hover:text-white transition-colors"
              title="Copy MongoDB ID"
            >
              {copiedId === `mongo-${agent._id}` ? (
                <CheckCircle className="h-3 w-3 text-green-300" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xl font-bold text-blue-600">{agent.totalGenerations || 0}</div>
            <div className="text-xs text-blue-800 font-medium">Total Videos</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xl font-bold text-green-600">{agent.completedCount || 0}</div>
            <div className="text-xs text-green-800 font-medium">Completed</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-xl font-bold text-yellow-600">{agent.processingCount || 0}</div>
            <div className="text-xs text-yellow-800 font-medium">Processing</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-xl font-bold text-red-600">{agent.failedCount || 0}</div>
            <div className="text-xs text-red-800 font-medium">Failed</div>
          </div>
        </div>

        {/* Key Info */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Plan</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {agent.frequency?.plan || 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Interval</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {agent.frequency?.intervalDays ? `${agent.frequency.intervalDays} days` : 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Next Generation</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {formatRelativeTime(agent.schedule?.nextGenerationDate)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-gray-100">
          <button className="w-full flex items-center justify-center px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg cursor-pointer">
            <Info className="h-4 w-4 mr-2" />
            View Full Details
          </button>
        </div>
      </div>
    </div>
  );
}
