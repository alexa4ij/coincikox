import React from "react";
import { Coin } from "../types";
import { Star, StarOff, EyeOff } from "lucide-react";
import { SupportedLang, SupportedCurrency, TRANSLATIONS, formatCurrency } from "../utils/localization";

interface WatchlistProps {
  coins: Coin[];
  watchlist: string[];
  onToggleWatchlist: (coinId: string) => void;
  onSelectCoin: (coin: Coin) => void;
  lang: SupportedLang;
  currency: SupportedCurrency;
  rates: Record<string, number>;
}

export default function Watchlist({
  coins,
  watchlist,
  onToggleWatchlist,
  onSelectCoin,
  lang,
  currency,
  rates,
}: WatchlistProps) {
  const t = TRANSLATIONS[lang];
  const starredCoins = coins.filter((c) => watchlist.includes(c.id));

  // Small SVG renderer
  const drawSparkline = (points: number[], change24h: number) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    const formattedPoints = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    });

    return (
      <svg width={width} height={height}>
        <polyline
          fill="none"
          stroke={change24h >= 0 ? "#10b981" : "#ef4444"}
          strokeWidth="1.5"
          points={formattedPoints.join(" ")}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Description header */}
      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
        <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider mb-2">
          {t.navWatchlist || "Watchlist"}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-2xl font-medium">
          {lang === "id" 
            ? "Gunakan halaman ini untuk memantau pergerakan harga instan koin favorit Anda tanpa terganggu token lainnya. Klik bintang pada halaman pasar utama untuk memasukkan atau membuang koin."
            : "Monitor asset fluctuation of choice isolated from secondary noise. Toggle star emblems on the main crypto markets table to add or remove targets."}
        </p>
      </div>

      {/* Starred lists dashboard */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs font-bold bg-slate-950/50 select-none">
                <th className="py-3.5 px-4 w-12 text-center">Fav</th>
                <th className="py-3.5 px-3 w-14 text-center">#</th>
                <th className="py-3.5 px-3">{t.colCoin || "Coin"}</th>
                <th className="py-3.5 px-3 text-right">{t.colPrice || "Price"} ({currency})</th>
                <th className="py-3.5 px-3 text-right">{t.col24h || "24h"}%</th>
                <th className="py-3.5 px-3 text-right">{t.colMarketCap || "Market Cap"}</th>
                <th className="py-3.5 px-3 text-right">{t.colVolume || "Volume (24h)"}</th>
                <th className="py-3.5 px-4 text-center">{t.colSparkline || "Last 7 Days"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {starredCoins.map((coin) => {
                const isPositive = coin.priceChange24h >= 0;
                return (
                  <tr key={coin.id} className="hover:bg-slate-900/30 transition-colors">
                    
                    {/* Unstar */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onToggleWatchlist(coin.id)}
                        className="text-amber-400 hover:text-slate-600 transition-colors cursor-pointer"
                        title={lang === "id" ? "Hapus dari Daftar Pantau" : "Remove from watchlist"}
                      >
                        <Star size={16} fill="currentColor" />
                      </button>
                    </td>

                    {/* Rank */}
                    <td className="py-3.5 px-3 text-center text-xs font-mono font-bold text-slate-500">
                      {coin.rank}
                    </td>

                    {/* Asset details */}
                    <td 
                      onClick={() => onSelectCoin(coin)}
                      className="py-3.5 px-3 font-semibold cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        {coin.image ? (
                          <img
                            src={coin.image}
                            alt={coin.name}
                            referrerPolicy="no-referrer"
                            className="h-5.5 w-5.5 rounded-full object-cover border border-slate-800 shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                            }}
                          />
                        ) : (
                          <div className="h-5.5 w-5.5 bg-slate-800 rounded-full flex items-center justify-center font-bold text-[9px] text-blue-400 uppercase shrink-0">
                            {coin.symbol.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <span className="text-slate-100 font-bold group-hover:text-blue-400 transition-colors">{coin.name}</span>
                          <span className="text-[10px] text-slate-500 font-extrabold font-mono ml-1.5">{coin.symbol}</span>
                        </div>
                      </div>
                    </td>

                    {/* Price with fx rate */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-100">
                      {formatCurrency(coin.price, currency, rates)}
                    </td>

                    {/* 24h Change */}
                    <td className={`py-3.5 px-3 text-right font-mono font-bold text-xs ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                      {isPositive ? "+" : ""}{coin.priceChange24h}%
                    </td>

                    {/* Market Cap */}
                    <td className="py-3.5 px-3 text-right font-mono text-xs text-slate-350">
                      {formatCurrency(coin.marketCap, currency, rates)}
                    </td>

                    {/* Volume */}
                    <td className="py-3.5 px-3 text-right font-mono text-xs text-slate-350">
                      {formatCurrency(coin.volume24h, currency, rates)}
                    </td>

                    {/* Small sparkline */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex justify-center">
                        {drawSparkline(coin.sparkline, coin.priceChange24h)}
                      </div>
                    </td>

                  </tr>
                );
              })}

              {starredCoins.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3 select-none">
                      <EyeOff size={32} className="text-slate-700" />
                      <p className="font-extrabold text-slate-400">{t.watchNoCoins || "Your watchlist is empty."}</p>
                      <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-semibold">
                        {lang === "id" 
                          ? "Berikan tanda bintang pada koin-koin di menu utama untuk memantau mereka secara terintegrasi." 
                          : "Star specific crypto tokens on the markets dashboard to monitor them cleanly."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
