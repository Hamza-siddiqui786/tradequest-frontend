import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { TrendingUp, User, Zap, Trophy, ChevronRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const avatars = [
  '🐂', '🐻', '🦅', '🦁', '🐺', '🦊', '🐯', '🦈', '🐉', '🦄'
];

const experienceLevels = [
  { id: 'beginner', label: 'Beginner', description: 'New to trading', icon: '📚' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some experience', icon: '📈' },
  { id: 'advanced', label: 'Advanced', description: 'Experienced trader', icon: '🚀' }
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [experience, setExperience] = useState('beginner');
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate('/game-mode');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#00ff88] rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#00ccff] rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <TrendingUp className="w-8 h-8 text-[#00ff88]" />
            <span className="text-2xl">TradeQuest</span>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    s === step
                      ? 'bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.5)]'
                      : s < step
                      ? 'bg-[#00ff88]/50 text-white'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-1 ${s < step ? 'bg-[#00ff88]/50' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>

          <GlassCard className="p-8" glow glowColor="green">
            {/* Step 1: Username */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <User className="w-16 h-16 text-[#00ff88] mx-auto mb-4" />
                  <h2 className="text-3xl mb-2">Choose Your Username</h2>
                  <p className="text-gray-400">This is how other traders will see you</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username" className="text-gray-300">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your trading name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-2 bg-white/5 border-white/10 focus:border-[#00ff88]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Avatar */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">{selectedAvatar}</div>
                  <h2 className="text-3xl mb-2">Pick Your Avatar</h2>
                  <p className="text-gray-400">Choose an icon that represents you</p>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`text-5xl p-4 rounded-lg transition-all ${
                        selectedAvatar === avatar
                          ? 'bg-[#00ff88]/20 shadow-[0_0_20px_rgba(0,255,136,0.3)] scale-110'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Experience Level */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <Zap className="w-16 h-16 text-[#00ff88] mx-auto mb-4" />
                  <h2 className="text-3xl mb-2">Select Experience Level</h2>
                  <p className="text-gray-400">Help us customize your learning journey</p>
                </div>

                <div className="space-y-4">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setExperience(level.id)}
                      className={`w-full p-6 rounded-lg transition-all text-left ${
                        experience === level.id
                          ? 'bg-[#00ff88]/20 border-2 border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                          : 'bg-white/5 border-2 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{level.icon}</div>
                        <div>
                          <h3 className="text-xl mb-1">{level.label}</h3>
                          <p className="text-gray-400">{level.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="mt-8 flex gap-4">
              {step > 1 && (
                <Button
                  onClick={() => setStep(step - 1)}
                  variant="outline"
                  className="flex-1 bg-white/5 border-white/10 hover:bg-white/10"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 bg-[#00ff88] text-black hover:bg-[#00ff88]/90 hover:shadow-[0_0_20px_rgba(0,255,136,0.5)]"
                disabled={step === 1 && !username.trim()}
              >
                {step === 3 ? 'Get Started' : 'Continue'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
