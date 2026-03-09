import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Lightbulb, CheckCircle2, PlayCircle, Search, FileText, FileQuestion, Clock, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const COLORS = {
    primary: '#c2912d', 
    lightGray: '#f3f4f6', 
    gray: '#6b7280', 
    darkGray: '#374151', 
    black: '#111827', 
    white: '#ffffff', 
  };

  useEffect(() => {
    api.get('/user/my-learning')
      .then(({ data }) => setCourses(data))
      .catch(() => toast.error("Failed to load courses"))
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            course.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'All' || course.status === activeTab;
      return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.primary }}></div>
        <p className="mt-4 text-sm font-medium" style={{ color: COLORS.gray }}>Loading your courses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] font-sans">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: COLORS.black }}>
              My Learning
            </h1>
            <p className="mt-2 text-lg font-medium" style={{ color: COLORS.gray }}>
              Access your assigned courses and track your progress.
            </p>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 group-focus-within:text-[#c2912d] transition-colors" style={{ color: COLORS.gray }} />
            </div>
            <input 
              type="text"
              placeholder="Search courses..."
              className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#c2912d]/20 focus:border-[#c2912d] transition-all outline-none shadow-sm hover:shadow-md"
              style={{ color: COLORS.black }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 🟢 FIXED: Updated Tabs to Pending, In Progress, Completed */}
        <div className="flex flex-wrap gap-2 mb-10 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm w-fit">
          {['All', 'Pending', 'In Progress', 'Completed'].map(tab => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isActive ? 'shadow-md transform scale-105' : 'hover:bg-gray-50'
                }`}
                style={{ 
                  backgroundColor: isActive ? COLORS.primary : 'transparent',
                  color: isActive ? COLORS.white : COLORS.gray,
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <BookOpen className="w-10 h-10 opacity-40" style={{ color: COLORS.gray }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.black }}>No courses found</h3>
            <p className="text-sm max-w-xs mx-auto" style={{ color: COLORS.gray }}>
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCourses.map((course, index) => {
              
              // 🟢 FIXED: Adjusted status styling configuration
              let statusConfig = {
                bg: '#f3f4f6', 
                text: '#4b5563', 
                icon: Clock,
                label: 'Pending',
                btnText: 'Start Course',
                btnIcon: PlayCircle
              };
              
              if (course.status === 'Completed') {
                statusConfig = { bg: '#ecfdf5', text: '#059669', icon: CheckCircle2, label: 'Completed', btnText: 'Review Course', btnIcon: FileText };
              } else if (course.status === 'In Progress') {
                statusConfig = { bg: '#fffbeb', text: '#d97706', icon: Clock, label: 'In Progress', btnText: 'Continue', btnIcon: ChevronRight };
              }

              return (
                <div 
                  key={course.courseId} 
                  className="group bg-white rounded-3xl border border-gray-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="relative w-full aspect-[4/3] rounded-2xl mb-5 overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:border-[#c2912d]/20 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 to-white opacity-50"></div>
                    <Lightbulb size={48} className="text-gray-300 group-hover:text-[#c2912d] group-hover:scale-110 transition-all duration-500" />
                    
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wide shadow-sm flex items-center gap-1.5 backdrop-blur-md bg-white/90"
                         style={{ color: statusConfig.text }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusConfig.text }}></span>
                      {statusConfig.label}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="mb-1 flex items-center gap-2">
                       <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                         {course.department}
                       </span>
                    </div>

                    <h3 className="text-lg font-bold leading-tight mb-3 line-clamp-2 group-hover:text-[#c2912d] transition-colors" style={{ color: COLORS.black }}>
                      {course.title}
                    </h3>
                    
                    <div className="mt-auto pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Files</span>
                            <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                <FileText size={14} className="text-[#c2912d]" /> {course.sopFiles?.length || 0}
                            </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Exams</span>
                            <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                <FileQuestion size={14} className="text-[#c2912d]" /> {course.examCount || 0}
                            </span>
                        </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate(`/course/${course.courseId}`)}
                    className="mt-5 w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm active:scale-95"
                    style={{ 
                      backgroundColor: course.status === 'Completed' ? '#f3f4f6' : COLORS.primary, 
                      color: course.status === 'Completed' ? COLORS.black : COLORS.white,
                      boxShadow: course.status !== 'Completed' ? '0 4px 12px rgba(194, 145, 45, 0.3)' : 'none'
                    }}
                  >
                    <statusConfig.btnIcon size={16} />
                    {statusConfig.btnText}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;