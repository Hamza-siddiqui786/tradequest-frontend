import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Crown, Target, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const comparisonData = [
  { time: '9:00', yourTrade: 100, expertTrade: 100 },
  { time: '9:30', yourTrade: 98, expertTrade: 102 },
  { time: '10:00', yourTrade: 95, expertTrade: 108 },
  { time: '10:30', yourTrade: 92, expertTrade: 112 },
  { time: '11:00', yourTrade: 97, expertTrade: 115 },
  { time: '11:30', yourTrade: 103, expertTrade: 118 },
  { time: '12:00', yourTrade: 101, expertTrade: 125 }
];

const tradeComparisons = [
  {
    id: 1,
    asset: 'BTC/USD',
    yourEntry: 42100,
    expertEntry: 41950,
    yourExit: 42380,
    expertExit: 42650,
    yourProfit: 280,
    expertProfit: 700,
    yourTiming: 'Good',
    expertTiming: 'Excellent',
    mistakes: ['Entered too early', 'Exited too early'],
    lessons: 'Expert waited for stronger confirmation signal before entry and held for higher profit target.'
  },
  {
    id: 2,
    asset: 'ETH/USD',
    yourEntry: 2250,
    expertEntry: null,
    yourExit: 2245,
    expertExit: null,
    yourProfit: -5,
    expertProfit: 0,
    yourTiming: 'Poor',
    expertTiming: 'Avoided',
    mistakes: ['Traded against trend', 'No stop-loss'],
    lessons: 'Expert avoided this trade due to weak market conditions and unfavorable risk/reward ratio.'
  },
  {
    id: 3,
    asset: 'AAPL',
    yourEntry: 178.25,
    expertEntry: 178.10,
    yourExit: 179.50,
    expertExit: 179.45,
    yourProfit: 1.25,
    expertProfit: 1.35,
    yourTiming: 'Excellent',
    expertTiming: 'Excellent',
    mistakes: [],
    lessons: 'Great execution! Both trades were nearly identical with excellent timing and exit points.'
  }
];

const insights = [
  { 
    type: 'mistake',
    title: 'Early Entry Pattern',
    description: 'You tend to enter trades 2-3% before optimal entry points. Wait for stronger confirmation.',
    impact: '-$420 this week',
    severity: 'high'
  },
  {
    type: 'mistake',
    title: 'Premature Exits',
    description: 'You exit winning trades too early, leaving 30% of potential profits on the table.',
    impact: '-$680 missed profit',
    severity: 'medium'
  },
  {
    type: 'opportunity',
    title: 'Missed High-Probability Setups',
    description: 'Expert identified 4 high-probability trades you missed this week.',
    impact: '+$950 potential',
    severity: 'medium'
  },
  {
    type: 'strength',
    title: 'Good Risk Management',
    description: 'Your stop-loss placement is on par with expert traders. Keep it up!',
    impact: 'Protected $340',
    severity: 'low'
  }
];

