import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = React.forwardRef(({ label, id, error, type = 'text', className = '', required, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-on-surface uppercase tracking-widest">
          {label}{required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          ref={ref}
          type={isPassword && showPassword ? 'text' : type}
          className={`w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-outline/60 ${error ? 'border-error ring-1 ring-error' : ''} ${isPassword ? 'pr-12' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors focus:outline-none flex items-center justify-center"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-error font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
