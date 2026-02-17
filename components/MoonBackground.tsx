import React from 'react';

const MoonBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep Atmospheric Background */}
      <div className="absolute inset-0 bg-[#020617]" />
      
      {/* Subtle Gradient Wash */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-indigo-950/20 to-transparent opacity-50" />

      {/* The Eclipse / Celestial Body - Abstract & Mature */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full opacity-100">
        {/* The dark body of the moon */}
        <div className="absolute inset-4 bg-slate-950 rounded-full z-10"></div>
        
        {/* The Corona / Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-900/0 via-slate-800/10 to-indigo-100/10 blur-3xl"></div>
        
        {/* Rim Light */}
        <div className="absolute inset-0 rounded-full shadow-[inset_-2px_-2px_100px_rgba(255,255,255,0.05)]"></div>
        <div className="absolute top-10 right-10 w-full h-full rounded-full border border-white/5 opacity-20 transform scale-90"></div>
      </div>

      {/* Ambient Light Orbs */}
      <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]"></div>
      <div className="absolute top-[20%] right-[20%] w-[200px] h-[200px] bg-blue-900/5 rounded-full blur-[80px]"></div>

      {/* Fine Dust/Stars - Static and minimal */}
      <div className="absolute inset-0 opacity-30" 
           style={{ 
             backgroundImage: 'radial-gradient(white 1px, transparent 1px)', 
             backgroundSize: '50px 50px' 
           }}>
      </div>
    </div>
  );
};

export default MoonBackground;