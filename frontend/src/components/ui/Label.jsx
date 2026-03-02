import React from 'react';

const Label = ({ children, htmlFor, className = "" }) => {
  return (
    <label 
      htmlFor={htmlFor} 
      className={`block font-mono text-[11px] text-purple-400 tracking-[0.2em] uppercase mb-1 ${className}`}
    >
      {children}
    </label>
  );
};

export default Label;

