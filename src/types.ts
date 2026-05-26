export interface Coin {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  price: number;
  priceChange1h: number;
  priceChange24h: number;
  priceChange7d: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  maxSupply?: number;
  category: 'layer-1' | 'defi' | 'meme' | 'layer-2' | 'ai' | 'gaming';
  sparkline: number[]; // Sparkline trend values (series of prices)
  description: string;
  image?: string;
  realtimeSource?: string;
}

export interface Transaction {
  id: string;
  coinId: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number; // Purchased pricing in USD
  date: string;
}

export interface PortfolioHolding {
  coinId: string;
  coin: Coin;
  quantity: number;
  avgBuyPrice: number;
  totalCost: number;
  currentValue: number;
  netProfit: number;
  profitPercentage: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface CryptoGlobalStats {
  activeCryptos: number;
  activeExchanges: number;
  totalMarketCap: number;
  marketCapChange24h: number;
  volume24h: number;
  volumeChange24h: number;
  btcDominance: number;
  ethDominance: number;
  gasPriceGwei: number;
}
