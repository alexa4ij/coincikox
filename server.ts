import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { INITIAL_COINS, GLOBAL_STATS } from "./src/data";

// Real-time stateful in-memory crypto simulator with Keyless Free Live API matching ("Buat Sendiri")
let simulatedState: {
  coins: typeof INITIAL_COINS;
  globalStats: typeof GLOBAL_STATS;
  lastTickTime: number;
} = {
  coins: JSON.parse(JSON.stringify(INITIAL_COINS)),
  globalStats: JSON.parse(JSON.stringify(GLOBAL_STATS)),
  lastTickTime: Date.now(),
};

// Real-time currency exchange rates matching Coingecko specifications
let exchangeRates: { [key: string]: number } = {
  USD: 1,
  IDR: 16120,
  EUR: 0.922,
  GBP: 0.785,
  JPY: 156.8,
  AUD: 1.505,
  CAD: 1.365,
  CHF: 0.915,
  CNY: 7.245,
  HKD: 7.82,
  NZD: 1.63,
  SGD: 1.35,
  KRW: 1362.0,
  INR: 83.2,
  BRL: 5.15,
  RUB: 90.5,
  ZAR: 18.5,
  TRY: 32.2,
  PLN: 3.95,
  PHP: 58.2,
  THB: 36.5,
  MYR: 4.70,
  VND: 25450.0,
  SAR: 3.75,
  AED: 3.67,
  BTC: 0.0000147,
  ETH: 0.000282,
};
let lastRatesFetchTime = 0;

async function syncExchangeRates() {
  const now = Date.now();
  if (now - lastRatesFetchTime > 60000) {
    try {
      lastRatesFetchTime = now;
      const res = await fetch("https://api.coingecko.com/api/v3/exchange_rates");
      if (res.ok) {
        const data = await res.json() as any;
        if (data && data.rates) {
          const r = data.rates;
          const usdVal = r.usd ? r.usd.value : 1;
          const newRates: { [key: string]: number } = { ...exchangeRates };
          for (const key of Object.keys(r)) {
            const curCode = key.toUpperCase();
            if (r[key] && typeof r[key].value === "number") {
              newRates[curCode] = r[key].value / usdVal;
            }
          }
          exchangeRates = newRates;
          console.log("[Exchange Rates Router] Succeeded in loading live dynamic FX rates. Total rates loaded:", Object.keys(exchangeRates).length);
        }
      }
    } catch (e) {
      console.warn("[Exchange Rates Router Alert] Failed to fetch live currency rates, keeping current state:", e);
    }
  }
}

// Simple memory throttle to prevent flooding free public endpoints (Updates real-market feed every 12 seconds)
let lastExternalFetchTime = 0;

function determineCategory(id: string, symbol: string): 'layer-1' | 'defi' | 'meme' | 'layer-2' | 'ai' | 'gaming' {
  const memeIds = ["dogecoin", "shiba-inu", "pepe", "dogwifhat", "bonk", "floki", "bome", "pepecoin", "popcat", "mew", "mog-coin", "baby-doge-coin", "coq-inu", "turbo", "harrypotterobamasonic10inu", "milady-meme-coin"];
  const defiIds = ["uniswap", "lido-dao", "maker", "aave", "synthetix-network-token", "pancakeswap", "jupiter-exchange-solana", "jito-governance-token", "curve-dao-token", "ethena", "thorchain", "compound", "yearn-finance", "dydx", "luna", "raydium", "gmx", "havven", "pancakeswap-token"];
  const layer2Ids = ["polygon-ecosystem-token", "matic-network", "arbitrum", "optimism", "starknet", "mantle", "immutable-x", "metis-token", "loopring", "manta-network", "zksync"];
  const aiIds = ["render-token", "fetch-ai", "singularitynet", "worldcoin-org", "worldcoin", "bittensor", "arkham", "the-graph", "theta-token", "akash-network", "nosana", "cortex", "superintelligence-alliance"];
  const gamingIds = ["gala", "the-sandbox", "decentraland", "axie-infinity", "beam", "portal", "enjincoin", "ronin", "yield-guild-games", "apeswap-finance", "chiliz", "superfarm"];

  const lid = id.toLowerCase();
  const lsym = symbol.toLowerCase();

  if (memeIds.includes(lid) || lsym === "doge" || lsym === "shib" || lsym === "pepe" || lsym === "wif" || lsym === "bonk" || lsym === "floki" || lsym === "bome") {
    return "meme";
  }
  if (defiIds.includes(lid) || lsym === "uni" || lsym === "ldo" || lsym === "mkr" || lsym === "aave" || lsym === "comp" || lsym === "yfi" || lsym === "crv" || lsym === "jup") {
    return "defi";
  }
  if (layer2Ids.includes(lid) || lsym === "pol" || lsym === "matic" || lsym === "arb" || lsym === "op" || lsym === "strk" || lsym === "metis") {
    return "layer-2";
  }
  if (aiIds.includes(lid) || lsym === "render" || lsym === "fet" || lsym === "agix" || lsym === "wld" || lsym === "tao" || lsym === "grt" || lsym === "pwr") {
    return "ai";
  }
  if (gamingIds.includes(lid) || lsym === "gala" || lsym === "sand" || lsym === "mana" || lsym === "axs" || lsym === "imx" || lsym === "ron") {
    return "gaming";
  }
  return "layer-1";
}

