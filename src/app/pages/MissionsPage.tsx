import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Target, Trophy, Star, CheckCircle2, Zap } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Navbar } from '../components/Navbar';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

type MissionRow = {
  id: number;
  title: string;
  description: string | null;
  reward_xp: number;
  difficulty: number;
  progress: number | null;
  completed: boolean | null;
  reward_granted: boolean | null;
};

const LEVEL_STEP = 1000;

export default function MissionsPage() {
  const me = useAuthStore((s) => s.me);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const [missions, setMissions] = useState<MissionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const rows = await apiFetch<MissionRow[]>('/missions');
      setMissions(rows);
      await fetchMe();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load missions');
    } finally {
      setLoading(false);
    }
  }, [fetchMe]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalXP = me ? Number(me.user.xp) : 0;
  const level = me?.user.level ?? 1;
  const nextLevelXP = level * LEVEL_STEP;
  const xpToNext = Math.max(0, nextLevelXP - totalXP);

  const stats = useMemo(() => {
    let done = 0;
    let active = 0;
    for (const m of missions) {
      if (m.completed) done += 1;
      else if ((m.progress ?? 0) > 0) active += 1;
    }
    return { done, active, total: missions.length };
  }, [missions]);

  const claim = async (id: number) => {
    try {
      const r = await apiFetch<{ xpGranted: number }>(`/missions/${id}/claim`, { method: 'POST' });
      toast.success(r.xpGranted ? `+${r.xpGranted} XP` : 'Already claimed');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Claim failed');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 px-4 sm:px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-8">
              <h1 className="text-4xl mb-2">Missions & Quests</h1>
              <p className="text-gray-400">Progress syncs with the simulation backend.</p>
            </div>

            <GlassCard className="p-6 mb-8" glow glowColor="green">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00ff88] to-[#00ccff] rounded-full flex items-center justify-center text-2xl">
                    {level}
                  </div>
                  <div>
                    <h3 className="text-xl">Level {level} Trader</h3>
                    <p className="text-gray-400">
                      {totalXP} XP • {xpToNext} XP to next band
                    </p>
                  </div>
                </div>
              </div>
              <Progress value={Math.min(100, (totalXP / Math.max(nextLevelXP, 1)) * 100)} className="h-3" />
            </GlassCard>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-2xl mb-4">Active missions</h2>
                {loading && <p className="text-gray-500">Loading…</p>}
                {!loading && missions.length === 0 && (
                  <p className="text-gray-500">No missions seeded — run DB seeds on the API database.</p>
                )}
                {missions.map((mission, index) => {
                  const progress = mission.progress ?? 0;
                  const completed = Boolean(mission.completed);
                  return (
                    <motion.div
                      key={mission.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <GlassCard className="p-6" glow={progress > 0 && !completed} glowColor="green">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-xl">{mission.title}</h3>
                              <Badge variant="outline" className="border-[#00ccff] text-[#00ccff]">
                                D{mission.difficulty}
                              </Badge>
                            </div>
                            <p className="text-gray-400 mb-3">{mission.description ?? ''}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-400">Progress</span>
                                  <span className="text-sm text-[#00ff88]">{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>
                              <div className="flex items-center gap-2 text-[#00ff88]">
                                <Zap className="w-4 h-4 shrink-0" />
                                <span>+{mission.reward_xp} XP</span>
                              </div>
                            </div>
                            {completed && !mission.reward_granted && (
                              <Button
                                type="button"
                                className="mt-4 bg-[#00ff88] text-black"
                                onClick={() => void claim(mission.id)}
                              >
                                Claim reward
                              </Button>
                            )}
                          </div>
                          <div className="shrink-0">
                            {completed ? (
                              <CheckCircle2 className="w-8 h-8 text-[#00ff88]" />
                            ) : (
                              <Target className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl mb-4">Achievements</h2>
                  <GlassCard className="p-6">
                    <p className="text-sm text-gray-400 mb-4">
                      Unlock badges as you complete missions and maintain discipline.
                    </p>
                    <div className="space-y-3">
                      {['First blood', 'Risk aware', 'Consistent'].map((name, i) => (
                        <div
                          key={name}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            stats.done > i
                              ? 'bg-[#00ff88]/10 border-[#00ff88]/30'
                              : 'bg-white/5 border-white/5'
                          }`}
                        >
                          <span className="text-2xl">{stats.done > i ? '★' : '☆'}</span>
                          <span className={stats.done > i ? 'text-white' : 'text-gray-500'}>{name}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>

                <GlassCard className="p-6" glow glowColor="blue">
                  <h3 className="text-lg mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Streak
                  </h3>
                  <p className="text-gray-400 text-sm">Keep trading with a plan — streak bonuses hook in later.</p>
                </GlassCard>

                <GlassCard className="p-6">
                  <h3 className="text-lg mb-4">Mission stats</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Completed</span>
                      <span className="text-[#00ff88]">
                        {stats.done} / {stats.total || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">In progress</span>
                      <span className="text-blue-400">{stats.active}</span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
