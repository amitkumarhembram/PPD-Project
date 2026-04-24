import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = ({ links, role, isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('sres_token');
    localStorage.removeItem('sres_user');
    navigate('/');
  };

  return (
    <aside className={`hidden md:flex flex-col h-screen fixed left-0 top-0 border-r border-outline-variant/30 bg-surface-container-lowest z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`p-6 flex items-center h-[73px] border-b border-outline-variant/30 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3">
          <img src= "/outr.png" alt="SRES" className="h-12 w-auto object-contain" />
          {!isCollapsed && <h1 className="text-2xl font-bold tracking-widest text-on-surface uppercase font-headline">OUTR</h1>}
        </div>
        <button 
          onClick={onToggleCollapse} 
          className={`flex-shrink-0 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all duration-200 rounded-full w-8 h-8 flex items-center justify-center shadow-[0_2px_8px_rgba(245,158,11,0.15)] ${isCollapsed ? 'absolute -right-4 top-[21px]' : ''}`}
        >
          <span className="material-symbols-outlined text-[18px]">{isCollapsed ? 'chevron_right' : 'menu_open'}</span>
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {links.map((link, idx) => (
          <NavLink 
            key={idx} 
            to={link.to} 
            end={link.end} 
            title={isCollapsed ? link.label : ''}
            className={({ isActive }) => `flex items-center rounded-lg font-bold uppercase tracking-widest text-xs transition-all duration-200 ${isCollapsed ? 'justify-center p-3' : 'gap-4 px-4 py-3'} ${isActive ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-surface-variant/50 hover:text-on-surface'}`}
          >
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{link.icon}</span>
                {!isCollapsed && <span>{link.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {role === 'admin' && (
        <div className="p-4 border-t border-outline-variant/30">
          <button 
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : ""}
            className={`w-full flex items-center rounded-lg text-error hover:bg-error/10 transition-colors font-bold uppercase tracking-widest text-xs ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}`}
          >
            <span className="material-symbols-outlined">logout</span>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
