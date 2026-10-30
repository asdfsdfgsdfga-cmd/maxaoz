// EXPORTS:
// ICoin{id,symbol,name,price,change24h,volume24h,marketCap,heatScore,socialScore,searchScore,priceHistory,prediction,community}
// IPrediction{direction,confidence,horizon,signals}
// IPredictionSignal{name,bullish,detail}
// IPost{id,author,source,time,content,likes,sentiment}
// IUser{email,name,createdAt}

export type Sentiment = "bullish" | "bearish" | "neutral";
export type PredictionDirection = "up" | "down";

export interface IPredictionSignal {
  name: string;
  bullish: boolean;
  detail: string;
}

export interface IPrediction {
  direction: PredictionDirection;
  confidence: number; // 0-100
  horizon: "24h" | "7d";
  signals: IPredictionSignal[];
}

export type PostSource = "Twitter" | "Reddit" | "Discord" | "Medium";

export interface IPost {
  id: string;
  author: string;
  source: PostSource;
  time: string;
  content: string;
  likes: number;
  sentiment: Sentiment;
}

export interface ICoin {
  id: string;
  symbol: string;
  name: string;
  price: number; // USD
  change24h: number; // percent
  volume24h: number; // USD
  marketCap: number; // USD
  heatScore: number; // 0-100 overall
  socialScore: number; // 0-100
  searchScore: number; // 0-100
  priceHistory: number[]; // 30 points, for sparkline
  prediction: IPrediction;
  community: IPost[];
}

export interface IUser {
  email: string;
  name: string;
  createdAt: string;
}
