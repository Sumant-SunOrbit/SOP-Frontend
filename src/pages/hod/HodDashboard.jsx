import React, { useEffect, useState } from 'react';
import { BookOpen, FileQuestion, Users, CheckCircle } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import api from '../../services/api';

const HodDashboard = () => {
  const [stats, setStats] = useState({ courses: 0, exams: 0, users: 0, questions: 0 });

  useEffect(() => {
    // Fetch real stats from the API we built
    api.get('/hod/dashboard').then(({ data }) => setStats(data)).catch(console.error);
  }, []);

  return (
    <div className="p-8 space-y-8 min-h-screen bg-[var(--background)]">
      <div className="flex flex-col">
        <h1 className="text-4xl font-bold text-[var(--text)]">Dashboard</h1>
        <p className="text-[var(--text-muted)] mt-1">Department Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Courses" value={stats.courses} icon={BookOpen} trend />
        <StatCard title="Total Exams" value={stats.exams} icon={FileQuestion} trend trendUp />
        <StatCard title="Active Students" value={stats.users} icon={Users} trend />
        <StatCard title="Question Bank" value={stats.questions} icon={CheckCircle} trend trendUp />
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-[var(--glass-surface)] border border-[var(--sys-glass-border)] rounded-[24px] p-8 h-64 flex items-center justify-center text-[var(--text-muted)]">
        Recent Department Activity Chart (Placeholder)
      </div>
    </div>
  );
};

export default HodDashboard;