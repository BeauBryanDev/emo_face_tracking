import React from 'react';

const Text = ({ 
  children, 
  variant = "body", 
  glow = false, 
  className = "" 
}) => {
  
  const styles = {
    h1: "font-display text-3xl md:text-4xl font-black text-purple-100 uppercase tracking-widest",
    h2: "font-display text-xl md:text-2xl font-bold text-purple-200 uppercase tracking-wider",
    h3: "font-display text-lg font-bold text-neon-purple uppercase tracking-wider",
    body: "font-body text-base text-purple-200",
    mono: "font-mono text-sm text-purple-300 tracking-wider",
    subtext: "font-mono text-[10px] text-purple-500 tracking-widest uppercase"
  };

  const glowClass = glow ? "text-shadow-neon" : "";
  const Component = ['h1', 'h2', 'h3'].includes(variant) ? variant : 'p';

  return (
    <Component className={`${styles[variant]} ${glowClass} ${className}`}>
      {children}
    </Component>
  );
};

export default Text;

