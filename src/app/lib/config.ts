/** API host: VITE_API_URL when set; else same-origin (Docker/nginx) or localhost dev server. */
export function getApiOrigin(): string {
  const v = import.meta.env.VITE_API_URL;
  if (v != null && String(v).trim() !== '') {
    return String(v).replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:4000';
}

export function getWsMarketUrl(): string {
  const v = import.meta.env.VITE_WS_URL;
  if (v != null && String(v).trim() !== '') {
    return String(v).trim();
  }
  if (typeof window === 'undefined') {
    return 'ws://localhost:4000/ws/market';
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/ws/market`;
}

export const DEFAULT_SYMBOL = import.meta.env.VITE_DEFAULT_SYMBOL ?? 'AAPL';

export const API = (path: string) =>
  `${getApiOrigin()}/api${path.startsWith('/') ? path : `/${path}`}`;
