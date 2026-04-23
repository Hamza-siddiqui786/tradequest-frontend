export const TRADE_SYMBOLS = (import.meta.env.VITE_SYMBOLS ?? 'AAPL,MSFT,GOOG,AMZN,TSLA')
  .split(',')
  .map((s) => s.trim().toUpperCase())
  .filter(Boolean);
