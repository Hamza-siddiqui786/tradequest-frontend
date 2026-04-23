import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, TrendingUp, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Navbar } from '../components/Navbar';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { apiFetch } from '../lib/api';
import { useMarketStore } from '../stores/marketStore';
import { TRADE_SYMBOLS } from '../lib/symbols';
import { toast } from 'sonner';

type AnalyticsData = {
  trades: { total: number; winRate: number | null };
  behavior30d: Array<{ action_type: string; count: number }>;
};

type CoachMsg = {
  id: string;
  type: 'analysis' | 'warning' | 'suggestion' | 'success';
  title: string;
  content: string;
  icon: typeof TrendingUp;
  color: 'green' | 'yellow' | 'blue';
};

export default function AICoachPage() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'coach'; text: string }[]>([]);
  const [a, setA] = useState<AnalyticsData | null>(null);
  const selectedSymbol = useMarketStore((s) => s.selectedSymbol);
  const price = useMarketStore((s) => s.quotes[s.selectedSymbol]);

  useEffect(() => {
    (async () => {
      try {
        setA(await apiFetch<AnalyticsData>('/analytics'));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Coach data failed');
      }
    })();
  }, []);

  const coachFeed = useMemo((): CoachMsg[] => {
    const rows = a?.behavior30d ?? [];
    const msgs: CoachMsg[] = [];
    for (const r of rows) {
      const t = r.action_type;
      if (t === 'overtrade') {
        msgs.push({
          id: t + r.count,
          type: 'warning',
          title: 'Tempo check',
          content: `Overtrading signal logged ${r.count}× recently — cool-down between clips.`,
          icon: AlertTriangle,
          color: 'yellow',
        });
      } else if (t === 'FOMO') {
        msgs.push({
          id: t + r.count,
          type: 'suggestion',
          title: 'Impulse guard',
          content: `FOMO pattern ×${r.count}. Prefer limits at structure after impulse candles.`,
          icon: Lightbulb,
          color: 'blue',
        });
      } else if (t === 'disciplined_trade') {
        msgs.push({
          id: t + r.count,
          type: 'success',
          title: 'Discipline streak',
          content: `Great — ${r.count} disciplined tags recorded.`,
          icon: CheckCircle2,
          color: 'green',
        });
      } else {
        msgs.push({
          id: t + r.count,
          type: 'analysis',
          title: t.replace(/_/g, ' '),
          content: `Observed ${r.count} instances in the rolling window.`,
          icon: TrendingUp,
          color: 'green',
        });
      }
    }
    if (msgs.length === 0) {
      msgs.push({
        id: 'default',
        type: 'suggestion',
        title: 'Simulation online',
        content: `Watch ${selectedSymbol} (${price?.toFixed(4) ?? 'live'}) and journal intent before market clicks.`,
        icon: Lightbulb,
        color: 'blue',
      });
    }
    return msgs.slice(0, 8);
  }, [a, selectedSymbol, price]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setChat((c) => [...c, { role: 'user', text: message.trim() }]);
    setMessage('');
    const sym = TRADE_SYMBOLS[0];
    setTimeout(() => {
      setChat((c) => [
        ...c,
        {
          role: 'coach',
          text: `Rules engine: size small on ${sym}, respect stops, and let the WS tape confirm continuation.`,
        },
      ]);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 px-4 sm:px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-8">
              <h1 className="text-4xl mb-2 flex items-center gap-3">
                <Bot className="w-10 h-10 text-[#00ff88]" />
                AI coach
              </h1>
              <p className="text-gray-400">
                Live suggestions from behavior analytics + rule-based playbooks (LLM-ready hook)
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <GlassCard className="p-6 min-h-[520px] flex flex-col" glow glowColor="green">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00ff88] to-[#00ccff] rounded-full flex items-center justify-center">
                      <Bot className="w-6 h-6 text-black shrink-0" />
                    </div>
                    <div>
                      <h2 className="text-xl">Signals desk</h2>
                      <p className="text-sm text-gray-400">Updated from /analytics</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 mb-6 max-h-[340px] pr-1">
                    {coachFeed.map((msg, index) => {
                      const Icon = msg.icon;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: index * 0.04 }}
                          className={`p-4 rounded-lg border ${
                            msg.color === 'green'
                              ? 'bg-[#00ff88]/10 border-[#00ff88]/30'
                              : msg.color === 'yellow'
                                ? 'bg-yellow-500/10 border-yellow-500/30'
                                : 'bg-blue-500/10 border-blue-500/30'
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-1">
                            <Icon
                              className={`w-5 h-5 mt-1 shrink-0 ${
                                msg.color === 'green'
                                  ? 'text-[#00ff88]'
                                  : msg.color === 'yellow'
                                    ? 'text-yellow-400'
                                    : 'text-blue-400'
                              }`}
                            />
                            <div>
                              <h4 className="font-medium">{msg.title}</h4>
                              <p className="text-sm text-gray-300">{msg.content}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {chat.map((m, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-white/10 ml-8' : 'bg-[#00ff88]/10 mr-8'}`}
                      >
                        {m.text}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask about risk, sizing, or setups…"
                      className="flex-1 bg-white/5 border-white/10"
                    />
                    <Button type="submit" className="bg-[#00ff88] text-black hover:bg-[#00ff88]/90 shrink-0">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </GlassCard>
              </div>

              <div className="space-y-6">
                <GlassCard className="p-6" glow glowColor="blue">
                  <h3 className="text-lg mb-4">Session stats</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trades</span>
                      <span className="text-[#00ff88]">{a?.trades.total ?? '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win rate</span>
                      <span className="text-blue-400">
                        {a?.trades.winRate != null ? `${Math.round(a.trades.winRate * 100)}%` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tape</span>
                      <span>{selectedSymbol} @ {price?.toFixed(4) ?? '…'}</span>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#00ff88] rounded-full animate-pulse" />
                    <div>
                      <p className="text-sm">Coach linked</p>
                      <p className="text-xs text-gray-400">Behavior stream + chat scratchpad</p>
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
