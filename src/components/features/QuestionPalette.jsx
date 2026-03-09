import React from 'react';
import { cn } from '../../utils/cn';

const QuestionPalette = ({ totalQuestions = 20, currentQuestion, attempted = [], marked = [] }) => {
  return (
    <div className="bg-[var(--glass-surface)] p-6 rounded-[24px] shadow-sm border border-[var(--sys-glass-border)] mt-6 transition-colors">
      <p className="text-sm font-medium text-[var(--text-muted)] mb-4">Question Palette</p>
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => {
          
          // Default State
          let statusClasses = "bg-transparent border border-[var(--sys-glass-border)] text-[var(--text-muted)]"; 
          
          // Active/Current Question (Blue/Accent)
          if (num === currentQuestion) {
             statusClasses = "bg-[var(--text)] text-[var(--background)] border-[var(--text)] font-bold shadow-md";
          }
          // Attempted (Primary - Green)
          else if (attempted.includes(num)) {
             statusClasses = "bg-[var(--primary)] text-[var(--text-on-color)] border-[var(--primary)]";
          }
          // Marked (Secondary - Yellow)
          else if (marked.includes(num)) {
             statusClasses = "bg-[var(--secondary)] text-[var(--text-on-secondary)] border-[var(--secondary)]";
          }

          return (
            <button
              key={num}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all hover:scale-105",
                statusClasses
              )}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );  
};

export default QuestionPalette;