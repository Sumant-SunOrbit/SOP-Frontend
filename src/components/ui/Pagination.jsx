import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Logic to show limited page numbers (e.g., 1 ... 4 5 6 ... 10)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button 
        size="xs" 
        variant="secondary" 
        disabled={currentPage === 1} 
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} />
      </Button>

      {getPageNumbers().map((page, idx) => (
        <button
          key={idx}
          disabled={page === '...'}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all
            ${page === currentPage 
              ? 'bg-[var(--primary)] text-white shadow-md' 
              : page === '...' 
                ? 'text-[var(--text-muted)] cursor-default'
                : 'text-[var(--text)] hover:bg-[var(--glass-border)]'
            }`}
        >
          {page}
        </button>
      ))}

      <Button 
        size="xs" 
        variant="secondary" 
        disabled={currentPage === totalPages} 
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};

export default Pagination;