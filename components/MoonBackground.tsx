import React, { useMemo } from 'react';

const MoonBackground: React.FC = () => {
  // Generate random stars only once
  const stars = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      delay: `${Math.random() * 3}s`
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep Space Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/40" />

      {/* The Moon */}
      <div className="absolute top-10 right-10 w-32 h-32 md:w-64 md:h-64 rounded-full bg-slate-200 shadow-[0_0_80px_rgba(255,255,255,0.25)] overflow-hidden opacity-90">
        <div className="absolute w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-multiply"></div>
        {/* Craters */}
        <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-slate-300 rounded-full opacity-50 shadow-inner"></div>
        <div className="absolute top-1/2 left-2/3 w-12 h-12 bg-slate-300 rounded-full opacity-40 shadow-inner"></div>
        <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-slate-300 rounded-full opacity-60 shadow-inner"></div>
      </div>
      
      {/* Moon Glow overlay */}
      <div className="absolute top-10 right-10 w-32 h-32 md:w-64 md:h-64 rounded-full bg-white blur-[60px] opacity-20 animate-pulse"></div>

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
          }}
        />
      ))}
    </div>
  );
};

export default MoonBackground;