import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import api from '../../services/api';

const StudentLayout = () => {
  const token = localStorage.getItem('sres_token');
  let user = {};
  if (token && token !== 'undefined') {
    try {
      user = JSON.parse(atob(token.split(".")[1]));
    } catch (err) {}
  }

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);

  useEffect(() => {
    // Fetch student's profile photo for navbar display
    api.get('/application/me')
      .then(res => {
        if (res.data?.profile_photo_url) {
          setProfilePhotoUrl(res.data.profile_photo_url);
        }
      })
      .catch(() => {}); // silently ignore if no application yet
  }, []);

  if (!token || token === 'undefined' || user.role === 'admin') {
    return <Navigate to="/" />;
  }

  const links = [
    { to: '/dashboard', label: 'Home',   icon: 'grid_view' },
    { to: '/profile',   label: 'Profile', icon: 'person' },
    { to: '/enroll',    label: 'Enroll', icon: 'school' },
  ];

  return (
    <div className={`min-h-screen bg-background text-on-background pb-24 md:pb-8 transition-all duration-300 ${isCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
      <Sidebar
        links={links}
        role="student"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <Navbar role="student" user={user} isCollapsed={isCollapsed} profilePhotoUrl={profilePhotoUrl} />
      <main className="pt-[90px] px-4 md:px-8 max-w-5xl mx-auto">
        <Outlet />
      </main>
      <BottomNav links={links} />
    </div>
  );
};

export default StudentLayout;
