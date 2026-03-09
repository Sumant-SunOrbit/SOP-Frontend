import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, CheckCircle2, Circle, Lightbulb } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [learningData, setLearningData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Status');

  useEffect(() => {
    api.get('/user/my-learning')
      .then(({ data }) => setLearningData(data))
      .catch(() => toast.error("Failed to load your learning materials"))
      .finally(() => setLoading(false));
  }, []);

  // Filter Data based on Active Tab
  const filteredData = learningData.filter(item => {
    if (activeTab === 'All Status') return true;
    return item.status === activeTab;
  });

  // Get In-Progress items for the top section
  const inProgressItems = learningData.filter(item => item.status === 'In Progress');

  if (loading) {
    return <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">Loading Your Workspace...</div>;
  }

  return (
    <div className="p-8 min-h-screen bg-[var(--background)] max-w-7xl mx-auto">
      
      {/* --- TOP SECTION: CONTINUE LEARNING --- */}
      {inProgressItems.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Continue Learning</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {inProgressItems.map(item => (
              <div key={item.courseId} className="bg-[var(--glass-surface)] border border-[var(--sys-glass-border)] rounded-[24px] p-5 flex gap-6 shadow-sm items-center hover:border-[var(--primary)]/50 transition-colors">
                
                {/* Placeholder Thumbnail */}
                <div className="w-32 h-32 bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-[16px] overflow-hidden shrink-0 flex items-center justify-center relative">
                    <Lightbulb size={32} className="text-[var(--text-muted)]/30" />
                    <div className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border backdrop-blur-md bg-orange-100/80 text-orange-700 border-orange-200">
                        In Progress
                    </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[var(--text)] leading-tight mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
                     <span className="w-3 h-3 rounded-full border border-[var(--primary)] flex items-center justify-center">
                         <span className="w-1 h-1 bg-[var(--primary)] rounded-full"></span>
                     </span>
                     Department: <span className="font-bold text-[var(--text)]">{item.department}</span>
                  </p>
                  
                  <div className="mt-5 flex items-center gap-5">
                      <div className="flex-1">
                          <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] mb-1.5">
                              <span>Progress</span>
                              <span>{item.progress}%</span>
                          </div>
                          <div className="h-2 w-full bg-[var(--background)] border border-[var(--sys-glass-border)] rounded-full overflow-hidden">
                              <div className="h-full bg-orange-400 rounded-full" style={{ width: `${item.progress}%` }}></div>
                          </div>
                      </div>
                      <button 
                        onClick={() => navigate(`/course/${item.courseId}`)}
                        className="px-6 py-2.5 rounded-full text-sm font-bold text-[var(--sys-text-on-secondary)] hover:brightness-105 active:scale-95 transition-all flex items-center gap-2"
                        style={{ background: 'var(--sys-pill-gradient)', boxShadow: 'var(--sys-pill-shadow)' }}
                      >
                          <PlayCircle size={16} /> Continue
                      </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- BOTTOM SECTION: ALL MATERIALS --- */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--text)] mb-6">All Materials</h2>
        
        {/* Sleek TABS (Matching MyExams) */}
        <div className="flex flex-wrap gap-3 mb-8 border-b border-[var(--sys-glass-border)] pb-6">
            {['All Status', 'Pending', 'In Progress', 'Completed'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                        activeTab === tab 
                            ? 'bg-[var(--text)] text-[var(--background)] shadow-md' 
                            : 'bg-[var(--glass-surface)] text-[var(--text-muted)] border border-[var(--sys-glass-border)] hover:border-[var(--primary)]'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* GRID */}
        {filteredData.length === 0 ? (
             <div className="text-center py-20 text-[var(--text-muted)] border border-[var(--sys-glass-border)] bg-[var(--glass-surface)] shadow-sm rounded-[24px]">
                 No courses found in this category.
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredData.map(item => (
                    <div key={item.courseId} className="bg-[var(--glass-surface)] border border-[var(--sys-glass-border)] rounded-[24px] p-5 flex flex-col shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
                        
                        {/* Placeholder Thumbnail */}
                        <div className="w-full h-40 bg-[var(--background)] rounded-[16px] mb-5 flex items-center justify-center border border-[var(--sys-glass-border)] relative overflow-hidden">
                             <Lightbulb size={40} className="text-[var(--text-muted)]/30" />
                             {/* Status Badge */}
                             <div className={`absolute top-3 right-3 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border backdrop-blur-md ${
                                 item.status === 'Completed' ? 'bg-green-100/80 text-green-700 border-green-200' :
                                 item.status === 'In Progress' ? 'bg-orange-100/80 text-orange-700 border-orange-200' :
                                 'bg-gray-100/80 text-gray-600 border-gray-200'
                             }`}>
                                 {item.status}
                             </div>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-[var(--text)] leading-snug mb-3 line-clamp-2">
                                {item.title}
                            </h3>
                            
                            <div className="space-y-2 text-sm text-[var(--text-muted)] font-medium">
                                <p className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[var(--primary)] rounded-full"></span>
                                    <span className="font-bold text-[var(--text)]">{item.department}</span> Dept
                                </p>
                                <p className="flex items-center gap-2">
                                    <Lightbulb size={14} className="text-[var(--text-muted)] opacity-70" />
                                    {item.totalMarks} Marks Test
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[var(--sys-glass-border)]">
                            <button 
                                onClick={() => navigate(`/course/${item.courseId}`)}
                                className={`w-full py-3.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                    item.status === 'Completed' 
                                    ? 'border-2 border-green-200 text-green-700 hover:bg-green-50' 
                                    : 'text-[var(--sys-text-on-secondary)] hover:brightness-105 active:scale-95'
                                }`}
                                style={item.status !== 'Completed' ? { 
                                    background: 'var(--sys-pill-gradient)', 
                                    boxShadow: 'var(--sys-pill-shadow)' 
                                } : {}}
                            >
                                {item.status === 'Completed' ? <CheckCircle2 size={18} /> : <PlayCircle size={18} />}
                                {item.status === 'Completed' ? 'Review Course' : item.status === 'In Progress' ? 'Continue Course' : 'Start Course'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
};

export default UserDashboard;