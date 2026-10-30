// EXPORTS: MOCK_COINS: ICoin[]

import type { ICoin, IPost, PostSource, Sentiment } from "./types";

// Deterministic pseudo-random walk for sparkline (module-level, stable)
function series(seed: number, base: number, points = 30): number[] {
  const out: number[] = [];
  let v = base;
  let s = seed;
  for (let i = 0; i < points; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280 - 0.5;
    v = v * (1 + r * 0.035 + Math.sin(i / 3) * 0.008);
    out.push(Number(v.toFixed(v < 10 ? 5 : 2)));
  }
  return out;
}

interface CoinSeed {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volumeB: number; // 24h volume in $B
  marketCapB: number;
  heat: number; // 0-100
  social: number;
  search: number;
}

// 30 coins — real-world order of magnitude, synthetic but consistent
const SEEDS: CoinSeed[] = [
  { symbol: "BTC",  name: "Bitcoin",       price: 67412.55, change24h: 2.34,  volumeB: 32.45, marketCapB: 1328, heat: 95, social: 96, search: 94 },
  { symbol: "ETH",  name: "Ethereum",      price: 3521.18,  change24h: -1.12, volumeB: 18.92, marketCapB: 423,  heat: 88, social: 90, search: 84 },
  { symbol: "BNB",  name: "BNB Chain",     price: 592.40,   change24h: 0.84,  volumeB: 2.18,  marketCapB: 87,   heat: 62, social: 58, search: 64 },
  { symbol: "SOL",  name: "Solana",         price: 172.84,   change24h: 5.67,  volumeB: 6.41,  marketCapB: 82,   heat: 82, social: 86, search: 78 },
  { symbol: "XRP",  name: "XRP",            price: 0.5218,   change24h: -2.45, volumeB: 1.92,  marketCapB: 29.6, heat: 52, social: 48, search: 56 },
  { symbol: "DOGE", name: "Dogecoin",       price: 0.1247,   change24h: 8.92,  volumeB: 3.28,  marketCapB: 18.1, heat: 74, social: 88, search: 70 },
  { symbol: "ADA",  name: "Cardano",        price: 0.4521,   change24h: 1.23,  volumeB: 0.86,  marketCapB: 15.9, heat: 44, social: 42, search: 46 },
  { symbol: "TRX",  name: "TRON",          price: 0.1562,   change24h: 0.45,  volumeB: 1.24,  marketCapB: 13.5, heat: 38, social: 35, search: 40 },
  { symbol: "AVAX", name: "Avalanche",      price: 36.84,    change24h: -0.87, volumeB: 0.62,  marketCapB: 14.2, heat: 50, social: 52, search: 48 },
  { symbol: "LINK", name: "Chainlink",      price: 17.92,    change24h: 3.12,  volumeB: 0.94,  marketCapB: 10.8, heat: 58, social: 60, search: 55 },
  { symbol: "DOT",  name: "Polkadot",       price: 4.38,     change24h: -1.54, volumeB: 0.32,  marketCapB: 6.4,  heat: 36, social: 34, search: 38 },
  { symbol: "MATIC", name: "Polygon",        price: 0.7214,   change24h: 2.08,  volumeB: 0.48,  marketCapB: 6.9,  heat: 42, social: 44, search: 40 },
  { symbol: "SHIB", name: "Shiba Inu",      price: 0.0000218,change24h: 6.41,  volumeB: 1.12,  marketCapB: 1.29, heat: 60, social: 72, search: 58 },
  { symbol: "LTC",  name: "Litecoin",       price: 84.21,    change24h: 0.67,  volumeB: 0.72,  marketCapB: 6.4,  heat: 40, social: 36, search: 42 },
  { symbol: "BCH",  name: "Bitcoin Cash",   price: 452.10,   change24h: -0.42, volumeB: 0.41,  marketCapB: 8.9,  heat: 34, social: 30, search: 36 },
  { symbol: "UNI",  name: "Uniswap",        price: 11.24,    change24h: 4.15,  volumeB: 0.38,  marketCapB: 6.7,  heat: 48, social: 50, search: 44 },
  { symbol: "ATOM", name: "Cosmos",        price: 7.82,     change24h: -2.11, volumeB: 0.24,  marketCapB: 3.1,  heat: 32, social: 30, search: 34 },
  { symbol: "NEAR", name: "Near Protocol",  price: 5.48,     change24h: 1.86,  volumeB: 0.31,  marketCapB: 6.0,  heat: 46, social: 48, search: 42 },
  { symbol: "ETC",  name: "Ethereum Classic", price: 28.42,  change24h: -0.94, volumeB: 0.28,  marketCapB: 4.3,  heat: 30, social: 26, search: 32 },
  { symbol: "FIL",  name: "Filecoin",       price: 5.12,     change24h: 3.42,  volumeB: 0.35,  marketCapB: 3.1,  heat: 38, social: 40, search: 36 },
  { symbol: "APT",  name: "Aptos",         price: 9.84,     change24h: 4.78,  volumeB: 0.52,  marketCapB: 5.4,  heat: 54, social: 56, search: 50 },
  { symbol: "ARB",  name: "Arbitrum",       price: 1.18,     change24h: 2.94,  volumeB: 0.44,  marketCapB: 4.0,  heat: 56, social: 58, search: 52 },
  { symbol: "OP",   name: "Optimism",       price: 2.42,     change24h: -1.78, volumeB: 0.32,  marketCapB: 2.7,  heat: 50, social: 52, search: 46 },
  { symbol: "INJ",  name: "Injective",      price: 22.14,    change24h: 7.23,  volumeB: 0.38,  marketCapB: 2.2,  heat: 64, social: 66, search: 60 },
  { symbol: "SUI",  name: "Sui",           price: 0.6842,   change24h: 9.12,  volumeB: 0.88,  marketCapB: 2.1,  heat: 68, social: 72, search: 64 },
  { symbol: "SEI",  name: "Sei",           price: 0.5124,   change24h: 4.31,  volumeB: 0.28,  marketCapB: 1.5,  heat: 52, social: 54, search: 48 },
  { symbol: "TIA",  name: "Celestia",       price: 5.84,     change24h: -3.24, volumeB: 0.22,  marketCapB: 1.2,  heat: 44, social: 46, search: 40 },
  { symbol: "IMX",  name: "Immutable",      price: 1.84,     change24h: 0.56,  volumeB: 0.12,  marketCapB: 2.9,  heat: 36, social: 38, search: 34 },
  { symbol: "GRT",  name: "The Graph",      price: 0.2842,   change24h: -1.18, volumeB: 0.14,  marketCapB: 2.7,  heat: 32, social: 34, search: 30 },
  { symbol: "AAVE", name: "Aave",          price: 98.42,    change24h: 3.68,  volumeB: 0.36,  marketCapB: 1.5,  heat: 56, social: 58, search: 52 },
];

