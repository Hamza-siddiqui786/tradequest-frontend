import { create } from 'zustand';

const BUCKET_SEC = 30;
const MAX_CANDLES = 120;

export type QuoteMsg = { type: 'quote'; symbol: string; price: number; ts: string };

export type Candle = {
  t: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

type MarketState = {
  quotes: Record<string, number>;
  lastTs: Record<string, string>;
  candles: Record<string, Candle[]>;
  selectedSymbol: string;
  setSelectedSymbol: (s: string) => void;
  ingestQuote: (msg: QuoteMsg) => void;
  seedCandles: (symbol: string, candles: Candle[]) => void;
};

function appendCandle(prev: Candle[], bucket: number, price: number): Candle[] {
  const last = prev[prev.length - 1];
  let next: Candle[];
  if (!last || last.t !== bucket) {
    next = [...prev, { t: bucket, open: price, high: price, low: price, close: price }].slice(
      -MAX_CANDLES
    );
  } else {
    next = [
      ...prev.slice(0, -1),
      {
        t: bucket,
        open: last.open,
        high: Math.max(last.high, price),
        low: Math.min(last.low, price),
        close: price,
      },
    ];
  }
  return next;
}

export const useMarketStore = create<MarketState>((set) => ({
  quotes: {},
  lastTs: {},
  candles: {},
  selectedSymbol: import.meta.env.VITE_DEFAULT_SYMBOL ?? 'AAPL',

  setSelectedSymbol: (s) =>
    set((state) => {
      const next = s.toUpperCase();
      return state.selectedSymbol === next ? state : { selectedSymbol: next };
    }),

  seedCandles: (symbol, candles) =>
    set((state) => ({
      candles: { ...state.candles, [symbol.toUpperCase()]: candles.slice(-MAX_CANDLES) },
    })),

  ingestQuote: (msg) => {
    const symbol = msg.symbol.toUpperCase();
    const t = Math.floor(new Date(msg.ts).getTime() / 1000);
    const bucket = Math.floor(t / BUCKET_SEC) * BUCKET_SEC;
    const price = msg.price;
    set((state) => {
      const prev = state.candles[symbol] ?? [];
      return {
        quotes: { ...state.quotes, [symbol]: price },
        lastTs: { ...state.lastTs, [symbol]: msg.ts },
        candles: { ...state.candles, [symbol]: appendCandle(prev, bucket, price) },
      };
    });
  },
}));
