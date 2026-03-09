import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  isLoading, 
  icon: Icon,
  ...props 
}) => {
  
  const variants = {
    // 1. Primary: The "Gold Pill" from the image
    // Uses gradient image, custom shadow, and dark text for contrast
    primary: "bg-[image:var(--sys-pill-gradient)] text-black font-bold tracking-wide hover:brightness-105 shadow-[var(--sys-pill-shadow)] border-none active:translate-y-[1px]",
    
    // 2. Secondary: Flat Gold/Yellow
    secondary: "bg-[var(--sys-secondary)]/20 text-[var(--sys-text-on-secondary)] hover:bg-[var(--sys-secondary)]/30 border border-[var(--sys-secondary)]/30",

    // 3. Outline: Transparent with Gold Border
    outline: "bg-transparent text-[var(--sys-text)] border border-[var(--sys-glass-border)] hover:bg-[var(--sys-secondary)]/5 shadow-sm",
    
    // 4. Ghost
    ghost: "bg-transparent text-[var(--sys-text-muted)] hover:text-[var(--sys-primary)] hover:bg-[var(--sys-primary)]/5",
    
    // 5. Danger
    danger: "bg-[var(--sys-danger)]/10 text-[var(--sys-danger)] hover:bg-[var(--sys-danger)]/20 border border-transparent",
  };

  const sizes = {
    // UPDATED: 'rounded-full' creates the Capsule/Pill shape
    sm: "px-4 py-1.5 text-xs font-semibold rounded-full",
    md: "px-6 py-2.5 text-sm font-bold rounded-full",
    lg: "px-8 py-3.5 text-base font-bold rounded-full"
  };

  return (
    <button
      disabled={isLoading}
      className={cn(
        "flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!isLoading && Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

export default Button;