import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, TrendingUp, TrendingDown, Zap, Bell } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from './ui/button';

interface MarketEvent {
  id: string;
  type: 'crash' | 'surge' | 'warning' | 'opportunity';
  title: string;
  description: string;
  impact: string;
  asset?: string;
  change?: string;
}

interface MarketEventsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  event: MarketEvent;
}

export function MarketEventsPopup({ isOpen, onClose, event }: MarketEventsPopupProps) {
  const getEventConfig = () => {
    switch (event.type) {
      case 'crash':
        return {
          icon: TrendingDown,
          iconColor: 'text-[#ff0055]',
          bgGradient: 'from-[#ff0055]/20 to-transparent',
          glowColor: 'red' as const,
          accentColor: '#ff0055'
        };
      case 'surge':
        return {
          icon: TrendingUp,
          iconColor: 'text-[#00ff88]',
          bgGradient: 'from-[#00ff88]/20 to-transparent',
          glowColor: 'green' as const,
          accentColor: '#00ff88'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-400',
          bgGradient: 'from-yellow-400/20 to-transparent',
          glowColor: 'blue' as const,
          accentColor: '#facc15'
        };
      case 'opportunity':
        return {
          icon: Zap,
          iconColor: 'text-blue-400',
          bgGradient: 'from-blue-400/20 to-transparent',
          glowColor: 'blue' as const,
          accentColor: '#60a5fa'
        };
    }
  };

  const config = getEventConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-6"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <GlassCard className="p-8 relative overflow-hidden" glow glowColor={config.glowColor}>
                {/* Background Gradient */}
                <div className={`absolute top-0 left-0 right-0 h-48 bg-gradient-to-b ${config.bgGradient} opacity-50`} />
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="relative z-10">
                  {/* Alert Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="flex items-center justify-center mb-6"
                  >
                    <div 
                      className={`w-20 h-20 rounded-full flex items-center justify-center relative`}
                      style={{ 
                        boxShadow: `0 0 40px ${config.accentColor}40`,
                        background: `linear-gradient(135deg, ${config.accentColor}30, ${config.accentColor}10)`
                      }}
                    >
                      <div 
                        className="absolute inset-0 rounded-full animate-ping opacity-30"
                        style={{ backgroundColor: config.accentColor }}
                      />
                      <Icon className={`w-10 h-10 ${config.iconColor} relative z-10`} />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl text-center mb-4"
                  >
                    {event.title}
                  </motion.h2>

                  {/* Asset & Change */}
                  {event.asset && event.change && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center justify-center gap-3 mb-6"
                    >
                      <span className="text-xl text-gray-300">{event.asset}</span>
                      <span 
                        className="text-2xl font-bold"
                        style={{ color: config.accentColor }}
                      >
                        {event.change}
                      </span>
                    </motion.div>
                  )}

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg text-gray-300 text-center mb-6"
                  >
                    {event.description}
                  </motion.p>

                  {/* Impact */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 mb-8"
                  >
                    <p className="text-sm text-gray-400 mb-1">Market Impact:</p>
                    <p className="text-white">{event.impact}</p>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="bg-white/5 border-white/10 hover:bg-white/10"
                    >
                      Dismiss
                    </Button>
                    <Button
                      className="text-black hover:opacity-90"
                      style={{ backgroundColor: config.accentColor }}
                    >
                      View Details
                    </Button>
                  </motion.div>

                  {/* Alert Settings */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 pt-6 border-t border-white/10 text-center"
                  >
                    <button className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 mx-auto">
                      <Bell className="w-4 h-4" />
                      Configure alert preferences
                    </button>
                  </motion.div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
