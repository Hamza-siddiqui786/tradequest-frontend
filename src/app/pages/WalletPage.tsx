import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Coins,
  Trophy,
  Gift,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatsCard } from '../components/StatsCard';
import { Navbar } from '../components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

type PortfolioRes = {
  wallet: { balance: number; currencyType: string };
  totals: { cash: number; unrealizedPnL: number; realizedPnL: number; equity: number };
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

export default function WalletPage() {
  const me = useAuthStore((s) => s.me);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const [p, setP] = useState<PortfolioRes | null>(null);
  const [history, setHistory] = useState<TradeHistRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [port, hist] = await Promise.all([
          apiFetch<PortfolioRes>('/portfolio'),
          apiFetch<TradeHistRow[]>('/trade/history?limit=40'),
        ]);
        setP(port);
        setHistory(hist);
        await fetchMe();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Wallet load failed');
      }
    })();
  }, [fetchMe]);

  const transactions = useMemo(() => {
    return history.map((t, i) => {
      const qty = Number(t.quantity);
      const entry = Number(t.entry_price);
      const exit = t.exit_price != null ? Number(t.exit_price) : null;
      let amount = 0;
      let label = `${t.order_type.toUpperCase()} ${t.asset_symbol}`;
      if (t.status === 'closed' && t.order_type === 'buy' && exit != null) {
        amount = (exit - entry) * qty;
        label = `Closed ${t.asset_symbol} lot`;
      } else if (t.status === 'open' && t.order_type === 'buy') {
        amount = -entry * qty;
        label = `Open buy ${t.asset_symbol}`;
      }
      return {
        id: i,
        type: amount >= 0 ? 'profit' : 'loss',
        description: label,
        amount,
        date: formatDistanceToNow(new Date(t.trade_timestamp), { addSuffix: true }),
        status: t.status,
      };
    });
  }, [history]);

  const balance = p?.wallet.balance ?? Number(me?.balance ?? 0);
  const realized = p?.totals.realizedPnL ?? 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 px-4 sm:px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-8">
              <h1 className="text-4xl mb-2 flex items-center gap-3">
                <Wallet className="w-10 h-10 text-[#00ff88]" />
                Wallet
              </h1>
              <p className="text-gray-400">Virtual cash + trade ledger from the API</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <GlassCard className="p-8" glow glowColor="green">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Virtual balance</p>
                    <h2 className="text-4xl sm:text-5xl text-[#00ff88] mb-2">
                      ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                    <div className="flex items-center gap-2 text-[#00ff88] text-sm">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Equity {p ? p.totals.equity.toFixed(2) : '—'}</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00ff88] to-[#00ccff] rounded-full flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-black" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Realized P&amp;L</p>
                    <p className={`text-xl ${realized >= 0 ? 'text-[#00ff88]' : 'text-[#ff0055]'}`}>
                      {realized >= 0 ? '+' : ''}
                      {realized.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Unrealized</p>
                    <p className="text-xl text-white">{p ? p.totals.unrealizedPnL.toFixed(2) : '—'}</p>
                  </div>
                </div>
              </GlassCard>

              <div className="grid grid-rows-2 gap-6">
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Experience</p>
                      <p className="text-3xl text-[#00ff88]">
                        {me ? Number(me.user.xp).toLocaleString() : '—'} XP
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-[#00ff88]/20 rounded-full flex items-center justify-center">
                      <Trophy className="w-7 h-7 text-[#00ff88]" />
                    </div>
                  </div>
                </GlassCard>
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">TradeCoins</p>
                      <p className="text-3xl text-yellow-400">—</p>
                    </div>
                    <div className="w-14 h-14 bg-yellow-400/20 rounded-full flex items-center justify-center">
                      <Coins className="w-7 h-7 text-yellow-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Placeholder — wire to economy service later</p>
                </GlassCard>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatsCard
                title="Cash"
                value={p ? `$${p.totals.cash.toFixed(2)}` : '—'}
                icon={<TrendingUp className="w-5 h-5 text-[#00ff88]" />}
                changePositive
              />
              <StatsCard
                title="Realized"
                value={`$${realized.toFixed(2)}`}
                icon={<ArrowUpRight className="w-5 h-5 text-[#00ff88]" />}
              />
              <StatsCard
                title="History rows"
                value={String(history.length)}
                icon={<Gift className="w-5 h-5 text-yellow-400" />}
              />
            </div>

            <Tabs defaultValue="transactions">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/5 mb-6">
                <TabsTrigger value="transactions" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="rewards" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
                  Info
                </TabsTrigger>
              </TabsList>
              <TabsContent value="transactions">
                <GlassCard className="p-6">
                  <h3 className="text-xl mb-6">History</h3>
                  <div className="space-y-3">
                    {transactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className="p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                transaction.amount >= 0 ? 'bg-[#00ff88]/20' : 'bg-[#ff0055]/20'
                              }`}
                            >
                              {transaction.amount >= 0 ? (
                                <ArrowUpRight className="w-5 h-5 text-[#00ff88]" />
                              ) : (
                                <ArrowDownRight className="w-5 h-5 text-[#ff0055]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate">{transaction.description}</p>
                              <p className="text-sm text-gray-400">{transaction.date}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={transaction.amount >= 0 ? 'text-[#00ff88]' : 'text-[#ff0055]'}>
                              {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                            </p>
                            <span className="text-xs text-gray-500">{transaction.status}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </TabsContent>
              <TabsContent value="rewards">
                <GlassCard className="p-6">
                  <h3 className="text-xl mb-4">Rewards</h3>
                  <p className="text-gray-400 text-sm">
                    Complete missions in-app to auto-grant XP. TradeCoins remain a future drop-in.
                  </p>
                </GlassCard>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
