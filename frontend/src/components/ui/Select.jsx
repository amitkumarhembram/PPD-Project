import React from 'react';

const Select = React.forwardRef(({ label, id, error, options, className = '', required, ...props }, ref) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-on-surface uppercase tracking-widest">
          {label}{required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          ref={ref}
          className={`w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all appearance-none ${error ? 'border-error ring-1 ring-error' : ''}`}
          {...props}
        >
          <option value="" disabled hidden>Select an option</option>
          {options.map((opt, i) => (
            <option key={i} value={opt.value || opt}>{opt.label || opt}</option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">expand_more</span>
      </div>
      {error && <p className="text-xs text-error font-medium">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
