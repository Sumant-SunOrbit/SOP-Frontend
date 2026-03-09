import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'; // <--- IMPORT THIS
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[var(--sys-bg)] text-[var(--sys-text)] transition-colors duration-300">
      
      {/* 1. Sidebar (Fixed) */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* 2. Content Wrapper (Pushes content right on desktop) */}
      <div className="flex flex-col flex-1 max-h-screen transition-all duration-300 ease-in-out lg:ml-64">
        
        {/* 3. Header */}
        <Header toggleSidebar={toggleSidebar} />
        
        {/* 4. Dynamic Page Content */}
        {/* <Outlet /> renders whatever route matches in App.js */}
        <main className="flex-1 p-4 md:p-4 overflow-y-auto">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;