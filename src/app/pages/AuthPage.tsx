import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { TrendingUp, Mail, Lock, User as UserIcon } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { API } from '../lib/config';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

async function parseApiResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) {
    return { ok: false, error: { message: 'Empty response from server' } } as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return { ok: false, error: { message: 'Invalid response from server' } } as T;
  }
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await fetch(API('/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const json = await parseApiResponse<{
          ok: boolean;
          data?: { userId: number; accessToken: string; refreshToken: string };
          error?: { message?: string };
        }>(res);
        if (!json.ok || !json.data) {
          throw new Error(json.error?.message ?? 'Login failed');
        }
        setSession({
          userId: json.data.userId,
          accessToken: json.data.accessToken,
          refreshToken: json.data.refreshToken,
        });
        await fetchMe();
        toast.success('Welcome back');
        navigate(from, { replace: true });
      } else {
        const res = await fetch(API('/auth/signup'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });
        const json = await parseApiResponse<{
          ok: boolean;
          data?: { userId: number; accessToken: string; refreshToken: string };
          error?: { message?: string };
        }>(res);
        if (!json.ok || !json.data) {
          throw new Error(json.error?.message ?? 'Signup failed');
        }
        setSession({
          userId: json.data.userId,
          accessToken: json.data.accessToken,
          refreshToken: json.data.refreshToken,
          username,
        });
        await fetchMe();
        toast.success('Account created');
        navigate('/onboarding', { replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#00ff88] rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-[#00ccff] rounded-full blur-[120px] opacity-20 animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-center gap-2 mb-8">
            <TrendingUp className="w-8 h-8 text-[#00ff88]" />
            <span className="text-2xl">TradeQuest</span>
          </div>

          <GlassCard className="p-8" glow glowColor="green">
            <h2 className="text-3xl text-center mb-8">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
              {!isLogin && (
                <div>
                  <Label htmlFor="username" className="text-gray-300">
                    Username
                  </Label>
                  <div className="relative mt-2">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      type="text"
                      placeholder="Choose a username"
                      className="pl-10 bg-white/5 border-white/10 focus:border-[#00ff88]"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 bg-white/5 border-white/10 focus:border-[#00ff88]"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder={isLogin ? 'Enter your password' : 'Min 10 characters'}
                    className="pl-10 bg-white/5 border-white/10 focus:border-[#00ff88]"
                    required
                    minLength={isLogin ? 1 : 10}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00ff88] text-black hover:bg-[#00ff88]/90 hover:shadow-[0_0_20px_rgba(0,255,136,0.5)]"
              >
                {loading ? 'Please wait…' : isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-[#00ff88] hover:underline">
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </GlassCard>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
