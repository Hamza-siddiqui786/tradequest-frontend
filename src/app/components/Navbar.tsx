import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  Menu,
  TrendingUp,
  User,
  Trophy,
  LineChart,
  Briefcase,
  Brain,
  Target,
  Bot,
  Wallet,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useAuthStore } from '../stores/authStore';
import { API } from '../lib/config';

const navItems = [
  { to: '/dashboard', icon: LineChart, label: 'Dashboard' },
  { to: '/ai-coach', icon: Bot, label: 'AI Coach' },
  { to: '/missions', icon: Target, label: 'Missions' },
  { to: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/analytics', icon: LineChart, label: 'Analytics' },
  { to: '/psychology', icon: Brain, label: 'Psychology' },
] as const;

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';
  const [open, setOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  async function onLogout() {
    try {
      const rt = refreshToken;
      if (rt) {
        await fetch(API('/auth/logout'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rt }),
        });
      }
    } catch {
      /* ignore */
    }
    logout();
    navigate('/auth');
  }

  if (isLanding) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4">
        <GlassCard className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <TrendingUp className="w-6 h-6 text-[#00ff88] shrink-0" />
              <span className="text-xl tracking-tight truncate">TradeQuest</span>
            </Link>
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              <Link to="/auth" className="text-sm hover:text-[#00ff88] transition-colors">
                Login
              </Link>
              <Link
                to="/auth"
                className="px-4 sm:px-6 py-2 bg-[#00ff88] text-black rounded-lg hover:shadow-[0_0_20px_rgba(0,255,136,0.5)] transition-all text-sm text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </GlassCard>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4">
      <GlassCard className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
            <TrendingUp className="w-6 h-6 text-[#00ff88]" />
            <span className="text-xl tracking-tight hidden sm:inline">TradeQuest</span>
          </Link>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-center min-w-0">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} icon={<Icon className="w-4 h-4" />} label={label} />
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Link to="/portfolio" className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="Portfolio">
              <Briefcase className="w-5 h-5" />
            </Link>
            <Link to="/wallet" className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="Wallet">
              <Wallet className="w-5 h-5" />
            </Link>
            <Link to="/profile" className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="profile">
              <User className="w-5 h-5" />
            </Link>
            <Link to="/settings" className="hidden sm:block p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => void onLogout()}
              className="hidden sm:block p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-[#ff0055]"
              title="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-white/5"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-2 animate-in slide-in-from-top-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  location.pathname === to ? 'bg-white/10 text-[#00ff88]' : 'text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void onLogout();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#ff0055] text-left"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        )}
      </GlassCard>
    </nav>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 text-sm transition-colors whitespace-nowrap ${
        isActive ? 'text-[#00ff88]' : 'text-gray-400 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
