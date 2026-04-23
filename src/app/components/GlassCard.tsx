import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  glowColor?: 'green' | 'red' | 'blue';
}

export function GlassCard({ children, className = '', glow = false, glowColor = 'green' }: GlassCardProps) {
  const glowStyles = glow ? {
    boxShadow: glowColor === 'green' 
      ? '0 0 20px rgba(0, 255, 136, 0.3)' 
      : glowColor === 'red'
      ? '0 0 20px rgba(255, 0, 85, 0.3)'
      : '0 0 20px rgba(59, 130, 246, 0.3)'
  } : {};

  return (
    <div 
      className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg ${className}`}
      style={glowStyles}
    >
      {children}
    </div>
  );
}
