import React from 'react';
import { cn } from '../../../utils/cn';

const InputField = ({ label, icon: Icon, error, className, ...props }) => {
  // Enforce max date for date inputs to prevent >4 digit years
  const inputProps = { ...props };
  if (inputProps.type === 'date' && !inputProps.max) {
    inputProps.max = '9999-12-31';
  } else if (inputProps.type === 'datetime-local' && !inputProps.max) {
    inputProps.max = '9999-12-31T23:59';
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-[var(--text-muted)] ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          className={cn(
            "w-full bg-[var(--background)]/50 text-[var(--text)] rounded-2xl", 
            "border border-[var(--sys-glass-border)]", 
            "px-4 py-3.5 outline-none transition-all duration-300",
            "placeholder:text-[var(--text-muted)] font-medium",
            "focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10",
            Icon && "pl-12",
            error && "border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/10"
          )}
          {...inputProps}
        />
      </div>
      {error && <p className="text-xs text-[var(--danger)] ml-1 mt-1">{error}</p>}
    </div>
  );
};

export default InputField;