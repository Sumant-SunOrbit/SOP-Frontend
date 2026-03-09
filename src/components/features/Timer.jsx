import React from 'react';

const TimerBlock = ({ value, label }) => (
  <div className="flex flex-col items-center gap-2">
    {/* Uses --secondary (Yellow) for the background */}
    <div className="w-14 h-14 bg-[var(--secondary)] rounded-xl flex items-center justify-center shadow-sm">
      <span className="text-xl font-bold text-[var(--text-on-secondary)]">{value.toString().padStart(2, '0')}</span>
    </div>
    <span className="text-xs font-medium text-[var(--text-muted)]">{label}</span>
  </div>
);

const Timer = ({ hours = 0, minutes = 28, seconds = 41 }) => {
  return (
    <div className="bg-[var(--glass-surface)] p-6 rounded-[24px] shadow-sm border border-[var(--sys-glass-border)] transition-colors">
      <p className="text-sm font-medium text-[var(--text-muted)] mb-4">Remaining Time</p>
      <div className="flex justify-between px-2">
        <TimerBlock value={hours} label="Hrs" />
        <TimerBlock value={minutes} label="Min" />
        <TimerBlock value={seconds} label="Sec" />
      </div>
    </div>
  );
};

export default Timer;