const AUTHORS = ["@onchain_wiz", "@defi_pulse", "r/cryptocurrency", "@whale_alert", "discord-mod", "@block_research", "medium-analyst", "@memereport"];
const SOURCES: PostSource[] = ["Twitter", "Reddit", "Discord", "Medium"];
const SENTIMENTS: Sentiment[] = ["bullish", "neutral", "bearish", "bullish", "bullish", "neutral"];
const POST_TEMPLATES = [
  "{s} breaking out of range — on-chain inflows up noticeably in the last 12h.",
  "Whale wallet moved 0.8% of supply to a new address today. Worth watching.",
  "Network activity metrics improving: active addresses +14% week-over-week.",
  "Some traders are taking profits near local resistance. Volume tapering off.",
  "Devs shipped a new upgrade; community sentiment turning cautiously optimistic.",
  "Funding rates flipped positive again — longs are piling back in.",
];

function makeCommunity(symbol: string, seed: number): IPost[] {
  const out: IPost[] = [];
  let s = seed;
  for (let i = 0; i < 3; i++) {
    s = (s * 7919 + 104729) % 100000;
    const author = AUTHORS[s % AUTHORS.length];
    const source = SOURCES[s % SOURCES.length];
    const sentiment = SENTIMENTS[s % SENTIMENTS.length];
    const template = POST_TEMPLATES[(s + i) % POST_TEMPLATES.length];
    out.push({
      id: `${symbol}-${i}`,
      author,
      source,
      time: `${(s % 120) + 5} min ago`,
      content: template.replace("{s}", symbol),
      likes: (s % 900) + 20,
      sentiment,
    });
  }
  return out;
}

function makePrediction(seed: number, change: number) {
  const up = change + ((seed % 7) - 3) > 0;
  const confidence = 50 + ((seed * 13) % 28);
  const signalPool = [
    { name: "MVRV Z-Score", bullish: seed % 2 === 0, detail: "Historical band reading — mid-cycle zone." },
    { name: "Exchange Outflows", bullish: seed % 3 !== 0, detail: "Net outflows observed over the last 48h." },
    { name: "RSI(14)", bullish: seed % 4 !== 0, detail: up ? "Approaching overbought — momentum strong." : "Approaching oversold — watch for bounce." },
    { name: "Funding Rate", bullish: seed % 2 === 0, detail: up ? "Perp funding positive — long squeeze risk." : "Funding flipped negative — capitulation possible." },
  ];
  return {
    direction: (up ? "up" : "down") as "up" | "down",
    confidence,
    horizon: (seed % 2 === 0 ? "24h" : "7d") as "24h" | "7d",
    signals: signalPool.slice(0, 3),
  };
}

export const MOCK_COINS: ICoin[] = SEEDS.map((seed, idx) => ({
  id: seed.symbol.toLowerCase(),
  symbol: seed.symbol,
  name: seed.name,
  price: seed.price,
  change24h: seed.change24h,
  volume24h: seed.volumeB * 1e9,
  marketCap: seed.marketCapB * 1e9,
  heatScore: seed.heat,
  socialScore: seed.social,
  searchScore: seed.search,
  priceHistory: series(idx * 17 + 5, seed.price),
  prediction: makePrediction(idx + 1, seed.change24h),
  community: makeCommunity(seed.symbol, idx * 31 + 7),
}));
