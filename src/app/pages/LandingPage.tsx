import { Link } from 'react-router';
import { motion } from 'motion/react';
import { TrendingUp, Brain, Trophy, LineChart, Zap, Target, Shield } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Navbar } from '../components/Navbar';
import { useEffect, useRef } from 'react';

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const points: Array<{ x: number; y: number; baseY: number }> = [];
    const numPoints = 100;

    for (let i = 0; i < numPoints; i++) {
      const x = (canvas.width / numPoints) * i;
      const y = canvas.height / 2 + Math.random() * 100 - 50;
      points.push({ x, y, baseY: y });
    }

    let animationId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw candlestick-like bars
      for (let i = 0; i < points.length - 1; i++) {
        const point = points[i];
        const nextPoint = points[i + 1];
        
        // Animate y position
        point.y = point.baseY + Math.sin(time + i * 0.1) * 30;
        
        // Draw line
        ctx.strokeStyle = point.y < point.baseY ? '#ff0055' : '#00ff88';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(nextPoint.x, nextPoint.y);
        ctx.stroke();
        
        // Draw point
        ctx.fillStyle = point.y < point.baseY ? '#ff0055' : '#00ff88';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      time += 0.02;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 z-0 opacity-20"
      />
      
      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl mb-6 bg-gradient-to-r from-[#00ff88] to-[#00ccff] bg-clip-text text-transparent">
              Master Trading
            </h1>
            <h2 className="text-4xl md:text-6xl mb-8">
              Risk-Free
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Learn to trade like a pro with our gamified platform. Practice with real market data, 
              get AI-powered coaching, and compete with traders worldwide—all with virtual currency.
            </p>
            <Link 
              to="/auth"
              className="inline-block px-12 py-4 bg-[#00ff88] text-black text-lg rounded-lg hover:shadow-[0_0_30px_rgba(0,255,136,0.6)] transition-all transform hover:scale-105"
            >
              Start Trading Simulation
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Everything You Need to Learn Trading
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="w-8 h-8 text-[#00ff88]" />}
              title="AI Trading Coach"
              description="Get real-time feedback on your trades and personalized learning suggestions from our AI coach."
            />
            <FeatureCard
              icon={<LineChart className="w-8 h-8 text-[#00ff88]" />}
              title="Real Market Data"
              description="Practice with actual market data simulation. Learn how real traders make decisions."
            />
            <FeatureCard
              icon={<Trophy className="w-8 h-8 text-[#00ff88]" />}
              title="Global Leaderboard"
              description="Compete with traders worldwide. Track your progress and see how you stack up."
            />
            <FeatureCard
              icon={<Target className="w-8 h-8 text-[#00ff88]" />}
              title="Mission System"
              description="Complete challenges and quests to earn XP, unlock achievements, and level up your skills."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-[#00ff88]" />}
              title="Psychology Tracking"
              description="Monitor your trading psychology. Understand your emotional patterns and improve discipline."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-[#00ff88]" />}
              title="Risk-Free Learning"
              description="No real money at risk. Learn, experiment, and make mistakes without financial consequences."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <GlassCard className="p-12" glow glowColor="green">
            <h2 className="text-4xl mb-6">Ready to Start Your Trading Journey?</h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of traders who are learning to trade with confidence.
            </p>
            <Link 
              to="/auth"
              className="inline-block px-12 py-4 bg-[#00ff88] text-black text-lg rounded-lg hover:shadow-[0_0_30px_rgba(0,255,136,0.6)] transition-all"
            >
              Get Started Free
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>&copy; 2026 TradeQuest. Practice trading with virtual currency.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="p-8 h-full hover:shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl mb-3">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </GlassCard>
    </motion.div>
  );
}
