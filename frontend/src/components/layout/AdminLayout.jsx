import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

const AdminLayout = () => {
  const token = localStorage.getItem('sres_token');
  let user = {};
  if (token && token !== 'undefined') {
    try {
      user = JSON.parse(atob(token.split(".")[1]));
    } catch (err) {}
  }
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!token || token === 'undefined' || (user.adminRole !== 'SUPERADMIN' && user.role !== 'admin')) {
    return <Navigate to="/" />;
  }

  const links = [
    { to: '/admin', label: 'HOME', icon: 'grid_view', end: true },
    { to: '/admin/applications', label: 'Applications', icon: 'fact_check' },
    { to: '/admin/enrollments', label: 'Enrollments', icon: 'how_to_reg' },
    { to: '/admin/users', label: 'Users', icon: 'manage_accounts' },
    { to: '/admin/students', label: 'Students', icon: 'groups' },
    { to: '/admin/academic', label: 'Academic', icon: 'auto_stories' }
  ];

  return (
    <div className={`min-h-screen bg-background text-on-background pb-24 md:pb-8 transition-all duration-300 ${isCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
      <Sidebar 
        links={links} 
        role="admin" 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <Navbar role="admin" user={user} isCollapsed={isCollapsed} />
      <main className="pt-[90px] max-w-screen-2xl mx-auto px-6 space-y-8 md:space-y-12">
        <Outlet />
      </main>
      <BottomNav links={links} />
    </div>
  );
};

export default AdminLayout;
