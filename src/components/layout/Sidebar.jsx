import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  LogOut, 
  X,
  BookOpen,      
  FileQuestion,  
  PenTool,       
  UserPlus,      
  GraduationCap,
  UploadCloud
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn'; 

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth(); 

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Departments', path: '/admin/departments', icon: Building2 },
    { name: 'Manage HODs', path: '/admin/hods', icon: Users }, 
  ];

  const hodLinks = [
    { name: 'Dashboard', path: '/hod/dashboard', icon: LayoutDashboard },
    { name: 'Courses & SOPs', path: '/hod/courses', icon: BookOpen },
    { name: 'Create Exam', path: '/hod/create-exam', icon: PenTool },
    { name: 'Manage Exams', path: '/hod/exams', icon: FileQuestion },
    { name: 'Assign Exams', path: '/hod/assign/exam', icon: UserPlus },
    { name: 'Assign Courses', path: '/hod/assign/course', icon: GraduationCap },
    { name: 'Import Users', path: '/hod/bulk-users', icon: UploadCloud },
  ];

  // 🟢 UPDATED: Added "All Courses" for User
  const userLinks = [
    { name: 'My Learning Hub', path: '/dashboard', icon: LayoutDashboard },
    { name: 'All Courses', path: '/my-courses', icon: BookOpen }, 
    { name: 'My Exams', path: '/my-exams', icon: FileQuestion },
  ];

  const navItems = user?.role === 'Admin' 
    ? adminLinks 
    : user?.role === 'HOD' 
      ? hodLinks 
      : userLinks;

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 z-[1040] bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleSidebar}
      />

      <aside 
        className={cn(
          "fixed top-4 left-4 z-[1050] h-[calc(100vh-2rem)] w-64 flex flex-col transition-transform duration-300 ease-in-out rounded-2xl shadow-xl border border-[var(--sys-glass-border)]",
          "bg-[var(--sys-glass-surface)] backdrop-blur-xl",
          isOpen ? "translate-x-0" : "-translate-x-[120%] lg:translate-x-0"
        )}
      >
        <div className="p-8 flex flex-col items-center relative">
          <div className="flex flex-col items-center">
            <div className="h-8 flex items-center justify-center"> 
             <img 
               src="https://plots.krisala.com/wp-content/uploads/2025/05/krisala-new-logo-scaled.png" 
               alt="Krisala Logo" 
               className="h-full w-auto object-contain" 
             />
            </div>
            <p className="text-xs text-[var(--sys-text-muted)] pt-3 mt-1 tracking-widest uppercase opacity-70 text-center">
              {user?.role || 'LMS'} Portal
            </p>
          </div>
          <button 
            onClick={toggleSidebar} 
            className="lg:hidden absolute top-6 right-6 p-2 text-[var(--sys-text-muted)] hover:text-[var(--sys-text)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && toggleSidebar()} 
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group",
                isActive 
                  ? "bg-[var(--sys-secondary)]/5 text-[var(--sys-primary)] shadow-sm border border-[var(--sys-glass-border)]" 
                  : "text-[var(--sys-text-muted)] hover:bg-[var(--sys-text)]/5 hover:text-[var(--sys-text)]"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-[var(--sys-primary)]" : "text-[var(--sys-text-muted)] group-hover:text-[var(--sys-text)]"
                  )} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-[var(--sys-glass-border)]">
          <div className="mb-3 px-4">
             <p className="text-sm font-bold text-[var(--sys-text)] truncate">{user?.name || 'User'}</p>
             <p className="text-xs text-[var(--sys-text-muted)] truncate">{user?.email}</p>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[var(--sys-text-muted)] hover:text-[var(--sys-text)] hover:bg-[var(--sys-text)]/5 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;