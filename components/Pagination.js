'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className 
}) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
          currentPage === 1
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-md"
        )}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`dots-${index}`}
                className="px-3 py-2 text-sm font-medium text-gray-500"
              >
                ...
              </span>
            );
          }

          const isCurrentPage = page === currentPage;
          
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 min-w-[40px]",
                isCurrentPage
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105"
                  : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-md hover:scale-105"
              )}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
          currentPage === totalPages
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-md"
        )}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  );
}
