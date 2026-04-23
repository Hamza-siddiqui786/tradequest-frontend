import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, DollarSign, Wallet, BarChart3, MessageSquare, Users } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatsCard } from '../components/StatsCard';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { MarketEventsPopup } from '../components/MarketEventsPopup';
import { Link } from 'react-router';
import { CandleChart } from '../components/charts/CandleChart';
import { apiFetch } from '../lib/api';
import { useMarketStore } from '../stores/marketStore';
import { TRADE_SYMBOLS } from '../lib/symbols';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

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

type OpenTradeRow = {
  id: number | string;
  asset_symbol: string;
  order_type: string;
  quantity: string;
  entry_price: string;
  stop_loss: string | null;
  status: string;
  trade_timestamp: string;
};

export default function TradingDashboard() {
  const selectedSymbol = useMarketStore((s) => s.selectedSymbol);
  const setSelectedSymbol = useMarketStore((s) => s.setSelectedSymbol);
  const quote = useMarketStore((s) => s.quotes[selectedSymbol]);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [showAICoach, setShowAICoach] = useState(true);
  const [showMarketEvent, setShowMarketEvent] = useState(false);
  const [amount, setAmount] = useState('10');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [portfolio, setPortfolio] = useState<PortfolioRes | null>(null);
  const [openTrades, setOpenTrades] = useState<OpenTradeRow[]>([]);
  const [winRate, setWinRate] = useState<number | null>(null);
  const [dashboardHydrated, setDashboardHydrated] = useState(false);

  const marketEvent = {
    id: '1',
    type: 'surge' as const,
    title: 'Volatility Watch',
    description: `${selectedSymbol} is updating live from the simulation engine.`,
    impact: 'Use limits and stops to stay disciplined as quotes refresh over WebSockets.',
    asset: selectedSymbol,
    change: quote != null ? `${quote.toFixed(2)}` : '—',
  };

  const refresh = useCallback(async () => {
    try {
      const [p, o, a] = await Promise.all([
        apiFetch<PortfolioRes>('/portfolio'),
        apiFetch<OpenTradeRow[]>('/trade/open'),
        apiFetch<{ trades: { winRate: number | null } }>('/analytics'),
      ]);
      setPortfolio(p);
      setOpenTrades(o);
      setWinRate(a.trades.winRate);
      await fetchMe();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not refresh dashboard');
    } finally {
      setDashboardHydrated(true);
    }
  }, [fetchMe]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const lastPx = quote ?? portfolio?.positions.find((x) => x.assetSymbol === selectedSymbol)?.lastPrice;
  const pctHint =
    lastPx && portfolio?.positions.find((x) => x.assetSymbol === selectedSymbol)?.avgPrice
      ? (((lastPx - (portfolio.positions.find((x) => x.assetSymbol === selectedSymbol)?.avgPrice ?? lastPx)) /
          (portfolio.positions.find((x) => x.assetSymbol === selectedSymbol)?.avgPrice || 1)) *
        100)
      : 0;

  const onSubmitOrder = async () => {
    const qty = Number(amount);
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error('Enter a valid quantity');
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch<{ mode: string; tradeIds?: number[]; orderId?: number }>('/trade', {
        method: 'POST',
        body: JSON.stringify({
          symbol: selectedSymbol,
          side: tradeType,
          kind: orderType,
          quantity: qty,
          limitPrice:
            orderType === 'limit' ? Number(limitPrice || 0) || undefined : undefined,
          stopTriggerPrice:
            orderType === 'stop' ? Number(stopPrice || 0) || undefined : undefined,
          stopLoss:
            tradeType === 'buy' && orderType === 'market' && stopLoss
              ? Number(stopLoss)
              : tradeType === 'buy' && orderType === 'market'
                ? null
                : undefined,
        }),
      });
      toast.success(orderType === 'market' ? 'Order executed' : 'Order queued');
      setAmount('10');
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Order failed');
    } finally {
      setSubmitting(false);
    }
  };

  const fmtMoney = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 px-4 sm:px-6 pb-12">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {!dashboardHydrated ? (
              [0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 h-[120px] animate-pulse"
                  aria-hidden
                />
              ))
            ) : portfolio ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <StatsCard
                    title="Equity"
                    value={`$${fmtMoney(portfolio.totals.equity)}`}
                    icon={<Wallet className="w-5 h-5 text-[#00ff88]" />}
                    change={`${portfolio.totals.unrealizedPnL >= 0 ? '+' : ''}$${fmtMoney(portfolio.totals.unrealizedPnL)} uPnL`}
                    changePositive={portfolio.totals.unrealizedPnL >= 0}
                    glow
                    glowColor="green"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.04 }}
                >
                  <StatsCard
                    title="Total P&L"
                    value={`${portfolio.totals.unrealizedPnL + portfolio.totals.realizedPnL >= 0 ? '+' : ''}$${fmtMoney(portfolio.totals.unrealizedPnL + portfolio.totals.realizedPnL)}`}
                    icon={<TrendingUp className="w-5 h-5 text-[#00ff88]" />}
                    change={`Realized $${fmtMoney(portfolio.totals.realizedPnL)}`}
                    changePositive={
                      portfolio.totals.unrealizedPnL + portfolio.totals.realizedPnL >= 0
                    }
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.08 }}
                >
                  <StatsCard
                    title="Win rate"
                    value={winRate != null ? `${Math.round(winRate * 100)}%` : '—'}
                    icon={<BarChart3 className="w-5 h-5 text-[#00ff88]" />}
                    change="Closed trades"
                    changePositive
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.12 }}
                >
                  <StatsCard
                    title="Open trades"
                    value={String(openTrades.length)}
                    icon={<DollarSign className="w-5 h-5 text-[#00ff88]" />}
                  />
                </motion.div>
              </>
            ) : (
              <>
                <StatsCard
                  title="Equity"
                  value="—"
                  icon={<Wallet className="w-5 h-5 text-[#00ff88]" />}
                  glow
                  glowColor="green"
                />
                <StatsCard
                  title="Total P&L"
                  value="—"
                  icon={<TrendingUp className="w-5 h-5 text-[#00ff88]" />}
                />
                <StatsCard
                  title="Win rate"
                  value="—"
                  icon={<BarChart3 className="w-5 h-5 text-[#00ff88]" />}
                  change="Closed trades"
                  changePositive
                />
                <StatsCard
                  title="Open trades"
                  value="—"
                  icon={<DollarSign className="w-5 h-5 text-[#00ff88]" />}
                />
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Link to="/shadow-mode" className="flex-1">
              <GlassCard className="p-4 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#00ff88]" />
                  <div>
                    <p className="text-sm">Compare with Experts</p>
                    <p className="text-xs text-gray-400">Shadow Mode</p>
                  </div>
                </div>
              </GlassCard>
            </Link>
            <button type="button" onClick={() => setShowMarketEvent(true)} className="flex-1">
              <GlassCard className="p-4 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm">Live market note</p>
                    <p className="text-xs text-gray-400">Simulation feed</p>
                  </div>
                </div>
              </GlassCard>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h2 className="text-2xl">{selectedSymbol}</h2>
                    <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                      <SelectTrigger className="w-[160px] bg-white/5 border-white/10">
                        <SelectValue placeholder="Symbol" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a1628] border-white/10">
                        {TRADE_SYMBOLS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl sm:text-3xl text-[#00ff88]">
                      {lastPx != null ? `$${lastPx.toFixed(4)}` : '—'}
                    </span>
                    <span className={`text-lg ${pctHint >= 0 ? 'text-[#00ff88]' : 'text-[#ff0055]'}`}>
                      {portfolio?.positions.some((p) => p.assetSymbol === selectedSymbol)
                        ? `${pctHint >= 0 ? '+' : ''}${pctHint.toFixed(2)}% vs avg`
                        : 'no position'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  {['1H', '4H', '1D', '1W'].map((t) => (
                    <Button
                      key={t}
                      variant="outline"
                      size="sm"
                      type="button"
                      className={`bg-white/5 border-white/10 ${t === '1D' ? 'bg-[#00ff88] text-black border-transparent' : ''}`}
                    >
                      {t}
                    </Button>
                  ))}
                </div>

                <CandleChart symbol={selectedSymbol} height={340} />
              </GlassCard>

              <GlassCard className="p-4 sm:p-6">
                <h3 className="text-xl mb-4">Open positions (lots)</h3>
                <div className="space-y-3">
                  {openTrades.length === 0 && (
                    <p className="text-gray-500 text-sm">No open buy lots. Place a buy to open risk.</p>
                  )}
                  {openTrades.map((trade) => {
                    const entry = Number(trade.entry_price);
                    const q = Number(trade.quantity);
                    const px = quote ?? lastPx ?? entry;
                    const pnl = (px - entry) * q;
                    const pnlPct = entry ? ((px - entry) / entry) * 100 : 0;
                    return (
                      <div
                        key={`${trade.id}-${trade.trade_timestamp}`}
                        className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-4">
                            <div
                              className={`px-3 py-1 rounded text-sm ${
                                trade.order_type === 'buy'
                                  ? 'bg-[#00ff88]/20 text-[#00ff88]'
                                  : 'bg-[#ff0055]/20 text-[#ff0055]'
                              }`}
                            >
                              {trade.order_type}
                            </div>
                            <div>
                              <p className="text-lg">{trade.asset_symbol}</p>
                              <p className="text-sm text-gray-400">
                                Entry ${entry.toFixed(4)} • Qty {q}
                              </p>
                              {trade.stop_loss && (
                                <p className="text-xs text-yellow-300/90">Stop {trade.stop_loss}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className={`text-lg ${pnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff0055]'}`}>
                              {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                            </p>
                            <p className={`text-sm ${pnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff0055]'}`}>
                              {pnl >= 0 ? '+' : ''}
                              {pnlPct.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>

            <div className="space-y-6">
              <GlassCard className="p-6" glow glowColor="green">
                <h3 className="text-xl mb-6">Place order</h3>

                <Tabs
                  value={tradeType}
                  onValueChange={(v) => setTradeType(v as 'buy' | 'sell')}
                  className="mb-6"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-white/5">
                    <TabsTrigger
                      value="buy"
                      className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black"
                    >
                      Buy
                    </TabsTrigger>
                    <TabsTrigger
                      value="sell"
                      className="data-[state=active]:bg-[#ff0055] data-[state=active]:text-white"
                    >
                      Sell
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-4 mb-6">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => setOrderType('market')}
                      className={orderType === 'market' ? 'bg-white/20' : 'bg-white/5'}
                      variant="outline"
                    >
                      Market
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => setOrderType('limit')}
                      className={orderType === 'limit' ? 'bg-white/20' : 'bg-white/5'}
                      variant="outline"
                    >
                      Limit
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => setOrderType('stop')}
                      className={orderType === 'stop' ? 'bg-white/20' : 'bg-white/5'}
                      variant="outline"
                    >
                      Stop
                    </Button>
                  </div>

                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="mt-2 bg-white/5 border-white/10"
                    />
                  </div>

                  {orderType === 'limit' && (
                    <div>
                      <Label>Limit price</Label>
                      <Input
                        type="number"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        className="mt-2 bg-white/5 border-white/10"
                      />
                    </div>
                  )}

                  {orderType === 'stop' && (
                    <div>
                      <Label>Stop trigger</Label>
                      <Input
                        type="number"
                        value={stopPrice}
                        onChange={(e) => setStopPrice(e.target.value)}
                        className="mt-2 bg-white/5 border-white/10"
                      />
                    </div>
                  )}

                  {tradeType === 'buy' && orderType === 'market' && (
                    <div>
                      <Label>Stop loss (optional)</Label>
                      <Input
                        type="number"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        placeholder="Protect downside"
                        className="mt-2 bg-white/5 border-white/10"
                      />
                    </div>
                  )}
                </div>

                <Button
                  asChild
                  disabled={submitting}
                  className={`w-full ${
                    tradeType === 'buy'
                      ? 'bg-[#00ff88] text-black hover:bg-[#00ff88]/90'
                      : 'bg-[#ff0055] text-white hover:bg-[#ff0055]/90'
                  }`}
                >
                  <motion.button
                    type="button"
                    disabled={submitting}
                    onClick={() => void onSubmitOrder()}
                    whileTap={submitting ? undefined : { scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 28 }}
                  >
                    {submitting ? 'Submitting…' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${selectedSymbol}`}
                  </motion.button>
                </Button>
              </GlassCard>

              {showAICoach && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <GlassCard className="p-6" glow glowColor="blue">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-[#00ff88]" />
                        <h3 className="text-lg">Coach (live)</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAICoach(false)}
                        className="text-gray-400 hover:text-white"
                        aria-label="Close"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3 text-sm text-gray-300">
                      <div className="p-3 bg-[#00ff88]/10 rounded-lg border border-[#00ff88]/30">
                        <p className="text-[#00ff88] mb-1">Tape</p>
                        <p>
                          {lastPx != null
                            ? `${selectedSymbol} last ${lastPx.toFixed(4)} — size limits with virtual cash.`
                            : 'Connect the backend WebSocket stream to watch the tape populate.'}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <p className="text-blue-400 mb-1">Suggestion</p>
                        <p>
                          {orderType === 'market' && tradeType === 'buy' && !stopLoss
                            ? 'Consider adding a stop-loss on momentum buys to improve discipline scoring.'
                            : 'Use limit orders near the last swing to reduce FOMO entries.'}
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                        <p className="text-yellow-400 mb-1">Risk</p>
                        <p>
                          Simulator uses FIFO sells against your open buy lots — partial closes are supported
                          server-side.
                        </p>
                      </div>
                    </div>
                    <Link to="/ai-coach" className="mt-4 inline-block text-xs text-[#00ccff] hover:underline">
                      Open full AI Coach →
                    </Link>
                  </GlassCard>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MarketEventsPopup
        isOpen={showMarketEvent}
        onClose={() => setShowMarketEvent(false)}
        event={marketEvent}
      />
    </div>
  );
}
