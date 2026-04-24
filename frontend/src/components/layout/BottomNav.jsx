import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const MAX_VISIBLE = 4;

const BottomNav = ({ links }) => {
  const [moreOpen, setMoreOpen] = useState(false);

  const visibleLinks = links.slice(0, MAX_VISIBLE);
  const overflowLinks = links.slice(MAX_VISIBLE);
  const hasMore = overflowLinks.length > 0;

  return (
    <>
      {/* Backdrop */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMoreOpen(false)} />
      )}

      {/* Overflow drawer */}
      <div className={`fixed left-0 w-full z-50 md:hidden transition-all duration-250 ease-out
        bg-white border-t border-gray-100 shadow-2xl
        ${moreOpen ? 'bottom-[64px] opacity-100 translate-y-0' : 'bottom-[64px] opacity-0 pointer-events-none translate-y-2'}`}
      >
        <div className="flex justify-around items-center px-6 py-4">
          {overflowLinks.map((link, idx) => (
            <NavLink
              key={idx}
              to={link.to}
              end={link.end}
              onClick={() => setMoreOpen(false)}
              className="flex flex-col items-center gap-1.5"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`material-symbols-outlined text-[22px] transition-colors duration-150 ${isActive ? 'text-primary' : 'text-gray-400'}`}
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {link.icon}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    {link.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Main bottom nav */}
      <nav className="fixed bottom-0 left-0 w-full h-16 z-50 flex items-center justify-around
        bg-white border-t border-gray-100 shadow-[0_-1px_0_rgba(0,0,0,0.06)] md:hidden">

        {visibleLinks.map((link, idx) => (
          <NavLink
            key={idx}
            to={link.to}
            end={link.end}
            className="flex flex-col items-center justify-center flex-1 h-full gap-1"
          >
            {({ isActive }) => (
              <>
                <div className={`relative flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200 ${isActive ? 'bg-primary/10' : ''}`}>
                  <span
                    className={`material-symbols-outlined text-[22px] transition-colors duration-200 ${isActive ? 'text-primary' : 'text-gray-400'}`}
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {link.icon}
                  </span>
                </div>
                {isActive && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary leading-none">
                    {link.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {hasMore && (
          <button
            onClick={() => setMoreOpen(prev => !prev)}
            className="flex flex-col items-center justify-center flex-1 h-full gap-1"
          >
            <div className={`flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200 ${moreOpen ? 'bg-primary/10' : ''}`}>
              <span className={`material-symbols-outlined text-[22px] transition-colors duration-200 ${moreOpen ? 'text-primary' : 'text-gray-400'}`}>
                more_horiz
              </span>
            </div>
            {moreOpen && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-primary leading-none">
                More
              </span>
            )}
          </button>
        )}
      </nav>
    </>
  );
};

export default BottomNav;
