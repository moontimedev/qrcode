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
  const baseStyles =
    'relative px-6 py-3 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    primary:
      'bg-slate-50 text-slate-900 hover:bg-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-transparent',
    secondary:
      'bg-indigo-500/10 text-indigo-200 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/30',
    ghost: 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">{children}</div>
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none font-light ${props.className ?? ''}`}
  />
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={`w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none font-light resize-none ${props.className ?? ''}`}
  />
);

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  children,
  ...props
}) => (
  <label
    {...props}
    className={`block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2 ml-1 ${props.className ?? ''}`}
  >
    {children}
  </label>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`bg-slate-950/40 backdrop-blur-2xl border border-white/5 rounded-xl shadow-2xl p-6 md:p-8 ${className}`}
  >
    {children}
  </div>
);

/** Accessible on/off switch. */
export const Toggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
      checked ? 'bg-indigo-500/80' : 'bg-slate-700'
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
        checked ? 'translate-x-5' : ''
      }`}
    />
  </button>
);

/** Segmented control — a compact row of mutually exclusive options. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 p-1 bg-slate-950/50 border border-slate-800 rounded-lg">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            value === o.value
              ? 'bg-slate-800 text-indigo-200 shadow-sm'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Catches errors thrown while rendering the QR (e.g. content that exceeds the
 * code's capacity) and shows a fallback instead of blanking the app. Recovers
 * automatically once the content changes.
 */
export class QRBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode; resetKey: unknown },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prev: { resetKey: unknown }) {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
