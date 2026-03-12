import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, BookOpen, TrendingUp } from 'lucide-react';
import Button from '../../components/ui/Button';

// Widget uses Gold/Green logic
const StatCardWidget = ({ title, count, icon: Icon, colorClass }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[var(--sys-glass-surface)] border border-[var(--sys-glass-border)] rounded-[24px] p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
  >
    <div>
      <p className="text-sm text-[var(--sys-text-muted)] font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-[var(--sys-text)] tracking-tight">{count}</h3>
    </div>
    <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  return (
    <div className="space-y-8 pl-6">
      {/* Page Title & Status */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--sys-text)] tracking-tight">Dashboard</h1>
          <p className="text-[var(--sys-text-muted)]">Overview of system performance</p>
        </div>
        {/* Online Status: Green */}
        {/* <div className="bg-[var(--sys-glass-surface)] border border-[var(--sys-glass-border)] px-4 py-2 rounded-full flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--sys-primary)] animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          <span className="text-sm font-bold text-[var(--sys-primary)]">System Online</span>
        </div> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Green for Departments */}
        <StatCardWidget 
          title="Total Departments" 
          count="8" 
          icon={Building2} 
          colorClass="bg-[var(--sys-primary)]" 
        />
        {/* Gold for HODs */}
        <StatCardWidget 
          title="Active HODs" 
          count="12" 
          icon={Users} 
          colorClass="bg-[var(--sys-secondary)]" 
        />
         {/* Dark Green for Courses */}
        <StatCardWidget 
          title="Total Courses" 
          count="24" 
          icon={BookOpen} 
          colorClass="bg-[var(--sys-accent)]" 
        />
      </div>

      {/* Quick Actions Panel */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--sys-glass-surface)] border border-[var(--sys-glass-border)] rounded-[24px] p-8"
      >
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-[var(--sys-text)]">Quick Actions</h2>
           <TrendingUp className="w-5 h-5 text-[var(--sys-secondary)]" />
        </div>
        <div className="flex flex-wrap gap-4">
           {/* Primary: Gold Gradient Pill */}
           <Button>Add New Department</Button>
           
           {/* Outline: Transparent with Gold Border */}
           <Button variant="outline">Generate Reports</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
