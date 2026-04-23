import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Brain, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Navbar } from '../components/Navbar';
import { Progress } from '../components/ui/progress';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

type AnalyticsData = {
  trades: { total: number; winRate: number | null };
  behavior30d: Array<{ action_type: string; count: number; avg_confidence: string | null }>;
};

type BehRow = { action_type: string; count: number; avg_confidence: string | null };

export default function PsychologyTrackerPage() {
  const [a, setA] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setA(await apiFetch<AnalyticsData>('/analytics'));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Load failed');
      }
    })();
  }, []);

  const scores = useMemo(() => {
    const rows = a?.behavior30d ?? [];
    const get = (t: string) => rows.find((r) => r.action_type === t)?.count ?? 0;
    const fomo = get('FOMO');
    const panic = get('panic_sell');
    const disc = get('disciplined_trade');
    const over = get('overtrade');
    const total = fomo + panic + disc + over + 1;
    const fear = Math.min(100, Math.round(((fomo + panic * 1.2) / total) * 180));
    const discipline = Math.max(5, Math.min(100, 100 - fear / 2 + disc * 3));
    const overtradeMeter = Math.min(100, over * 12 + fomo * 4);
    const overall = Math.round((discipline + (100 - overtradeMeter) + (100 - fear)) / 3);
    return { fear, discipline, overtradeMeter, overall, rows };
  }, [a]);

  const recent = useMemo(() => {
    return (a?.behavior30d ?? []).map((b: BehRow) => ({
      type: b.action_type === 'disciplined_trade' ? 'positive' : 'warning',
      message: `${b.action_type.replace(/_/g, ' ')} ×${b.count}`,
      time: 'last 30 days',
    }));
  }, [a]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 px-4 sm:px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-8">
              <h1 className="text-4xl mb-2 flex items-center gap-3">
                <Brain className="w-10 h-10 text-[#00ff88]" />
                Psychology tracker
              </h1>
              <p className="text-gray-400">Derived from logged behavior tags in the API</p>
            </div>

            <GlassCard className="p-8 mb-8" glow glowColor="green">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
                <div>
                  <h2 className="text-2xl mb-2">Composite mindset score</h2>
                  <p className="text-gray-400">Blends discipline, tempo, and fear proxies</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full border-8 border-[#00ff88] flex items-center justify-center relative mx-auto">
                    <div className="absolute inset-0 rounded-full bg-[#00ff88]/20 blur-xl" />
                    <span className="text-4xl relative z-10">{scores.overall}</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[
                {
                  id: 'fear',
                  name: 'Fear index',
                  value: scores.fear,
                  icon: '😌',
                  desc: 'Higher when FOMO / panic tags dominate recent logs.',
                },
                {
                  id: 'discipline',
                  name: 'Discipline score',
                  value: Math.round(scores.discipline),
                  icon: '💪',
                  desc: 'Rewarded when disciplined_trade events appear.',
                },
                {
                  id: 'over',
                  name: 'Overtrading meter',
                  value: Math.round(scores.overtradeMeter),
                  icon: '⚠️',
                  desc: 'Rises with overtrading + impulsive FOMO frequency.',
                },
              ].map((metric, index) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                >
                  <GlassCard className="p-6 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{metric.icon}</div>
                    </div>
                    <h3 className="text-xl mb-3">{metric.name}</h3>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Score</span>
                        <span className="text-lg text-[#00ff88]">{metric.value}/100</span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                    <p className="text-sm text-gray-400">{metric.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GlassCard className="p-6">
                  <h3 className="text-xl mb-6">Behavior mix (30d)</h3>
                  <div className="space-y-4">
                    {recent.length === 0 && <p className="text-gray-500 text-sm">No behavior logs yet — place trades!</p>}
                    {recent.map((behavior, index) => {
                      const Icon = behavior.type === 'positive' ? CheckCircle2 : AlertTriangle;
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${
                            behavior.type === 'positive'
                              ? 'bg-[#00ff88]/10 border-[#00ff88]/30'
                              : 'bg-yellow-500/10 border-yellow-500/30'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon
                              className={`w-5 h-5 mt-0.5 ${
                                behavior.type === 'positive' ? 'text-[#00ff88]' : 'text-yellow-400'
                              }`}
                            />
                            <div>
                              <p>{behavior.message}</p>
                              <p className="text-sm text-gray-400">{behavior.time}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </div>

              <GlassCard className="p-6" glow glowColor="blue">
                <h3 className="text-lg mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Focus
                </h3>
                <p className="text-sm text-gray-300">
                  Win rate:{' '}
                  {a?.trades.winRate != null ? `${Math.round(a.trades.winRate * 100)}%` : '—'} across{' '}
                  {a?.trades.total ?? 0} ticket(s).
                </p>
                <p className="text-xs text-gray-500 mt-4">
                  Updated {formatDistanceToNow(new Date(), { addSuffix: true })}
                </p>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
