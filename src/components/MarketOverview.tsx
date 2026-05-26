import React, { useState, useEffect, useRef } from "react";
import { Coin, CryptoGlobalStats } from "../types";
import { Star, StarOff, TrendingUp, ChevronUp, ChevronDown, Award, Sparkles, Flame, Percent } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SupportedLang, SupportedCurrency, TRANSLATIONS, formatCurrency, CURRENCY_SYMBOLS } from "../utils/localization";

interface MarketOverviewProps {
  coins: Coin[];
  onSelectCoin: (coin: Coin) => void;
  watchlist: string[];
  onToggleWatchlist: (coinId: string) => void;
  globalStats: CryptoGlobalStats;
  lang: SupportedLang;
  currency: SupportedCurrency;
  rates: Record<string, number>;
}

export default function MarketOverview({
  coins,
  onSelectCoin,
  watchlist,
  onToggleWatchlist,
  globalStats,
  lang,
  currency,
  rates,
}: MarketOverviewProps) {
  const t = TRANSLATIONS[lang];
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "trending" | "gainers" | "losers" | "volume">("all");
  const [sortField, setSortField] = useState<string>("rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Track previous prices for flickering highlight animations
  const prevPricesRef = useRef<{ [key: string]: number }>({});
  const [priceFlash, setPriceFlash] = useState<{ [key: string]: "up" | "down" | null }>({});

  useEffect(() => {
    const nextFlash: { [key: string]: "up" | "down" | null } = {};
    let hasChanges = false;
    
    coins.forEach((c) => {
      const prevPrice = prevPricesRef.current[c.id];
      if (prevPrice !== undefined && prevPrice !== c.price) {
        nextFlash[c.id] = c.price > prevPrice ? "up" : "down";
        hasChanges = true;
      }
      prevPricesRef.current[c.id] = c.price;
    });

    if (hasChanges) {
      setPriceFlash((prev) => ({ ...prev, ...nextFlash }));
      const timer = setTimeout(() => {
        setPriceFlash({});
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [coins]);

  // Sort logic
  const handleSort = (field: string) => {
    setSelectedFilter("all"); // Reset list tab filter to allow standard sorting when clicking headers
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getFilteredAndSortedCoins = () => {
    let result = [...coins];

    // 1. Sector Category Filter
    if (selectedCategory !== "all") {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // 2. Main Filter / Selected Tab Sorting
    if (selectedFilter === "trending") {
      result.sort((a, b) => (b.priceChange7d || 0) - (a.priceChange7d || 0));
    } else if (selectedFilter === "gainers") {
      result.sort((a, b) => (b.priceChange24h || 0) - (a.priceChange24h || 0));
    } else if (selectedFilter === "losers") {
      result.sort((a, b) => (a.priceChange24h || 0) - (b.priceChange24h || 0));
    } else if (selectedFilter === "volume") {
      result.sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0));
    } else {
      // Default: manual column headers interactive sort
      result.sort((a, b) => {
        let valA: any = a[sortField as keyof Coin];
        let valB: any = b[sortField as keyof Coin];

        if (valA === undefined) return 1;
        if (valB === undefined) return -1;

        if (typeof valA === "string") {
          return sortDirection === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }
      });
    }

    return result;
  };

  const processedCoins = getFilteredAndSortedCoins();

  // Spotlights helper: get trending is sort by priceChange7d, top gainers is by priceChange24h
  const trendingCoins = [...coins].sort((a, b) => b.priceChange7d - a.priceChange7d).slice(0, 3);
  const topGainers = [...coins].sort((a, b) => b.priceChange24h - a.priceChange24h).slice(0, 3);

  // SVG mini-sparkline generator helper
  const drawSparkline = (points: number[], change24h: number) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 110;
    const height = 36;
    const padding = 2;

    const strokeColor = change24h >= 0 ? "#10b981" : "#ef4444";

    const formattedPoints = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((val - min) / range) * (height - padding * 2) - padding;
      return `${x},${y}`;
    });

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={formattedPoints.join(" ")}
        />
      </svg>
    );
  };

  // Human readable supply numbers
  const formatSupplyNumber = (num: number, symbol: string) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T ${symbol}`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B ${symbol}`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M ${symbol}`;
    return `${num.toLocaleString()} ${symbol}`;
  };

  const categories = [
    { id: "all", label: t.sectorAll || "All Sectors" },
    { id: "layer-1", label: t.sectorLayer1 || "Layer 1" },
    { id: "defi", label: t.sectorDeFi || "DeFi" },
    { id: "meme", label: t.sectorMeme || "Meme" },
    { id: "layer-2", label: t.sectorLayer2 || "Layer 2" },
    { id: "ai", label: t.sectorAI || "AI" },
    { id: "gaming", label: t.sectorGaming || "Gaming" },
  ];

  return (
    <div className="w-full space-y-6">
      
      {/* 1. Spotlight Spot panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Spot A: Trending Section */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-705 transition-all shadow-sm">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-3">
            <Flame size={14} className="animate-bounce" />
            <span>{t.tabTrending || "Trending List"} (7d)</span>
          </div>
          <div className="space-y-2">
            {trendingCoins.map((tc, index) => (
              <div 
                key={tc.id} 
                onClick={() => onSelectCoin(tc)}
                className="flex items-center justify-between cursor-pointer group hover:bg-slate-850/50 p-1.5 rounded-xl transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 font-mono">#{index + 1}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{tc.name}</span>
                    <span className="text-[10px] text-slate-500 font-extrabold">{tc.symbol}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {formatCurrency(tc.price, currency, rates)}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">+{tc.priceChange7d}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spot B: Top Gainers Section */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-705 transition-all shadow-sm">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-3">
            <TrendingUp size={14} />
            <span>{t.tabGainers || "Top Gainers"} (24h)</span>
          </div>
          <div className="space-y-2">
            {topGainers.map((tg, index) => (
              <div 
                key={tg.id} 
                onClick={() => onSelectCoin(tg)}
                className="flex items-center justify-between cursor-pointer group hover:bg-slate-850/50 p-1.5 rounded-xl transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 font-mono">#{index + 1}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{tg.name}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{tg.symbol}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {formatCurrency(tg.price, currency, rates)}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">+{tg.priceChange24h}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spot C: Fear & Greed Index Dial Widget */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-705 transition-all shadow-sm">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles size={14} />
            <span>{lang === "id" ? "Indeks Sentimen" : "Market Sentiment Index"}</span>
          </div>
          
          <div className="flex items-center justify-between gap-4 py-1">
            <div className="flex-1 flex flex-col justify-center">
              <span className="text-xl font-black text-rose-400 tracking-tight">GREED</span>
              <span className="text-emerald-400 text-2xl font-black font-mono">74/100</span>
              <p className="text-[9.5px] text-slate-400 mt-1">
                {lang === "id" ? "Sentimen pasar sangat bernafsu mengumpulkan aset." : "Sentiment shows rich buying pressure."}
              </p>
            </div>
            
            {/* Index Visual Indicator Ring */}
            <div className="relative h-16 w-16 flex items-center justify-center">
              <svg className="absolute transform -rotate-90 w-full h-full">
                <circle cx="32" cy="32" r="26" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                <circle cx="32" cy="32" r="26" stroke="#10b981" strokeWidth="6" fill="transparent" strokeDasharray={162} strokeDashoffset={162 - (74 / 100) * 162} strokeLinecap="round" />
              </svg>
              <span className="text-[10px] font-bold text-emerald-400">74%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Focus Markets Filter Tabs */}
      <div className="border-b border-slate-900 pb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-2.5 scrollbar-none max-w-full">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-2 transition-all cursor-pointer ${
              selectedFilter === "all"
                ? "bg-slate-100 text-slate-900 border-slate-100 shadow-lg shadow-slate-100/10"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Sparkles size={13} />
            <span>{t.tabAllCoins || "All Coins"}</span>
          </button>
          
          <button
            onClick={() => setSelectedFilter("trending")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-2 transition-all cursor-pointer ${
              selectedFilter === "trending"
                ? "bg-amber-450 text-slate-950 border-amber-400 bg-amber-450 shadow-lg shadow-amber-500/10"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Flame size={13} />
            <span>{t.tabTrending || "Trending List"}</span>
          </button>

          <button
            onClick={() => setSelectedFilter("gainers")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-2 transition-all cursor-pointer ${
              selectedFilter === "gainers"
                ? "bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg shadow-emerald-555/10"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <TrendingUp size={13} />
            <span>{t.tabGainers || "Top Gainers"}</span>
          </button>

          <button
            onClick={() => setSelectedFilter("losers")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-2 transition-all cursor-pointer ${
              selectedFilter === "losers"
                ? "bg-rose-500 text-slate-100 border-rose-500 shadow-lg shadow-rose-555/10"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <ChevronDown size={13} />
            <span>{t.tabLosers || "Top Losers"}</span>
          </button>

          <button
            onClick={() => setSelectedFilter("volume")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-2 transition-all cursor-pointer ${
              selectedFilter === "volume"
                ? "bg-blue-500 text-slate-50 border-blue-500 shadow-lg shadow-blue-555/10"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Percent size={13} style={{ strokeWidth: 3 }} />
            <span>{t.tabHighestVolume || "Highest Volume"}</span>
          </button>
        </div>
      </div>

      {/* 2. Sektor Category Tab Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none max-w-full">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                selectedCategory === cat.id
                  ? "bg-slate-800 text-slate-100 shadow-sm"
                  : "text-slate-500 hover:bg-slate-900/60 hover:text-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-[10.5px] font-mono text-slate-500 font-bold select-none">
          {lang === "id" ? `Menampilkan ${processedCoins.length} koin` : `Showing ${processedCoins.length} assets`}
        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold tracking-tight bg-slate-900/40 select-none">
                <th className="py-4 px-4 w-12 text-center">Fav</th>
                <th className="py-4 px-3 w-14 text-center cursor-pointer hover:text-slate-200" onClick={() => handleSort("rank")}>
                  # {sortField === "rank" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-4 px-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort("name")}>
                  {t.colCoin || "Coin"} {sortField === "name" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-4 px-3 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort("price")}>
                  {t.colPrice || "Price"} ({currency}) {sortField === "price" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-4 px-3 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort("priceChange1h")}>
                  {t.col1h || "1h"}% {sortField === "priceChange1h" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-4 px-3 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort("priceChange24h")}>
                  {t.col24h || "24h"}% {sortField === "priceChange24h" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-4 px-3 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort("priceChange7d")}>
                  {t.col7d || "7d"}% {sortField === "priceChange7d" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-4 px-3 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort("marketCap")}>
                  {t.colMarketCap || "Market Cap"} {sortField === "marketCap" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-4 px-3 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort("volume24h")}>
                  {t.colVolume || "Volume (24h)"} {sortField === "volume24h" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-4 px-3 text-right hidden lg:table-cell cursor-pointer hover:text-slate-200" onClick={() => handleSort("circulatingSupply")}>
                  {t.colSupply || "Circulating Supply"} {sortField === "circulatingSupply" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-4 px-4 text-center">{t.colSparkline || "Last 7 Days"}</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-850">
              <AnimatePresence>
                {processedCoins.map((coin) => {
                  const isStarred = watchlist.includes(coin.id);
                  const isOneAndUp = coin.priceChange1h >= 0;
                  const isTwoAndUp = coin.priceChange24h >= 0;
                  const isSevenAndUp = coin.priceChange7d >= 0;

                  // Highlighting animation trigger state
                  const flashState = priceFlash[coin.id];
                  let coinRowHighlight = "transition-all";
                  if (flashState === "up") {
                    coinRowHighlight = "bg-emerald-500/10 scale-[1.002] transition-none";
                  } else if (flashState === "down") {
                    coinRowHighlight = "bg-rose-500/10 scale-[1.002] transition-none";
                  }

                  return (
                    <tr
                      key={coin.id}
                      className={`hover:bg-slate-900/60 duration-200 ${coinRowHighlight}`}
                    >
                      {/* Star Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWatchlist(coin.id);
                          }}
                          className={`${
                            isStarred ? "text-amber-400" : "text-slate-600 hover:text-slate-400"
                          } transition-colors cursor-pointer`}
                        >
                          {isStarred ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
                        </button>
                      </td>

                      {/* Rank */}
                      <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-500 font-bold">
                        {coin.rank}
                      </td>

                      {/* Coin Identity */}
                      <td 
                        onClick={() => onSelectCoin(coin)}
                        className="py-3.5 px-3 font-semibold cursor-pointer select-none group"
                      >
                        <div className="flex items-center gap-2">
                          {coin.image ? (
                            <img
                              src={coin.image}
                              alt={coin.name}
                              referrerPolicy="no-referrer"
                              className="h-6.5 w-6.5 rounded-full object-cover border border-slate-900 shadow-sm shrink-0"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="bg-slate-800 h-6.5 w-6.5 rounded-full flex items-center justify-center text-[9px] font-black text-blue-400 uppercase tracking-widest border border-slate-700 group-hover:border-blue-500 transition-colors shrink-0">
                              {coin.symbol.slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <span className="text-slate-100 font-bold text-sm group-hover:text-blue-400 transition-colors line-clamp-1">
                              {coin.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded ml-1.5 uppercase">
                              {coin.symbol}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Price based on chosen Currency and custom exchange FX rate */}
                      <td className="py-3.5 px-3 text-right font-mono text-sm text-slate-100 font-bold">
                        {formatCurrency(coin.price, currency, rates)}
                      </td>

                      {/* 1h Change */}
                      <td className={`py-3.5 px-3 text-right font-mono font-bold text-xs ${isOneAndUp ? "text-emerald-400" : "text-rose-400"}`}>
                        <span className="flex items-center justify-end gap-0.5">
                          {isOneAndUp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {Math.abs(coin.priceChange1h).toFixed(2)}%
                        </span>
                      </td>

                      {/* 24h Change */}
                      <td className={`py-3.5 px-3 text-right font-mono font-bold text-xs ${isTwoAndUp ? "text-emerald-400" : "text-rose-400"}`}>
                        <span className="flex items-center justify-end gap-0.5">
                          {isTwoAndUp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {Math.abs(coin.priceChange24h).toFixed(2)}%
                        </span>
                      </td>

                      {/* 7d Change */}
                      <td className={`py-3.5 px-3 text-right font-mono font-bold text-xs ${isSevenAndUp ? "text-emerald-400" : "text-rose-400"}`}>
                        <span className="flex items-center justify-end gap-0.5">
                          {isSevenAndUp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {Math.abs(coin.priceChange7d).toFixed(2)}%
                        </span>
                      </td>

                      {/* Market Cap */}
                      <td className="py-3.5 px-3 text-right font-mono text-xs text-slate-200">
                        {formatCurrency(coin.marketCap, currency, rates)}
                      </td>

                      {/* Volume 24h */}
                      <td className="py-3.5 px-3 text-right font-mono text-xs">
                        <span className="text-slate-200">
                          {formatCurrency(coin.volume24h, currency, rates)}
                        </span>
                        <p className="text-[9px] text-slate-500 font-bold font-sans">
                          {(coin.volume24h / coin.marketCap * 100).toFixed(2)}% turn-rate
                        </p>
                      </td>

                      {/* Circulating Supply */}
                      <td className="py-3.5 px-3 text-right font-mono text-xs hidden lg:table-cell text-slate-400 font-bold">
                        {formatSupplyNumber(coin.circulatingSupply, coin.symbol)}
                        {coin.maxSupply && (
                          <div className="w-24 bg-slate-800 h-1 rounded-full ml-auto mt-1 overflow-hidden">
                            <div 
                              className="bg-blue-500 h-full rounded-full"
                              style={{ width: `${(coin.circulatingSupply / coin.maxSupply) * 100}%` }}
                            />
                          </div>
                        )}
                      </td>

                      {/* Sparkline Graph */}
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex justify-center">
                          {drawSparkline(coin.sparkline, coin.priceChange24h)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {processedCoins.length === 0 && (
          <div className="text-center py-12 bg-slate-900/30">
            <p className="text-slate-400 font-medium">{t.watchNoCoins || "No match."}</p>
          </div>
        )}
      </div>

    </div>
  );
}
