import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router';
import { PageSkeleton } from '../ui/PageSkeleton';

export function RootLayout() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageSkeleton />}>
      <div key={location.pathname} className="page-enter">
        <Outlet />
      </div>
    </Suspense>
  );
}
