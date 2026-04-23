import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export function RouteErrorPage() {
  const err = useRouteError();
  const navigate = useNavigate();

  let title = 'Something went wrong';
  let detail = 'An unexpected error occurred. You can retry or go back.';

  if (isRouteErrorResponse(err)) {
    title = err.status === 404 ? 'Page not found' : `Error ${err.status}`;
    detail = err.statusText || (typeof err.data === 'string' ? err.data : detail);
  } else if (err instanceof Error) {
    detail = err.message;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-[0_0_40px_rgba(0,255,136,0.08)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#ff0055]/15">
          <AlertTriangle className="h-7 w-7 text-[#ff0055]" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-white/60">{detail}</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            type="button"
            variant="outline"
            className="border-white/20 bg-transparent"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Button
            type="button"
            className="bg-[#00ff88] text-black hover:bg-[#00ff88]/90"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="size-4" />
            Reload
          </Button>
        </div>
      </div>
    </div>
  );
}
