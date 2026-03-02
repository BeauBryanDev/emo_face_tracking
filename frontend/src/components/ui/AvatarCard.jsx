import React from 'react';

const AvatarCard = ({ 
  name = "UNKNOWN ENTITY", 
  role = "SYSTEM OPERATOR", 
  imageUrl = null, 
  status = "ONLINE" 
}) => {
  // Extract initials for the fallback avatar display
  const getInitials = (userName) => {
    if (!userName) return "XX";
    return userName
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const isOnline = status.toUpperCase() === 'ONLINE';

  return (
    <div className="flex items-center gap-4 p-4 bg-surface-1 border border-purple-800 shadow-[inset_0_0_15px_rgba(74,0,128,0.2)] relative overflow-hidden group">
      
      {/* Decorative background glow for depth */}
      <div className="absolute -right-4 -top-4 w-16 h-16 bg-neon-purple/10 rounded-full blur-xl group-hover:bg-neon-purple/20 transition-all duration-300 pointer-events-none"></div>
      
      {/* Avatar Image Container */}
      <div className="relative w-12 h-12 flex-shrink-0 border border-purple-500 bg-purple-950 flex items-center justify-center overflow-hidden z-10">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={`${name} visual identity`} 
            className="w-full h-full object-cover grayscale-[30%] contrast-125 mix-blend-screen"
          />
        ) : (
          <span className="font-display font-bold text-lg text-neon-purple tracking-widest drop-shadow-[0_0_5px_rgba(191,0,255,0.8)]">
            {getInitials(name)}
          </span>
        )}
        
        {/* Status Indicator (Bottom Right) */}
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-surface-1 border-t border-l border-purple-800 flex items-center justify-center">
          <div className={`w-1.5 h-1.5 ${isOnline ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]' : 'bg-purple-700'}`}></div>
        </div>
      </div>

      {/* User Text Data */}
      <div className="flex flex-col z-10">
        <span className="font-mono text-[10px] text-purple-400 tracking-widest uppercase">
          {role}
        </span>
        <span className="font-display font-bold text-purple-100 uppercase tracking-wider truncate max-w-[150px]">
          {name}
        </span>
      </div>
      
    </div>
  );
};

export default AvatarCard;