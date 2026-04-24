import { NavLink } from 'react-router-dom';

const BottomNav = ({ links }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-white/90 backdrop-blur-2xl shadow-[0_-10px_25px_rgba(0,0,0,0.05)] rounded-t-2xl border-t border-outline-variant/20 md:hidden">
      {links.map((link, idx) => (
        <NavLink key={idx} to={link.to} end={link.end} className={({ isActive }) => `flex flex-col items-center justify-center flex-1 py-1 gap-0.5 transition-colors ${isActive ? 'text-primary' : 'text-secondary'}`}>
          {({ isActive }) => (
            <div className={`${isActive ? 'bg-primary/10 px-4 py-1 rounded-full text-primary' : 'px-2'} flex flex-col items-center transition-all duration-300`}>
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{link.icon}</span>
              <span className="text-[9px] font-black uppercase tracking-widest mt-0.5">{link.label}</span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