export default function ShadowModePage() {
  const [selectedComparison, setSelectedComparison] = useState(tradeComparisons[0]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl mb-2 flex items-center gap-3">
                <Users className="w-10 h-10 text-[#00ff88]" />
                Shadow Mode
              </h1>
              <p className="text-gray-400">Compare your trades with expert traders and learn from the best</p>
            </div>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <GlassCard className="p-6" glow glowColor="green">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Your Performance</p>
                  <TrendingUp className="w-5 h-5 text-[#00ff88]" />
                </div>
                <p className="text-3xl text-[#00ff88] mb-1">+$820</p>
                <p className="text-sm text-gray-400">This week</p>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Expert Performance</p>
                  <Crown className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-3xl text-yellow-400 mb-1">+$2,485</p>
                <p className="text-sm text-gray-400">Same period</p>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Gap</p>
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-3xl text-blue-400 mb-1">67%</p>
                <p className="text-sm text-gray-400">Performance ratio</p>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Improvement</p>
                  <TrendingUp className="w-5 h-5 text-[#00ff88]" />
                </div>
                <p className="text-3xl text-[#00ff88] mb-1">+15%</p>
                <p className="text-sm text-gray-400">vs last week</p>
              </GlassCard>
            </div>

            {/* Performance Chart */}
            <GlassCard className="p-6 mb-8">
              <h2 className="text-2xl mb-6">Performance Comparison</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="time" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0a1628', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="yourTrade" 
                      stroke="#00ccff" 
                      strokeWidth={2}
                      name="Your Trade"
                      dot={{ fill: '#00ccff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expertTrade" 
                      stroke="#fbbf24" 
                      strokeWidth={2}
                      name="Expert Trade"
                      dot={{ fill: '#fbbf24' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-8 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#00ccff] rounded-full" />
                  <span className="text-sm text-gray-400">Your Trade</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                  <span className="text-sm text-gray-400">Expert Trade</span>
                </div>
              </div>
            </GlassCard>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Trade Comparisons */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl">Side-by-Side Trade Analysis</h2>
                
                {tradeComparisons.map((trade, index) => (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <GlassCard 
                      className="p-6 cursor-pointer hover:shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all"
                      onClick={() => setSelectedComparison(trade)}
                      glow={selectedComparison.id === trade.id}
                      glowColor="green"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="text-2xl mb-2">{trade.asset}</h3>
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              trade.yourProfit >= 0 ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-[#ff0055]/20 text-[#ff0055]'
                            }`}>
                              Your: {trade.yourProfit >= 0 ? '+' : ''}${trade.yourProfit}
                            </Badge>
                            {trade.expertEntry && (
                              <Badge className="bg-yellow-400/20 text-yellow-400">
                                Expert: +${trade.expertProfit}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-6 h-6 text-gray-400" />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* Your Trade */}
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-[#00ccff] rounded-full" />
                            <h4 className="text-sm text-gray-400">Your Trade</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Entry:</span>
                              <span>${trade.yourEntry}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Exit:</span>
                              <span>${trade.yourExit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Timing:</span>
                              <span className={
                                trade.yourTiming === 'Excellent' ? 'text-[#00ff88]' :
                                trade.yourTiming === 'Good' ? 'text-blue-400' :
                                'text-[#ff0055]'
                              }>{trade.yourTiming}</span>
                            </div>
                          </div>
                        </div>

                        {/* Expert Trade */}
                        <div className="p-4 bg-white/5 rounded-lg border border-yellow-400/30">
                          <div className="flex items-center gap-2 mb-3">
                            <Crown className="w-4 h-4 text-yellow-400" />
                            <h4 className="text-sm text-gray-400">Expert Trade</h4>
                          </div>
                          {trade.expertEntry ? (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Entry:</span>
                                <span>${trade.expertEntry}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Exit:</span>
                                <span>${trade.expertExit}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Timing:</span>
                                <span className="text-yellow-400">{trade.expertTiming}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400">Expert avoided this trade</p>
                          )}
                        </div>
                      </div>

                      {/* Mistakes & Lessons */}
                      {trade.mistakes.length > 0 && (
                        <div className="mb-4 p-3 bg-[#ff0055]/10 border border-[#ff0055]/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-4 h-4 text-[#ff0055]" />
                            <h5 className="text-sm text-[#ff0055]">Mistakes</h5>
                          </div>
                          <ul className="space-y-1">
                            {trade.mistakes.map((mistake, i) => (
                              <li key={i} className="text-sm text-gray-300 pl-4">• {mistake}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="p-3 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-[#00ff88]" />
                          <h5 className="text-sm text-[#00ff88]">Lesson</h5>
                        </div>
                        <p className="text-sm text-gray-300">{trade.lessons}</p>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>

              {/* Insights Sidebar */}
              <div className="space-y-6">
                <h2 className="text-2xl">Key Insights</h2>

                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <GlassCard 
                      className={`p-6 border ${
                        insight.type === 'mistake' ? 'border-[#ff0055]/30' :
                        insight.type === 'opportunity' ? 'border-blue-400/30' :
                        'border-[#00ff88]/30'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {insight.type === 'mistake' ? (
                          <AlertTriangle className="w-5 h-5 text-[#ff0055] mt-1" />
                        ) : insight.type === 'opportunity' ? (
                          <Target className="w-5 h-5 text-blue-400 mt-1" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-[#00ff88] mt-1" />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg mb-2">{insight.title}</h3>
                          <p className="text-sm text-gray-300 mb-3">{insight.description}</p>
                          <div className={`text-sm px-3 py-1 rounded inline-block ${
                            insight.type === 'mistake' ? 'bg-[#ff0055]/20 text-[#ff0055]' :
                            insight.type === 'opportunity' ? 'bg-blue-400/20 text-blue-400' :
                            'bg-[#00ff88]/20 text-[#00ff88]'
                          }`}>
                            {insight.impact}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}

                {/* Action Card */}
                <GlassCard className="p-6" glow glowColor="green">
                  <h3 className="text-lg mb-4">Want to Improve?</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Get personalized coaching sessions based on your Shadow Mode analysis
                  </p>
                  <Button className="w-full bg-[#00ff88] text-black hover:bg-[#00ff88]/90">
                    Book AI Coaching
                  </Button>
                </GlassCard>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
