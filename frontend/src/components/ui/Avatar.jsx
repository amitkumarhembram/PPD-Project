// Profile photo URLs are relative (e.g. /uploads/...) — proxied by Vite in dev, served by backend in prod.

const SIZES = {
  xs:  'w-7 h-7 text-[10px]',
  sm:  'w-9 h-9 text-xs',
  md:  'w-12 h-12 text-sm',
  lg:  'w-16 h-16 text-lg',
  xl:  'w-20 h-20 text-xl',
};

const ROUNDED = {
  circle: 'rounded-full',
  square: 'rounded-lg',
};

/**
 * Reusable Avatar component.
 *
 * Props:
 *   url      - relative path from server  e.g. "/uploads/1-abc.jpg"
 *   name     - display name for initials fallback        e.g. "Rahul XYZ"
 *   size     - "xs" | "sm" | "md" | "lg" | "xl"         default "md"
 *   shape    - "circle" | "square"                       default "circle"
 *   className - extra classes
 */
const Avatar = ({ url, name, size = 'md', shape = 'circle', className = '', ...props }) => {
  const sizeClass    = SIZES[size]    ?? SIZES.md;
  const roundedClass = ROUNDED[shape] ?? ROUNDED.circle;

  const baseClass = `flex-shrink-0 overflow-hidden border-2 border-outline-variant/30 
    bg-surface-container flex items-center justify-center 
    ${sizeClass} ${roundedClass} ${className}`;

  if (url) {
    const fullUrl = url.startsWith('http') ? url : url; // relative paths work via Vite proxy
    return (
      <div className={baseClass} {...props}>
        <img
          src={fullUrl}
          alt={name || 'Profile'}
          className="w-full h-full object-cover"
          onError={e => {
            // on broken URL → hide img, show fallback
            e.target.style.display = 'none';
            e.target.parentNode.dataset.fallback = 'true';
          }}
        />
      </div>
    );
  }

  if (name) {
    const initials = name
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    return (
      <div className={`${baseClass} primary-gradient text-white font-black`} {...props}>
        {initials}
      </div>
    );
  }

  return (
    <div className={`${baseClass} text-secondary`} {...props}>
      <span className="material-symbols-outlined" style={{ fontSize: '60%' }}>person</span>
    </div>
  );
};

export default Avatar;
