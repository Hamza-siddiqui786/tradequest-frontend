import { ReactNode } from 'react';
import { GlassCard } from './GlassCard';

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  change?: string;
  changePositive?: boolean;
  glow?: boolean;
  glowColor?: 'green' | 'red' | 'blue';
}

export function StatsCard({ title, value, icon, change, changePositive, glow, glowColor }: StatsCardProps) {
  return (
    <GlassCard className="p-6" glow={glow} glowColor={glowColor}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-2">{title}</p>
          <p className="text-2xl mb-1">{value}</p>
          {change && (
            <p className={`text-sm ${changePositive ? 'text-[#00ff88]' : 'text-[#ff0055]'}`}>
              {changePositive ? '+' : ''}{change}
            </p>
          )}
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          {icon}
        </div>
      </div>
    </GlassCard>
  );
}
