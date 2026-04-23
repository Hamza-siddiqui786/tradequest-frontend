import { useEffect, useRef } from 'react';
import { getWsMarketUrl } from '../lib/config';
import { useMarketStore, type QuoteMsg } from '../stores/marketStore';
import { useAuthStore } from '../stores/authStore';

export function useMarketWebSocket(enabled: boolean): void {
  const ingestQuote = useMarketStore((s) => s.ingestQuote);
  const token = useAuthStore((s) => s.accessToken);
  const ref = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled || !token) {
      ref.current?.close();
      ref.current = null;
      return;
    }
    const ws = new WebSocket(getWsMarketUrl());
    ref.current = ws;
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as QuoteMsg;
        if (msg?.type === 'quote' && msg.symbol && Number.isFinite(msg.price)) {
          ingestQuote(msg);
        }
      } catch {
        /* ignore */
      }
    };
    ws.onerror = () => {
      /* browser handles; reconnect on close */
    };
    ws.onclose = () => {
      ref.current = null;
    };
    return () => ws.close();
  }, [enabled, token, ingestQuote]);
}
