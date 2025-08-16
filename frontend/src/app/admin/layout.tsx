"use client";

import { useState, ReactNode, useCallback, memo } from 'react';
import Sidebar from './sidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = memo(({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/background.jpg')" }}>
      <div className="min-h-screen bg-[#F8F9FE]/60">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div className={`transition-all duration-150 ease-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          {!isSidebarOpen && (
            <button
              onClick={handleSidebarToggle}
              className="fixed top-6 left-6 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 text-gray-400 transition-colors duration-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
});

AdminLayout.displayName = 'AdminLayout';

export default AdminLayout; 