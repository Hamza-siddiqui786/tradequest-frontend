import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, DollarSign, Target, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatsCard } from '../components/StatsCard';
import { Navbar } from '../components/Navbar';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';

type AnalyticsData = {
  trades: {
    total: number;
    buys: number;
    sells: number;
    openPositions: number;
    closedRoundTrips: number;
    winRate: number | null;
  };
  behavior30d: Array<{ action_type: string; count: number; avg_confidence: string | null }>;
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

export default function AnalyticsPage() {
  const [a, setA] = useState<AnalyticsData | null>(null);
  const [history, setHistory] = useState<TradeHistRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [an, hi] = await Promise.all([
          apiFetch<AnalyticsData>('/analytics'),
          apiFetch<TradeHistRow[]>('/trade/history?limit=60'),
        ]);
        setA(an);
        setHistory(hi);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Analytics failed');
      }
    })();
  }, []);

  const cumulative = useMemo(() => {
    let acc = 0;
    const closed = history.filter((t) => t.status === 'closed' && t.order_type === 'buy' && t.exit_price);
    const chronological = [...closed].reverse();
    return chronological.map((t, i) => {
      const qty = Number(t.quantity);
      const e = Number(t.entry_price);
      const x = Number(t.exit_price);
      const pnl = (x - e) * qty;
      acc += pnl;
      return { day: `T${i + 1}`, profit: pnl, cumulative: acc };
    });
  }, [history]);

  const pie = useMemo(() => {
    const wr = a?.trades.winRate;
    if (wr == null) return [
      { name: 'Wins', value: 50, color: '#00ff88' },
      { name: 'Losses', value: 50, color: '#ff0055' },
    ];
    const w = Math.round(wr * 100);
    return [
      { name: 'Wins', value: w, color: '#00ff88' },
      { name: 'Losses', value: 100 - w, color: '#ff0055' },
    ];
  }, [a]);

  const byAsset = useMemo(() => {
      const map = new Map<string, { trades: number; pnl: number; wins: number; closed: number }>();
      for (const t of history) {
        if (t.status !== 'closed' || t.order_type !== 'buy' || !t.exit_price) continue;
        const sym = t.asset_symbol;
        const qty = Number(t.quantity);
        const pnl = (Number(t.exit_price) - Number(t.entry_price)) * qty;
        const cur = map.get(sym) ?? { trades: 0, pnl: 0, wins: 0, closed: 0 };
        cur.closed += 1;
        cur.trades += 1;
        cur.pnl += pnl;
        if (pnl > 0) cur.wins += 1;
        map.set(sym, cur);
      }
      return [...map.entries()].map(([asset, v]) => ({
        asset,
        trades: v.trades,
        profit: v.pnl,
        winRate: v.closed ? Math.round((v.wins / v.closed) * 100) : 0,
      }));
  }, [history]);

  const closedPnL = cumulative.length ? cumulative[cumulative.length - 1].cumulative : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 px-4 sm:px-6 pb-12">
        <div className="max-w-[1800px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-8">
              <h1 className="text-4xl mb-2">Performance analytics</h1>
              <p className="text-gray-400">Built from your simulation history</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              <StatsCard
                title="Realized (closed lots)"
                value={`$${closedPnL.toFixed(2)}`}
                icon={<DollarSign className="w-5 h-5 text-[#00ff88]" />}
                change={closedPnL >= 0 ? 'Positive drift' : 'Drawdown'}
                changePositive={closedPnL >= 0}
                glow
                glowColor="green"
              />
              <StatsCard
                title="Win rate"
                value={a?.trades.winRate != null ? `${Math.round(a.trades.winRate * 100)}%` : '—'}
                icon={<Target className="w-5 h-5 text-[#00ff88]" />}
                change="Closed round-trips"
                changePositive
              />
              <StatsCard
                title="Total trades"
                value={a ? String(a.trades.total) : '—'}
                icon={<BarChart3 className="w-5 h-5 text-blue-400" />}
                change={`Open ${a?.trades.openPositions ?? 0}`}
                changePositive
              />
              <StatsCard
                title="Behavior signals (30d)"
                value={String(a?.behavior30d?.length ?? 0)}
                icon={<TrendingUp className="w-5 h-5 text-[#00ff88]" />}
                change="Logged patterns"
                changePositive
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <GlassCard className="p-6 h-full">
                  <h3 className="text-xl mb-6">Cumulative realized P&amp;L</h3>
                  <div className="h-80">
                    {cumulative.length === 0 ? (
                      <p className="text-gray-500 text-sm">Close positions to build this curve.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={cumulative}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="day" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0a1628',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                            }}
                          />
                          <Line type="monotone" dataKey="cumulative" stroke="#00ff88" strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </GlassCard>
              </div>

              <GlassCard className="p-6" glow glowColor="green">
                <h3 className="text-xl mb-6">Win / loss split</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pie}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <h3 className="text-xl mb-6">Asset performance (closed)</h3>
                <div className="space-y-3">
                  {byAsset.length === 0 && <p className="text-gray-500 text-sm">No closed trades yet.</p>}
                  {byAsset.map((asset) => (
                    <div key={asset.asset} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg">{asset.asset}</h4>
                        <div
                          className={`flex items-center gap-1 ${asset.profit >= 0 ? 'text-[#00ff88]' : 'text-[#ff0055]'}`}
                        >
                          {asset.profit >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          <span className="font-medium">${Math.abs(asset.profit).toFixed(2)}</span>
                        </div>
                      </div>
                      Trades {asset.trades} • Win {asset.winRate}%
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-xl mb-6">Trade activity</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { label: 'Buys', n: a?.trades.buys ?? 0 },
                        { label: 'Sells', n: a?.trades.sells ?? 0 },
                        { label: 'Open', n: a?.trades.openPositions ?? 0 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="label" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a1628',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="n" fill="#00ff88" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
