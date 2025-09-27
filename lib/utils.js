import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short'
  });
}

export function formatRelativeTime(date) {
  if (!date) return 'N/A';
  
  // Use UTC time consistently to match database format
  const nowUTC = new Date();
  const targetDateUTC = new Date(date);
  const diffInSeconds = Math.floor((targetDateUTC.getTime() - nowUTC.getTime()) / 1000);
  
  // Future dates (positive difference)
  if (diffInSeconds > 0) {
    if (diffInSeconds < 60) return 'In a moment';
    if (diffInSeconds < 3600) return `In ${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `In ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `In ${Math.floor(diffInSeconds / 86400)}d`;
    return formatDate(date);
  }
  
  // Past dates (negative difference)
  const absDiff = Math.abs(diffInSeconds);
  if (absDiff < 60) return 'Just now';
  if (absDiff < 3600) return `${Math.floor(absDiff / 60)}m ago`;
  if (absDiff < 86400) return `${Math.floor(absDiff / 3600)}h ago`;
  if (absDiff < 2592000) return `${Math.floor(absDiff / 86400)}d ago`;
  
  return formatDate(date);
}

export function getStatusColor(status) {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getFrequencyColor(intervalDays) {
  switch (intervalDays) {
    case 1:
      return 'bg-green-100 text-green-800';
    case 2:
      return 'bg-blue-100 text-blue-800';
    case 4:
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
