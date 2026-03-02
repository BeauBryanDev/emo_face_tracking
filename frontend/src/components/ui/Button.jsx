import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary", 
  disabled = false, 
  fullWidth = false,
  className = "" 
}) => {
  const baseClasses = "relative font-display font-bold text-sm tracking-widest uppercase transition-all duration-200 overflow-hidden flex items-center justify-center gap-2 px-6 py-2";
  const widthClass = fullWidth ? "w-full" : "w-auto";
  
  // Variant styling dictionaries
  const variants = {
    primary: "bg-purple-900 border border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-purple-950 hover:shadow-neon-md",
    secondary: "bg-surface-2 border border-purple-600 text-purple-300 hover:border-purple-400 hover:text-purple-100",
    danger: "bg-red-950 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.6)]",
    ghost: "bg-transparent border border-transparent text-purple-400 hover:text-neon-purple hover:bg-purple-900/50"
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed pointer-events-none grayscale" : "cursor-pointer";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${widthClass} ${disabledClasses} ${className} group`}
    >
      {/* Scanline hover effect */ }
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-500 ease-in-out"></div>
      
      {/* Button content */ }
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
};

export default Button;

