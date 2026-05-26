import React from "react";
import { CryptoGlobalStats } from "../types";
import { TrendingUp, TrendingDown, Flame, BarChart2 } from "lucide-react";
import { SupportedLang, SupportedCurrency, TRANSLATIONS, CURRENCY_SYMBOLS } from "../utils/localization";

interface GlobalStatsHeaderProps {
  stats: CryptoGlobalStats;
  lang: SupportedLang;
  currency: SupportedCurrency;
  rates: Record<string, number>;
}

export default function GlobalStatsHeader({ stats, lang, currency, rates }: GlobalStatsHeaderProps) {
  const t = TRANSLATIONS[lang];
  const isCapPositive = stats.marketCapChange24h >= 0;

  // Render abbreviated large figures matching global currency FX rates
  function formatBrief(val: number, cur: SupportedCurrency): string {
    const converted = val * (rates[cur] || 1);
    const symbol = CURRENCY_SYMBOLS[cur] || "";
    
    if (cur === "IDR") {
      if (converted >= 1e15) return `${symbol}${(converted / 1e15).toFixed(2)} Quad`;
      if (converted >= 1e12) return `${symbol}${(converted / 1e12).toFixed(2)} Triliun`;
      if (converted >= 1e9) return `${symbol}${(converted / 1e9).toFixed(2)} Miliar`;
      return `${symbol}${Math.round(converted).toLocaleString("id-ID")}`;
    }

    if (cur === "BTC" || cur === "ETH") {
      if (converted >= 1e6) return `${symbol}${(converted / 1e6).toFixed(1)}M`;
      return `${symbol}${Math.round(converted).toLocaleString()}`;
    }

    // Standard high-cap fiat (USD, EUR, GBP, AUD, JPY)
    if (converted >= 1e12) return `${symbol}${(converted / 1e12).toFixed(2)}T`;
    if (converted >= 1e9) return `${symbol}${(converted / 1e9).toFixed(1)}B`;
    if (converted >= 1e6) return `${symbol}${(converted / 1e6).toFixed(1)}M`;
    return `${symbol}${Math.round(converted).toLocaleString()}`;
  }

  return (
    <div className="w-full bg-slate-900 text-slate-400 text-[10.5px] md:text-xs border-b border-slate-850 py-2 px-4 shadow-sm z-50 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap scrollbar-none">
        
        {/* Left Stats Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 shrink-0">
            <span>{t.statCryptos || "Cryptos"}:</span>
            <span className="text-blue-400 font-bold">{stats.activeCryptos.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <span>{t.statExchanges || "Exchanges"}:</span>
            <span className="text-blue-400 font-bold">{stats.activeExchanges}</span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3 md:pl-4 shrink-0">
            <span>{t.statMarketCap || "Market Cap"}:</span>
            <span className="text-slate-100 font-bold">
              {formatBrief(stats.totalMarketCap, currency)}
            </span>
            <span className={`flex items-center gap-0.5 ml-0.5 text-[9.5px] md:text-[10px] font-black ${isCapPositive ? "text-emerald-500" : "text-rose-500"}`}>
              {isCapPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {isCapPositive ? "+" : ""}{stats.marketCapChange24h}%
            </span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3 md:pl-4 shrink-0">
            <span>{t.statVol24h || "24h Vol"}:</span>
            <span className="text-slate-100 font-bold">{formatBrief(stats.volume24h, currency)}</span>
            <span className="text-emerald-500 font-bold text-[9.5px] md:text-[10px]">+{stats.volumeChange24h}%</span>
          </div>
        </div>

        {/* Right Stats Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 shrink-0">
            <BarChart2 size={12} className="text-slate-500" />
            <span>{t.statDominance || "Dominance"}:</span>
            <span className="text-slate-300">BTC: <span className="font-bold text-blue-400">{stats.btcDominance}%</span></span>
            <span className="text-slate-300">ETH: <span className="font-bold text-blue-400">{stats.ethDominance}%</span></span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3 md:pl-4 shrink-0">
            <Flame size={12} className="text-amber-500" />
            <span>{t.statGas || "Gas"}:</span>
            <span className="text-slate-200 font-bold">{stats.gasPriceGwei} Gwei</span>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-800 pl-3 md:pl-4 shrink-0 select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-200 font-bold text-[10px]">Real-Time Feed</span>
          </div>
        </div>

      </div>
    </div>
  );
}
