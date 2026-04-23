import { createBrowserRouter } from 'react-router';
import type { ComponentType } from 'react';
import { RootLayout } from './components/layout/RootLayout';
import { RouteErrorPage } from './components/RouteErrorPage';
import { ProtectedLayout } from './components/layout/ProtectedLayout';

function lazyPage(importer: () => Promise<{ default: ComponentType<object> }>) {
  return () => importer().then((m) => ({ Component: m.default }));
}

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/', lazy: lazyPage(() => import('./pages/LandingPage')) },
      { path: '/auth', lazy: lazyPage(() => import('./pages/AuthPage')) },
      { path: '/onboarding', lazy: lazyPage(() => import('./pages/OnboardingPage')) },
      { path: '/game-mode', lazy: lazyPage(() => import('./pages/GameModePage')) },
      {
        Component: ProtectedLayout,
        children: [
          { path: '/dashboard', lazy: lazyPage(() => import('./pages/TradingDashboard')) },
          { path: '/ai-coach', lazy: lazyPage(() => import('./pages/AICoachPage')) },
          { path: '/missions', lazy: lazyPage(() => import('./pages/MissionsPage')) },
          { path: '/leaderboard', lazy: lazyPage(() => import('./pages/LeaderboardPage')) },
          { path: '/analytics', lazy: lazyPage(() => import('./pages/AnalyticsPage')) },
          { path: '/portfolio', lazy: lazyPage(() => import('./pages/PortfolioPage')) },
          { path: '/psychology', lazy: lazyPage(() => import('./pages/PsychologyTrackerPage')) },
          { path: '/wallet', lazy: lazyPage(() => import('./pages/WalletPage')) },
          { path: '/profile', lazy: lazyPage(() => import('./pages/ProfilePage')) },
          { path: '/settings', lazy: lazyPage(() => import('./pages/SettingsPage')) },
          { path: '/shadow-mode', lazy: lazyPage(() => import('./pages/ShadowModePage')) },
        ],
      },
    ],
  },
]);
