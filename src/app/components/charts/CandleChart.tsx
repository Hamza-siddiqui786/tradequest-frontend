import { useMarketStore } from '../../stores/marketStore';

type Props = {
  symbol: string;
  height?: number;
};

const EMPTY_CANDLES: ReadonlyArray<{
  t: number;
  open: number;
  high: number;
  low: number;
  close: number;
}> = [];

export function CandleChart({ symbol, height = 360 }: Props) {
  const sym = symbol.toUpperCase();
  const candles = useMarketStore((s) => s.candles[sym] ?? EMPTY_CANDLES);
  const slice = candles.slice(-96);
  const w = 720;
  const pad = 28;
  const h = height;

  if (slice.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-white/10 bg-[#070b10] text-gray-500 text-sm"
        style={{ height: h }}
      >
        Waiting for live ticks…
      </div>
    );
  }

  const highs = slice.map((c) => c.high);
  const lows = slice.map((c) => c.low);
  const max = Math.max(...highs);
  const min = Math.min(...lows);
  const range = max - min || 1;
  const bw = (w - pad * 2) / slice.length;

  const y = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full rounded-lg border border-white/10 bg-[#070b10]"
      style={{ height: h }}
      preserveAspectRatio="none"
    >
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const v = min + range * frac;
        const yl = y(v);
        return (
          <g key={frac}>
            <line x1={pad} y1={yl} x2={w - pad} y2={yl} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            <text x={4} y={yl + 4} fill="rgba(148,163,184,0.9)" fontSize={10}>
              {v.toFixed(2)}
            </text>
          </g>
        );
      })}

      {slice.map((c, i) => {
        const x = pad + i * bw + bw * 0.15;
        const cw = Math.max(1, bw * 0.7);
        const up = c.close >= c.open;
        const col = up ? '#00ff88' : '#ff0055';
        const top = y(Math.max(c.open, c.close));
        const bot = y(Math.min(c.open, c.close));
        const bodyH = Math.max(1, bot - top);
        return (
          <g key={`${c.t}-${i}`}>
            <line
              x1={x + cw / 2}
              y1={y(c.high)}
              x2={x + cw / 2}
              y2={y(c.low)}
              stroke={col}
              strokeWidth={1.2}
            />
            <rect x={x} y={top} width={cw} height={bodyH} fill={col} opacity={0.88} rx={1} />
          </g>
        );
      })}
    </svg>
  );
}
