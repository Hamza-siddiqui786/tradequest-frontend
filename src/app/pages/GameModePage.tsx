import { Link } from 'react-router';
import { motion } from 'motion/react';
import { BookOpen, TrendingUp, Target, Trophy, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Navbar } from '../components/Navbar';

const gameModes = [
  {
    id: 'story',
    title: 'Story Mode',
    description: 'Learn trading fundamentals through guided missions and challenges. Perfect for beginners.',
    icon: <BookOpen className="w-12 h-12" />,
    color: 'blue',
    badge: 'Recommended',
    route: '/missions'
  },
  {
    id: 'free',
    title: 'Free Trading',
    description: 'Practice trading without restrictions. Experiment with strategies in a sandbox environment.',
    icon: <TrendingUp className="w-12 h-12" />,
    color: 'green',
    route: '/dashboard'
  },
  {
    id: 'challenge',
    title: 'Challenge Mode',
    description: 'Compete in daily and weekly challenges. Climb the leaderboard and earn exclusive rewards.',
    icon: <Trophy className="w-12 h-12" />,
    color: 'red',
    badge: 'Competitive',
    route: '/leaderboard'
  }
];

export default function GameModePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-32 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl mb-4">Choose Your Path</h1>
            <p className="text-xl text-gray-400">Select a game mode to begin your trading journey</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {gameModes.map((mode, index) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={mode.route}>
                  <GlassCard 
                    className="p-8 h-full hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all transform hover:scale-105 cursor-pointer group"
                    glow={false}
                  >
                    <div className="relative">
                      {mode.badge && (
                        <div className="absolute -top-4 -right-4 bg-[#00ff88] text-black px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {mode.badge}
                        </div>
                      )}
                      
                      <div className={`mb-6 text-[#00ff88] group-hover:scale-110 transition-transform`}>
                        {mode.icon}
                      </div>
                      
                      <h2 className="text-2xl mb-3">{mode.title}</h2>
                      <p className="text-gray-400 mb-6">{mode.description}</p>
                      
                      <div className="flex items-center text-[#00ff88] group-hover:gap-3 gap-2 transition-all">
                        <span>Start Mode</span>
                        <Target className="w-4 h-4" />
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 text-center"
          >
            <GlassCard className="p-6 inline-block">
              <p className="text-gray-400">
                💡 You can switch between modes anytime from the dashboard
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
