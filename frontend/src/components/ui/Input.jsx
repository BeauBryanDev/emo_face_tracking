import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  type = "text", 
  placeholder, 
  id, 
  name, 
  value, 
  onChange, 
  error, 
  disabled = false,
  className = "",
  ...props 
}, ref) => {
  
  const baseClasses = "w-full bg-surface-1 font-mono text-sm text-purple-100 placeholder-purple-800 px-4 py-2 outline-none transition-all duration-200";
  const defaultBorder = "border border-purple-700 focus:border-neon-purple focus:shadow-neon-sm focus:bg-purple-950";
  const errorBorder = "border border-red-500 shadow-[inset_0_0_8px_rgba(239,68,68,0.2)] focus:border-red-400 focus:shadow-[0_0_10px_rgba(239,68,68,0.5)]";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed bg-surface-0" : "";

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="relative">
        {/* Input Field */ }
        <input
          ref={ref}
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`${baseClasses} ${error ? errorBorder : defaultBorder} ${disabledClasses} ${className}`}
          autoComplete="off"
          spellCheck="false"
          {...props}
        />
        
        {/* Decorative corner accent */ }
        <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${error ? 'border-red-500' : 'border-purple-500'} pointer-events-none`}></div>
      </div>

      {/* Error Message */ }
      {error && (
        <span className="font-mono text-[10px] text-red-500 tracking-wider uppercase mt-1">
          ERR: {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
