const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  let baseClass = "px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";
  
  if (variant === 'primary') {
    baseClass += " primary-gradient text-white hover:shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2";
  } else if (variant === 'outline') {
    baseClass += " border-2 border-outline-variant text-on-surface hover:bg-surface-container-low focus:ring-2 focus:ring-primary";
  } else if (variant === 'ghost') {
    baseClass += " bg-transparent text-secondary hover:bg-surface-container-low hover:text-primary";
  }

  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
