import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';

const Navbar = ({ role = 'student', user, isCollapsed, profilePhotoUrl }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sres_token');
    localStorage.removeItem('sres_user');
    navigate('/');
  };

  const getPageConfig = () => {
    const path = location.pathname;
    // Base layouts
    if (path === '/dashboard') return { title: 'Dashboard', back: false, profile: true };
    if (path === '/admin') return { title: 'Admin Dashboard', back: false, profile: true };
    if (path === '/admin/applications') return { title: 'Applications', back: false, profile: true };
    if (path === '/admin/users') return { title: 'Users', back: false, profile: true };
    if (path === '/admin/students') return { title: 'Students', back: false, profile: true };
    if (path === '/admin/academic') return { title: 'Academic', back: false, profile: true };
    
    // Back required pages
    if (path === '/profile') return { title: 'My Profile', back: false, profile: true };
    if (path === '/documents') return { title: 'Upload Documents', back: false, profile: true };
    if (path === '/enroll') return { title: 'Select Program', back: false, profile: true };
    if (path.startsWith('/admin/students/')) return { title: 'Student Detail', back: true, profile: true };

    return { title: 'SRES', back: false, profile: true };
  };

  const config = getPageConfig();

  return (
    <header className={`fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm border-b border-outline-variant/30 h-[73px] transition-all duration-300 ${isCollapsed ? 'md:w-[calc(100%-5rem)] md:left-20' : 'md:w-[calc(100%-16rem)] md:left-64'}`}>
      <div className="flex justify-between items-center px-4 md:px-6 h-full w-full max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4">
          {config.back ? (
            <button 
              onClick={() => navigate(-1)} 
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors group"
            >
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface">arrow_back</span>
            </button>
          ) : (
            <div className="md:hidden">
              <Link to={role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">school</span>
                <span className="font-bold tracking-widest text-on-surface uppercase font-headline">SRES</span>
              </Link>
            </div>
          )}
          
          <h1 className={`text-sm md:text-base font-black tracking-widest text-on-surface uppercase p-2 border-outline-variant/20 ${config.back || 'hidden md:block'}`}>
            {config.title}
          </h1>
        </div>

        <div className="flex gap-8 items-center">
          {config.profile && (
            <div className="flex items-center gap-3 pl-6 relative" ref={dropdownRef}>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-on-surface uppercase tracking-widest">{user?.name || 'User'}</p>
                <p className="text-[9px] text-secondary font-bold uppercase tracking-widest">{role === 'admin' ? 'Super Admin' : 'Student'}</p>
              </div>
              
              <Avatar
                url={profilePhotoUrl}
                name={user?.name}
                size="sm"
                shape="square"
                className="cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                onClick={() => setShowDropdown(!showDropdown)}
              />

              {showDropdown && (
                <div className="absolute top-12 right-0 mt-3 w-64 bg-white/95 backdrop-blur-2xl border border-outline-variant/30 shadow-2xl rounded-2xl overflow-hidden py-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-5 py-4 border-b border-outline-variant/10 mb-1 bg-surface-container-low/30 block sm:hidden">
                    <p className="font-extrabold text-sm text-on-surface uppercase tracking-tight truncate">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-secondary font-black uppercase tracking-widest mt-1 truncate">{user?.email || 'email@example.com'}</p>
                  </div>
                  <div className="px-5 py-3 border-b border-outline-variant/10 mb-1 bg-surface-container-low/20 hidden sm:block">
                    <p className="text-[10px] text-secondary font-black uppercase tracking-widest truncate">{user?.email || 'email@example.com'}</p>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="w-full text-left px-5 py-4 text-[11px] text-error hover:bg-error/5 transition-colors font-black tracking-widest uppercase flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      Logout
                    </div>
                    <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
