'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function PageHeader({ 
  title, 
  subtitle, 
  children, // For action buttons like refresh, settings, etc.
  showUTC = true 
}) {
  const [currentUTCTime, setCurrentUTCTime] = useState('');

  useEffect(() => {
    if (!showUTC) return;
    
    const updateTime = () => {
      const now = new Date();
      const utcTime = now.toLocaleString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setCurrentUTCTime(utcTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [showUTC]);

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* UTC Time Display */}
        {showUTC && (
          <div className="flex items-center justify-end py-3 border-b border-gray-100">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Globe className="h-4 w-4" />
              <span className="font-medium">Current UTC:</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-900">
                {currentUTCTime || 'Loading...'}
              </span>
            </div>
          </div>
        )}
        
        {/* Page Header Content */}
        <div className="py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title and Subtitle */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">
                  {subtitle}
                </p>
              )}
            </div>
            
            {/* Action Buttons */}
            {children && (
              <div className="flex items-center space-x-3">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
