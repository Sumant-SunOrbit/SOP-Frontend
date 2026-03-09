import React from 'react';
import Card from '../ui/Card';
import { cn } from '../../utils/cn';

const StatCard = ({ title, value, icon: Icon, trend, trendUp }) => {
  return (
    <Card className="p-6 flex flex-col justify-between h-full hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-[var(--text-muted)]">{title}</p>
          <h3 className="text-3xl font-bold text-[var(--text)] mt-2 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className="p-3 bg-[var(--primary)]/10 rounded-xl border border-[var(--primary)]/20">
            <Icon className="w-6 h-6 text-[var(--primary)]" />
          </div>
        )}
      </div>
      
      {/* Trend Graph */}
      {trend && (
        <div className="mt-4 flex items-end gap-2 h-8">
          {[40, 70, 45, 90, 60, 80].map((h, i) => (
            <div 
              key={i} 
              className={cn(
                "w-1.5 rounded-full transition-all duration-500",
                trendUp ? "bg-[var(--text)]" : "bg-[var(--secondary)]"
              )}
              style={{ height: `${h}%`, opacity: 0.2 + (i * 0.15) }}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default StatCard;