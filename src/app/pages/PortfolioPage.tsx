import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Flame, Sparkles, Target, Trophy } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { GlassCard } from '../components/GlassCard';
import { StatsCard } from '../components/StatsCard';
import { Progress } from '../components/ui/progress';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';

type PortfolioRes = {
  wallet: { balance: number; currencyType: string };
  positions: Array<{
    assetSymbol: string;
    quantity: number;
    avgPrice: number;
    lastPrice: number;
    marketValue: number;
    unrealized: number;
  }>;
  totals: {
    cash: number;
    marketValue: number;
    equity: number;
    unrealizedPnL: number;
    realizedPnL: number;
  };
};

type TradeHistRow = {
  asset_symbol: string;
  order_type: string;
  quantity: string;
  entry_price: string;
  exit_price: string | null;
  status: string;
  trade_timestamp: string;
};

type AnalyticsRes = {
  trades: { winRate: number | null };
};

const MILESTONES = [
  { id: 'first-trade', title: 'First Blood', hint: 'Close your first trade', need: 1 },
  { id: 'five-wins', title: 'Sniper Five', hint: 'Reach five winning closes', need: 5 },
  { id: 'ten-trades', title: 'Market Grinder', hint: 'Execute ten total trades', need: 10 },
] as const;

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioRes | null>(null);
  const [history, setHistory] = useState<TradeHistRow[]>([]);
  const [winRate, setWinRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, h, a] = await Promise.all([
          apiFetch<PortfolioRes>('/portfolio'),
          apiFetch<TradeHistRow[]>('/trade/history?limit=120'),
          apiFetch<AnalyticsRes>('/analytics'),
        ]);
        setPortfolio(p);
        setHistory(h);
        setWinRate(a.trades.winRate);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not load portfolio');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const closedTrades = useMemo(() => history.filter((t) => t.status === 'closed'), [history]);
  const winningClosedTrades = useMemo(
    () =>
      closedTrades.filter((t) => {
        if (t.order_type !== 'buy' || t.exit_price == null) return false;
        return Number(t.exit_price) > Number(t.entry_price);
      }),
    [closedTrades]
  );

  const portfolioScore = useMemo(() => {
    if (!portfolio) return 0;
    const pnlScore = Math.max(0, Math.min(40, portfolio.totals.realizedPnL / 50));
    const winScore = Math.max(0, Math.min(40, (winRate ?? 0) * 40));
    const diversifyScore = Math.min(20, portfolio.positions.length * 4);
    return Math.round(pnlScore + winScore + diversifyScore);
  }, [portfolio, winRate]);

  const streak = useMemo(() => {
    let total = 0;
    for (let i = closedTrades.length - 1; i >= 0; i -= 1) {
      const t = closedTrades[i];
      if (t.order_type !== 'buy' || t.exit_price == null) break;
      if (Number(t.exit_price) <= Number(t.entry_price)) break;
      total += 1;
    }
    return total;
  }, [closedTrades]);

  const milestoneProgress = useMemo(() => {
    const wins = winningClosedTrades.length;
    const totalTrades = history.length;
    return MILESTONES.map((m) => {
      const current = m.id === 'five-wins' ? wins : m.id === 'ten-trades' ? totalTrades : closedTrades.length;
      const done = current >= m.need;
      return { ...m, current, done, pct: Math.min(100, Math.round((current / m.need) * 100)) };
    });
  }, [closedTrades.length, history.length, winningClosedTrades.length]);

  const fmtMoney = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 px-4 sm:px-6 pb-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl mb-2 flex items-center gap-3">
              <Briefcase className="w-10 h-10 text-[#00ff88]" />
              Portfolio Arena
            </h1>
            <p className="text-gray-400">Track holdings, level up your score, and complete trading milestones.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatsCard
              title="Portfolio score"
              value={loading ? '...' : `${portfolioScore}/100`}
              icon={<Trophy className="w-5 h-5 text-yellow-300" />}
              change="Gamified performance"
              changePositive
            />
            <StatsCard
              title="Equity"
              value={portfolio ? `$${fmtMoney(portfolio.totals.equity)}` : loading ? '...' : '-'}
              icon={<Sparkles className="w-5 h-5 text-[#00ff88]" />}
              change={portfolio ? `${portfolio.positions.length} active symbols` : 'No positions yet'}
              changePositive={Boolean(portfolio && portfolio.positions.length)}
            />
            <StatsCard
              title="Win rate"
              value={winRate != null ? `${Math.round(winRate * 100)}%` : loading ? '...' : '-'}
              icon={<Target className="w-5 h-5 text-[#00ccff]" />}
              change="Closed trades only"
              changePositive={Boolean((winRate ?? 0) >= 0.5)}
            />
            <StatsCard
              title="Hot streak"
              value={loading ? '...' : `${streak}`}
              icon={<Flame className="w-5 h-5 text-orange-400" />}
              change={streak > 0 ? 'Consecutive winning closes' : 'Start your streak'}
              changePositive={streak > 0}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <GlassCard className="p-6 xl:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl">Holdings</h2>
                <span className="text-xs text-gray-400">Power based on unrealized PnL</span>
              </div>
              <div className="space-y-3">
                {portfolio?.positions.length ? (
                  portfolio.positions.map((pos, idx) => {
                    const pnlPct =
                      pos.avgPrice > 0 ? ((pos.lastPrice - pos.avgPrice) / pos.avgPrice) * 100 : 0;
                    const power = Math.min(100, Math.max(5, Math.round(Math.abs(pnlPct) * 4)));
                    return (
                      <motion.div
                        key={pos.assetSymbol}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                        className="p-4 rounded-lg border border-white/10 bg-white/[0.03]"
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div>
                            <p className="text-lg">{pos.assetSymbol}</p>
                            <p className="text-xs text-gray-400">
                              Qty {pos.quantity} | Avg ${pos.avgPrice.toFixed(2)} | Last ${pos.lastPrice.toFixed(2)}
                            </p>
                          </div>
                          <p className={pnlPct >= 0 ? 'text-[#00ff88]' : 'text-[#ff0055]'}>
                            {pnlPct >= 0 ? '+' : ''}
                            {pnlPct.toFixed(2)}%
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Position power</span>
                            <span>{power}/100</span>
                          </div>
                          <Progress value={power} className="h-2 bg-white/10" />
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No live positions yet. Open a trade from dashboard to start.</p>
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-xl mb-4">Milestones</h2>
              <div className="space-y-4">
                {milestoneProgress.map((m) => (
                  <div key={m.id} className="p-3 rounded-lg border border-white/10 bg-white/[0.03]">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm">{m.title}</p>
                      <span className={m.done ? 'text-[#00ff88] text-xs' : 'text-gray-400 text-xs'}>
                        {m.done ? 'Unlocked' : `${m.current}/${m.need}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{m.hint}</p>
                    <Progress value={m.pct} className="h-2 bg-white/10" />
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
