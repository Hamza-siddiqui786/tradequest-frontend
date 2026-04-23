import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, TrendingUp, Crown } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Navbar } from '../components/Navbar';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

type Row = {
  userId: number;
  username: string;
  rank: number;
  roi: number;
  winRate: number;
  consistency: number;
  equity: number;
};

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [rows, setRows] = useState<Row[]>([]);
  const myId = useAuthStore((s) => s.userId);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<Row[]>('/leaderboard?limit=50');
        setRows(data);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Leaderboard failed');
      }
    })();
  }, [period]);

  const sorted = useMemo(() => {
    const mult = period === 'daily' ? 1 : period === 'weekly' ? 0.98 : 0.95;
    return [...rows]
      .map((r) => ({
        ...r,
        roi: r.roi * mult,
        displayRank: r.rank,
      }))
      .sort((a, b) => b.roi - a.roi)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [rows, period]);

  const top3 = sorted.slice(0, 3);
  const rest = sorted;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 px-4 sm:px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl mb-2 flex flex-wrap items-center justify-center gap-3">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-[#00ff88]" />
                Leaderboard
              </h1>
              <p className="text-gray-400">ROI-ranked simulation snapshot (filters re-weight for demo periods)</p>
            </div>

            {top3.length >= 3 ? (
              <div className="mb-12">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto items-end">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative sm:top-8 order-2 sm:order-1"
                  >
                    <GlassCard className="p-6 text-center" glow glowColor="blue">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-xl border-4 border-black">
                        2
                      </div>
                      <div className="text-4xl mb-3 mt-6">🥈</div>
                      <h3 className="text-lg mb-2 truncate">{top3[1].username}</h3>
                      <p className="text-xl text-blue-400 mb-1">{(top3[1].roi * 100).toFixed(1)}%</p>
                      <p className="text-sm text-gray-400">ROI</p>
                    </GlassCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="order-1 sm:order-2"
                  >
                    <GlassCard className="p-6 text-center relative" glow glowColor="green">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center border-4 border-black shadow-[0_0_30px_rgba(250,204,21,0.6)]">
                        <Crown className="w-8 h-8 text-black" />
                      </div>
                      <div className="text-5xl mb-3 mt-8">🥇</div>
                      <h3 className="text-xl mb-2 truncate">{top3[0].username}</h3>
                      <p className="text-3xl text-[#00ff88] mb-1">{(top3[0].roi * 100).toFixed(1)}%</p>
                      <p className="text-sm text-gray-400">ROI</p>
                    </GlassCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="relative sm:top-12 order-3"
                  >
                    <GlassCard className="p-6 text-center" glow glowColor="red">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-700 rounded-full flex items-center justify-center text-xl border-4 border-black">
                        3
                      </div>
                      <div className="text-4xl mb-3 mt-6">🥉</div>
                      <h3 className="text-lg mb-2 truncate">{top3[2].username}</h3>
                      <p className="text-xl text-amber-600 mb-1">{(top3[2].roi * 100).toFixed(1)}%</p>
                      <p className="text-sm text-gray-400">ROI</p>
                    </GlassCard>
                  </motion.div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 mb-8 text-sm">Not enough players on the board yet.</p>
            )}

            <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)} className="mb-6">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-white/5">
                <TabsTrigger value="daily" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
                  Daily
                </TabsTrigger>
                <TabsTrigger value="weekly" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
                  Weekly
                </TabsTrigger>
                <TabsTrigger value="monthly" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
                  Monthly
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <GlassCard className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm text-gray-400">Rank</th>
                      <th className="px-4 py-3 text-left text-sm text-gray-400">Trader</th>
                      <th className="px-4 py-3 text-right text-sm text-gray-400">ROI</th>
                      <th className="px-4 py-3 text-right text-sm text-gray-400">Win rate</th>
                      <th className="px-4 py-3 text-right text-sm text-gray-400">Consistency</th>
                      <th className="px-4 py-3 text-right text-sm text-gray-400">Equity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rest.map((trader, index) => (
                      <tr
                        key={`${trader.userId}-${trader.rank}`}
                        className={`border-b border-white/5 hover:bg-white/5 ${
                          trader.userId === myId ? 'bg-[#00ff88]/10' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {trader.rank === 1 && <Crown className="w-4 h-4 text-yellow-400 shrink-0" />}
                            {trader.rank === 2 && <Medal className="w-4 h-4 text-gray-400 shrink-0" />}
                            {trader.rank === 3 && <Medal className="w-4 h-4 text-amber-700 shrink-0" />}
                            <span>#{trader.rank}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate max-w-[140px]">{trader.username}</span>
                            {trader.userId === myId && (
                              <span className="text-xs text-[#00ff88] shrink-0">You</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-[#00ff88]">
                          {(trader.roi * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-right">{(trader.winRate * 100).toFixed(0)}%</td>
                        <td className="px-4 py-3 text-right">{(trader.consistency * 100).toFixed(0)}%</td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {trader.equity.toFixed(0)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
