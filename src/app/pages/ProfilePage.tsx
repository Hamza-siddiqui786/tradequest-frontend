import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { User, Trophy, Target, Award, Shield, Star, Edit, Share2, Calendar } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { format } from 'date-fns';

type AnalyticsData = {
  trades: {
    total: number;
    winRate: number | null;
    openPositions: number;
  };
};

type LBRow = { userId: number; rank: number; roi: number; username: string };

const LEVEL_STEP = 1000;

export default function ProfilePage() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const me = useAuthStore((s) => s.me);
  const myId = useAuthStore((s) => s.userId);
  const [a, setA] = useState<AnalyticsData | null>(null);
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await fetchMe();
        const [an, lb] = await Promise.all([
          apiFetch<AnalyticsData>('/analytics'),
          apiFetch<LBRow[]>('/leaderboard?limit=200'),
        ]);
        setA(an);
        const mine = lb.find((r) => r.userId === myId);
        setRank(mine?.rank ?? null);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Profile load failed');
      }
    })();
  }, [fetchMe, myId]);

  const username = me?.user.username ?? 'Trader';
  const level = me?.user.level ?? 1;
  const xp = me ? Number(me.user.xp) : 0;
  const nextLevelXP = level * LEVEL_STEP;
  const reputation =
    (a?.trades.winRate ?? 0) > 0.55
      ? 'Disciplined grinder'
      : (a?.trades.winRate ?? 0) > 0.45
        ? 'Balanced operator'
        : 'Learning cadet';

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 px-4 sm:px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <GlassCard className="p-8 mb-8" glow glowColor="green">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-[#00ff88] to-[#00ccff] rounded-full flex items-center justify-center text-5xl relative">
                    <div className="absolute inset-0 rounded-full bg-[#00ff88] opacity-30 blur-xl" />
                    <User className="relative z-10 w-14 h-14 text-black" />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="text-4xl">{username}</h1>
                    <Badge className="bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30">Level {level}</Badge>
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4 text-sm">
                    <Shield className="w-5 h-5 text-[#00ff88]" />
                    <span className="text-[#00ff88]">{reputation}</span>
                    {rank != null && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400">Rank #{rank}</span>
                      </>
                    )}
                  </div>

                  <div className="mb-4 max-w-md mx-auto md:mx-0">
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-gray-400">XP</span>
                      <span className="text-[#00ff88]">
                        {xp} / {nextLevelXP}
                      </span>
                    </div>
                    <Progress value={Math.min(100, (xp / Math.max(nextLevelXP, 1)) * 100)} className="h-3" />
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <Button type="button" className="bg-[#00ff88] text-black hover:bg-[#00ff88]/90">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit (soon)
                    </Button>
                    <Button type="button" variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                  <div className="p-4 bg-white/5 rounded-lg text-center border border-white/10">
                    <p className="text-xl text-[#00ff88] mb-1">{me ? Number(me.balance).toFixed(0) : '—'}</p>
                    <p className="text-sm text-gray-400">Cash</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg text-center border border-white/10">
                    <p className="text-xl text-white mb-1">{a?.trades.total ?? '—'}</p>
                    <p className="text-sm text-gray-400">Trades</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <div className="mb-8">
              <h2 className="text-2xl mb-4">Highlights</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: 'Win rate', value: a?.trades.winRate != null ? `${Math.round(a.trades.winRate * 100)}%` : '—' },
                  { label: 'Open positions', value: String(a?.trades.openPositions ?? '—') },
                  {
                    label: 'Member since',
                    value: me ? format(new Date(me.user.created_at), 'MMM yyyy') : '—',
                  },
                ].map((stat) => (
                  <GlassCard key={stat.label} className="p-6">
                    <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
                    <p className="text-2xl">{stat.value}</p>
                  </GlassCard>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl mb-4">Recent milestones</h2>
              <GlassCard className="p-6">
                <div className="space-y-4">
                  {[
                    { icon: Trophy, text: `Level ${level} operator`, color: 'text-[#00ff88]' },
                    { icon: Star, text: `${xp} XP banked`, color: 'text-yellow-400' },
                    { icon: Award, text: reputation, color: 'text-blue-400' },
                    { icon: Target, text: `${a?.trades.total ?? 0} simulation tickets`, color: 'text-[#00ff88]' },
                  ].map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                        <Icon className={`w-5 h-5 ${activity.color}`} />
                        <div>
                          <p>{activity.text}</p>
                          <p className="text-sm text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Live profile
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