async function syncWithRealworldMarket(): Promise<typeof simulatedState> {
  const now = Date.now();
  
  // 1. Check if we need to pull fresh real-world prices (throttled to 12 seconds to respect keyless limits)
  if (now - lastExternalFetchTime > 12000) {
    try {
      lastExternalFetchTime = now;
      const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d";
      const res = await fetch(url, {
        headers: {
          "Accept": "application/json"
        }
      });
      
      if (res.ok) {
        const coinGeckoData = (await res.json()) as any[];
        
        if (Array.isArray(coinGeckoData) && coinGeckoData.length > 0) {
          const mappedCoins = coinGeckoData.map((item: any) => {
            const id = item.id;
            const symbol = item.symbol.toUpperCase();
            const name = item.name;
            const rank = parseInt(item.market_cap_rank) || 999;
            const price = parseFloat(item.current_price) || 0;
            
            const priceChange1h = parseFloat(parseFloat(item.price_change_percentage_1h_in_currency || "0").toFixed(2));
            const priceChange24h = parseFloat(parseFloat(item.price_change_percentage_24h_in_currency || item.price_change_percentage_24h || "0").toFixed(2));
            const priceChange7d = parseFloat(parseFloat(item.price_change_percentage_7d_in_currency || "0").toFixed(2));
            
            const marketCap = parseFloat(item.market_cap) || 0;
            const volume24h = parseFloat(item.total_volume) || 0;
            const circulatingSupply = parseFloat(item.circulating_supply) || 0;
            const maxSupply = parseFloat(item.max_supply) || undefined;
            const image = item.image;
            const category = determineCategory(id, symbol);

            // Extract sparklines or compile standard 7 points series matching recent change rate
            let sparkline: number[] = [];
            if (item.sparkline_in_7d && Array.isArray(item.sparkline_in_7d.price) && item.sparkline_in_7d.price.length > 0) {
              // Standard CoinGecko 7d sparkline comes with 168 hours of points. Let's sample down to 24 points to save bandwidth
              const rawPoints = item.sparkline_in_7d.price;
              const step = Math.max(1, Math.floor(rawPoints.length / 10));
              for (let i = 0; i < rawPoints.length; i += step) {
                const val = parseFloat(rawPoints[i]);
                if (!isNaN(val)) sparkline.push(parseFloat(val.toFixed(price < 0.01 ? 7 : 2)));
              }
            }
            
            // Guard empty sparklines
            if (sparkline.length < 5) {
              const base = price;
              const vol = category === "meme" ? 0.05 : 0.02;
              sparkline = Array.from({ length: 10 }, (_, idx) => {
                const modifier = 1 + (Math.sin(idx / 2) * vol) + ((Math.random() - 0.5) * 0.01);
                return parseFloat((base * modifier).toFixed(price < 0.01 ? 7 : 2));
              });
            }

            const description = `${name} (${symbol}) adalah aset kripto berperingkat global #${rank} dengan kapitalisasi pasar senilai USD ${marketCap.toLocaleString()} dan volume perdagangan 24 jam mencapai USD ${volume24h.toLocaleString()}.`;

            return {
              id,
              rank,
              name,
              symbol,
              price,
              priceChange1h,
              priceChange24h,
              priceChange7d,
              marketCap,
              volume24h,
              circulatingSupply,
              maxSupply,
              category,
              sparkline,
              description,
              image,
              realtimeSource: "live_coingecko_api"
            };
          });

          simulatedState.coins = mappedCoins;

          // Compile Global aggregates
          let totalCap = 0;
          let totalVol = 0;
          mappedCoins.forEach((c) => {
            totalCap += c.marketCap;
            totalVol += c.volume24h;
          });

          const globalMarketCap = Math.round(totalCap / 0.64);
          const globalVolume = Math.round(totalVol / 0.12);

          const btcCoin = mappedCoins.find((c) => c.symbol === "BTC");
          const ethCoin = mappedCoins.find((c) => c.symbol === "ETH");

          const btcDominance = btcCoin ? parseFloat(((btcCoin.marketCap / totalCap) * 58.5).toFixed(1)) : simulatedState.globalStats.btcDominance;
          const ethDominance = ethCoin ? parseFloat(((ethCoin.marketCap / totalCap) * 17.5).toFixed(1)) : simulatedState.globalStats.ethDominance;
          const marketCapChange24h = btcCoin ? btcCoin.priceChange24h : simulatedState.globalStats.marketCapChange24h;

          simulatedState.globalStats = {
            activeCryptos: 15478,
            activeExchanges: 822,
            totalMarketCap: globalMarketCap,
            marketCapChange24h,
            volume24h: globalVolume,
            volumeChange24h: parseFloat((12.5 + (Math.random() - 0.5) * 2).toFixed(1)),
            btcDominance,
            ethDominance,
            gasPriceGwei: Math.max(9, Math.floor(Math.random() * 14) + 12),
          };

          simulatedState.lastTickTime = now;
          return simulatedState;
        }
      }
    } catch (e) {
      console.warn("[Free Realtime Engine Alert] Coingecko API rate-limited, continuing simulation in background.", e);
    }
  }

  // 2. FALLBACK Ticking Engine: Keep the active coin list updating dynamically
  const secondsElapsed = Math.floor((now - simulatedState.lastTickTime) / 1000);
  if (secondsElapsed >= 1) {
    const ticks = Math.min(secondsElapsed, 15);
    for (let t = 0; t < ticks; t++) {
      simulatedState.coins = simulatedState.coins.map((coin, index) => {
        const volatility = coin.category === "meme" ? 0.006 : 0.0015;
        const cycle = Math.sin((now / 100000) + index * 1.5);
        const drift = cycle * 0.0003;
        const shock = (Math.random() - 0.495) * volatility;
        const changeRate = drift + shock;
        const nextPrice = Math.max(coin.price * (1 + changeRate), 0.0000001);

        const priceChange24h = parseFloat((coin.priceChange24h + changeRate * 45).toFixed(2));
        const priceChange1h = parseFloat((coin.priceChange1h + changeRate * 12).toFixed(2));
        const nextMarketCap = Math.round(coin.marketCap * (1 + changeRate));
        const nextVolume = Math.max(coin.volume24h * (1 + (Math.random() - 0.5) * 0.02), 5000);

        let nextSparkline = [...coin.sparkline];
        if (Math.random() > 0.4 && nextSparkline.length > 0) {
          nextSparkline = [...nextSparkline.slice(1), parseFloat(nextPrice.toFixed(coin.price < 0.01 ? 7 : 2))];
        } else if (nextSparkline.length > 0) {
          nextSparkline[nextSparkline.length - 1] = parseFloat(nextPrice.toFixed(coin.price < 0.01 ? 7 : 2));
        }

        return {
          ...coin,
          price: parseFloat(nextPrice.toFixed(coin.price < 0.01 ? 7 : 2)),
          priceChange1h,
          priceChange24h,
          marketCap: nextMarketCap,
          volume24h: nextVolume,
          sparkline: nextSparkline,
        };
      });
    }

    simulatedState.globalStats.totalMarketCap = Math.round(simulatedState.globalStats.totalMarketCap * (1 + (Math.random() - 0.5) * 0.001));
    simulatedState.globalStats.volume24h = Math.round(simulatedState.globalStats.volume24h * (1 + (Math.random() - 0.5) * 0.002));
    simulatedState.globalStats.gasPriceGwei = Math.max(8, Math.min(180, simulatedState.globalStats.gasPriceGwei + (Math.random() > 0.5 ? 1 : -1)));
    simulatedState.lastTickTime = now;
  }

  // Always keep simulatedState.coins sorted by rank ascending to align with CoinGecko rank orders
  simulatedState.coins.sort((a, b) => a.rank - b.rank);

  return simulatedState;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser limit and types
  app.use(express.json());

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Real-time proxy endpoints
  app.get("/api/crypto/market", async (req, res) => {
    const data = await syncWithRealworldMarket();
    res.json({ coins: data.coins });
  });

  app.get("/api/crypto/global", async (req, res) => {
    const data = await syncWithRealworldMarket();
    res.json({ stats: data.globalStats });
  });

  app.get("/api/crypto/rates", async (req, res) => {
    await syncExchangeRates();
    res.json({ rates: exchangeRates });
  });

  // Real-time Exchange Proxy API to connect with multiple public cryptocurrency exchanges
  app.get("/api/exchanges/query", async (req, res) => {
    const exchange = String(req.query.exchange || "binance").toLowerCase();
    const type = String(req.query.type || "ticker").toLowerCase();
    const pair = String(req.query.pair || "BTC/USDT");

    let url = "";
    
    // Helper to translate pairs
    const getPairSymbol = (p: string, ex: string) => {
      const parts = p.split("/");
      const base = parts[0] || "BTC";
      const quote = parts[1] || "USDT";
      
      if (ex === "binance") return `${base}${quote}`;
      if (ex === "coinbase") {
        // Coinbase pro prefers USD for top tickers usually
        const q = quote === "USDT" ? "USD" : quote;
        return `${base}-${q}`;
      }
      if (ex === "kraken") {
        const b = base === "BTC" ? "XBT" : base;
        const q = quote === "USDT" ? "USDT" : "USD";
        return `${b}${q}`;
      }
      if (ex === "kucoin") return `${base}-${quote}`;
      if (ex === "okx") return `${base}-${quote}`;
      if (ex === "bybit") return `${base}${quote}`;
      if (ex === "indodax") return `${base.toLowerCase()}_${quote.toLowerCase()}`;
      if (ex === "gateio") return `${base}_${quote}`;
      return `${base}${quote}`;
    };

    const mappedPair = getPairSymbol(pair, exchange);

    if (exchange === "binance") {
      if (type === "ticker") {
        url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${mappedPair}`;
      } else {
        url = `https://api.binance.com/api/v3/depth?symbol=${mappedPair}&limit=12`;
      }
    } else if (exchange === "coinbase") {
      if (type === "ticker") {
        url = `https://api.exchange.coinbase.com/products/${mappedPair}/ticker`;
      } else {
        url = `https://api.exchange.coinbase.com/products/${mappedPair}/book?level=2`;
      }
    } else if (exchange === "kraken") {
      if (type === "ticker") {
        url = `https://api.kraken.com/0/public/Ticker?pair=${mappedPair}`;
      } else {
        url = `https://api.kraken.com/0/public/Depth?pair=${mappedPair}&count=12`;
      }
    } else if (exchange === "kucoin") {
      if (type === "ticker") {
        url = `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${mappedPair}`;
      } else {
        url = `https://api.kucoin.com/api/v1/market/orderbook/level2_100?symbol=${mappedPair}`; // fallback depth or ticker
      }
    } else if (exchange === "okx") {
      if (type === "ticker") {
        url = `https://www.okx.com/api/v5/market/ticker?instId=${mappedPair}`;
      } else {
        url = `https://www.okx.com/api/v5/market/books?instId=${mappedPair}&sz=12`;
      }
    } else if (exchange === "bybit") {
      if (type === "ticker") {
        url = `https://api.bybit.com/v5/market/tickers?category=spot&symbol=${mappedPair}`;
      } else {
        url = `https://api.bybit.com/v5/market/orderbook?category=spot&symbol=${mappedPair}&limit=12`;
      }
    } else if (exchange === "indodax") {
      if (type === "ticker") {
        url = `https://indodax.com/api/ticker/${mappedPair}`;
      } else {
        url = `https://indodax.com/api/depth/${mappedPair}`;
      }
    } else if (exchange === "gateio") {
      if (type === "ticker") {
        url = `https://api.gateio.ws/api/v4/spot/tickers?currency_pair=${mappedPair}`;
      } else {
        url = `https://api.gateio.ws/api/v4/spot/order_book?currency_pair=${mappedPair}&limit=12`;
      }
    }

    if (!url) {
      return res.status(400).json({ error: "Unsupported exchange or request parameter types." });
    }

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status} from exchange endpoint`);
      }
      const rawData = await response.json() as any;
      
      // Parse exchange-specific fields to uniform standard statistics
      let parsedStats = {
        lastPrice: 0,
        high24h: 0,
        low24h: 0,
        volume24h: 0,
        bid: 0,
        ask: 0,
        priceChangePercent: 0,
      };

      try {
        if (exchange === "binance" && type === "ticker") {
          parsedStats = {
            lastPrice: parseFloat(rawData.lastPrice) || 0,
            high24h: parseFloat(rawData.highPrice) || 0,
            low24h: parseFloat(rawData.lowPrice) || 0,
            volume24h: parseFloat(rawData.volume) || 0,
            bid: parseFloat(rawData.bidPrice) || 0,
            ask: parseFloat(rawData.askPrice) || 0,
            priceChangePercent: parseFloat(rawData.priceChangePercent) || 0,
          };
        } else if (exchange === "coinbase" && type === "ticker") {
          parsedStats = {
            lastPrice: parseFloat(rawData.price) || 0,
            high24h: 0, 
            low24h: 0,
            volume24h: parseFloat(rawData.volume) || 0,
            bid: parseFloat(rawData.bid) || 0,
            ask: parseFloat(rawData.ask) || 0,
            priceChangePercent: 0,
          };
        } else if (exchange === "kraken" && type === "ticker") {
          const keys = Object.keys(rawData.result || {});
          if (keys.length > 0) {
            const tk = rawData.result[keys[0]];
            parsedStats = {
              lastPrice: parseFloat(tk.c?.[0]) || 0,
              high24h: parseFloat(tk.h?.[1]) || 0,
              low24h: parseFloat(tk.l?.[1]) || 0,
              volume24h: parseFloat(tk.v?.[1]) || 0,
              bid: parseFloat(tk.a?.[0]) || 0,
              ask: parseFloat(tk.b?.[0]) || 0,
              priceChangePercent: 0,
            };
          }
        } else if (exchange === "kucoin" && type === "ticker") {
          const tk = rawData.data || {};
          parsedStats = {
            lastPrice: parseFloat(tk.price) || 0,
            high24h: 0,
            low24h: 0,
            volume24h: parseFloat(tk.sequence) || 0,
            bid: parseFloat(tk.bestBid) || 0,
            ask: parseFloat(tk.bestAsk) || 0,
            priceChangePercent: 0,
          };
        } else if (exchange === "okx" && type === "ticker") {
          const tk = rawData.data?.[0] || {};
          parsedStats = {
            lastPrice: parseFloat(tk.last) || 0,
            high24h: parseFloat(tk.high24h) || 0,
            low24h: parseFloat(tk.low24h) || 0,
            volume24h: parseFloat(tk.vol24h) || 0,
            bid: parseFloat(tk.bidPx) || 0,
            ask: parseFloat(tk.askPx) || 0,
            priceChangePercent: 0,
          };
        } else if (exchange === "bybit" && type === "ticker") {
          const tk = rawData.result?.list?.[0] || {};
          parsedStats = {
            lastPrice: parseFloat(tk.lastPrice) || 0,
            high24h: parseFloat(tk.highPrice24h) || 0,
            low24h: parseFloat(tk.lowPrice24h) || 0,
            volume24h: parseFloat(tk.volume24h) || 0,
            bid: parseFloat(tk.bid1Price) || 0,
            ask: parseFloat(tk.ask1Price) || 0,
            priceChangePercent: parseFloat(tk.price24hPcnt) * 100 || 0,
          };
        } else if (exchange === "indodax" && type === "ticker") {
          const tk = rawData.ticker || {};
          parsedStats = {
            lastPrice: parseFloat(tk.last) || 0,
            high24h: parseFloat(tk.high) || 0,
            low24h: parseFloat(tk.low) || 0,
            volume24h: parseFloat(tk.vol_btc || tk.vol_idr) || 0,
            bid: parseFloat(tk.buy) || 0,
            ask: parseFloat(tk.sell) || 0,
            priceChangePercent: 0,
          };
        } else if (exchange === "gateio" && type === "ticker") {
          const tk = rawData?.[0] || {};
          parsedStats = {
            lastPrice: parseFloat(tk.last) || 0,
            high24h: parseFloat(tk.high_24h) || 0,
            low24h: parseFloat(tk.low_24h) || 0,
            volume24h: parseFloat(tk.base_volume) || 0,
            bid: parseFloat(tk.highest_bid) || 0,
            ask: parseFloat(tk.lowest_ask) || 0,
            priceChangePercent: parseFloat(tk.change_percentage) || 0,
          };
        }
      } catch (parseErr) {
        console.warn("Error mapping uniform ticker fields:", parseErr);
      }

      res.json({
        url,
        exchange,
        type,
        pair,
        mappedPair,
        raw: rawData,
        parsedStats
      });

    } catch (e: any) {
      console.error(`Error fetching real exchange API [${exchange}]:`, e);
      res.status(500).json({
        error: `Gagal memuat API dari bursa ${exchange}.`,
        url,
        message: e.message || String(e)
      });
    }
  });

  // Lazy initialize Gemini clients to prevent startup crashes if key is omitted
  let aiInstance: GoogleGenAI | null = null;
  function getGemini(): GoogleGenAI {
    if (!aiInstance) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in environments.");
      }
      aiInstance = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiInstance;
  }

  // API Route: AI Crypto Analysis report
  app.post("/api/gemini/analyze", async (req, res) => {
    try {
      const { coinName, symbol, price, priceChange24h, marketCap, volume24h, category } = req.body;

      if (!coinName || !symbol) {
        return res.status(400).json({ error: "Missing coin identification parameters." });
      }

      const ai = getGemini();
      const prompt = `
        Anda adalah analis keuangan mata uang kripto senior di CoinCIKOX. Berikan laporan analisis koin yang sangat mendalam dan profesional mengenai koin berikut:
        - Nama Koin: ${coinName} (${symbol})
        - Harga saat ini: USD ${price?.toLocaleString() || "Tidak ada data"}
        - Perubahan 24 Jam: ${priceChange24h}%
        - Kapitalisasi Pasar: USD ${marketCap?.toLocaleString() || "Tidak ada data"}
        - Volume Transaksi 24 Jam: USD ${volume24h?.toLocaleString() || "Tidak ada data"}
        - Kategori Sektor: ${category || "Umum"}

        Tolong strukturkan analisis Anda secara profesional dalam format Markdown dengan bahasa Indonesia yang jelas, elegan, dan mendalam. Laporan harus mencakup:
        1. **Tinjauan Proyek & Utilitas**: Apa inti proyek ini dan kegunaan tokennya?
        2. **Analisis Tren Sentimen**: Bagaimana sentimen pasar terkini berdasarkan perubahan harga ${priceChange24h}% (Bullish/Bearish/Netral), serta potensi harganya?
        3. **Analisis SWOT Koin**: Kelebihan utama (Strengths), Kelemahan (Weaknesses), Peluang (Opportunities), dan Ancaman (Threats) di masa depan.
        4. **Rekomendasi Strategis**: Tips praktis manajemen risiko bagi investor retail yang memegang atau berminat membeli ${symbol}.

        Buat analisis ini terlihat sangat kredibel, obyektif, dan tidak sekadar hype, sejalan dengan standar institusional profesional CoinCIKOX.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ analysis: response.text });
    } catch (error: any) {
      console.error("Gemini Analysis Error:", error);
      res.status(500).json({
        error: "Gagal memproses analisis AI.",
        message: error.message || String(error),
      });
    }
  });

  // API Route: AI Advisor Chatbot
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, chatHistory } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Pesan tidak boleh kosong." });
      }

      const ai = getGemini();

      // Standardize system instructions for full crypto advisory context
      const systemInstruction = `
        Anda adalah "AI Crypto Advisor" dari CoinCIKOX, asisten virtual dan penasihat finansial kripto yang ramah, objektif, dan sangat paham blockchain. 
        Tugas Anda adalah memandu pengguna menjawab pertanyaan seputar cryptocurrency, strategi portofolio, teknologi Web3, DeFi, NFTS, tren harga, dan analisis pasar.
        
        Aturan utama:
        1. Jawablah menggunakan bahasa Indonesia yang ramah, profesional, mudah dipahami, tetapi tetap berbobot ilmiah dan finansial.
        2. Ingatkan pengguna secara santun bahwa investasi kripto berisiko tinggi dan jawaban Anda hanyalah analisis edukatif, bukan nasihat keuangan resmi (Always include a gentle financial risk disclaimer).
        3. Selalu siap menawarkan contoh konkret, analogi yang mudah dicerna, serta tip manajemen risiko.
        4. Gunakan pemformatan Markdown (bold, list, bullet) agar jawaban nyaman dibaca.
      `;

      // Structure contents array containing history and current message
      const historyParts = chatHistory ? chatHistory.map((h: { role: string; text: string }) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      })) : [];

      historyParts.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: historyParts,
        config: {
          systemInstruction,
        },
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Gemini Advisor Chat Error:", error);
      res.status(500).json({
        error: "Gagal mengirimkan pesan AI.",
        message: error.message || String(error),
      });
    }
  });

  // Setup Vite Dev server or static files server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] CoinCIKOX full-stack app running on http://localhost:${PORT}`);
  });
}

startServer();
