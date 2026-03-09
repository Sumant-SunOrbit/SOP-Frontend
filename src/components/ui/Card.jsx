import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ children, className, hoverEffect = false }) => {
  return (
    <div 
      className={cn(
        "bg-[var(--glass-surface)] rounded-[24px]",
        "border border-[var(--sys-glass-border)]",
        "shadow-sm backdrop-blur-lg",
        "overflow-hidden transition-all duration-300",
        hoverEffect && "hover:shadow-md hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;