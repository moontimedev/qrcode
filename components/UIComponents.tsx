import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative px-6 py-3 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-slate-50 text-slate-900 hover:bg-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-transparent",
    secondary: "bg-indigo-500/10 text-indigo-200 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/30",
    ghost: "text-slate-400 hover:text-slate-200 hover:bg-white/5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`} 
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {children}
      </div>
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none font-light ${props.className}`}
  />
);

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, ...props }) => (
  <label {...props} className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2 ml-1">
    {children}
  </label>
);

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-slate-950/40 backdrop-blur-2xl border border-white/5 rounded-xl shadow-2xl p-6 md:p-8 ${className}`}>
    {children}
  </div>
);