import React, { useState, useEffect } from "react";
import { Coin, Transaction, PortfolioHolding } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Plus, Trash2, Wallet, ArrowUpRight, ArrowDownRight, Award, PlusCircle, X } from "lucide-react";
import { SupportedLang, SupportedCurrency, TRANSLATIONS, formatCurrency, CURRENCY_SYMBOLS } from "../utils/localization";

interface PortfolioTrackerProps {
  coins: Coin[];
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, "id" | "date">) => void;
  onDeleteTransaction: (txId: string) => void;
  lang: SupportedLang;
  currency: SupportedCurrency;
  rates: Record<string, number>;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e", "#06b6d4"];

export default function PortfolioTracker({
  coins,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  lang,
  currency,
  rates,
}: PortfolioTrackerProps) {
  const t = TRANSLATIONS[lang];

  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [selectedCoinId, setSelectedCoinId] = useState(coins[0]?.id || "");
  const [txType, setTxType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState<number>(0.1);
  const [price, setPrice] = useState<number>(coins[0]?.price || 100);

  // Sync price input with selected coin
  const handleCoinChange = (coinId: string) => {
    setSelectedCoinId(coinId);
    const targetCoin = coins.find((c) => c.id === coinId);
    if (targetCoin) {
      setPrice(targetCoin.price);
    }
  };

  // Compute holdings based on raw transaction events log
  const computeHoldings = (): PortfolioHolding[] => {
    const holdingsMap: { [coinId: string]: { totalQty: number; totalCost: number } } = {};

    // Sort transactions chronologically
    const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedTx.forEach((tx) => {
      const coinId = tx.coinId;
      if (!holdingsMap[coinId]) {
        holdingsMap[coinId] = { totalQty: 0, totalCost: 0 };
      }

      const h = holdingsMap[coinId];

      if (tx.type === "BUY") {
        h.totalQty += tx.quantity;
        h.totalCost += tx.quantity * tx.price;
      } else if (tx.type === "SELL") {
        const actualSold = Math.min(tx.quantity, h.totalQty);
        if (h.totalQty > 0) {
          const avgPriceBefore = h.totalCost / h.totalQty;
          h.totalQty -= actualSold;
          h.totalCost = h.totalQty * avgPriceBefore;
        }
      }
    });

    const holdingsList: PortfolioHolding[] = [];

    Object.keys(holdingsMap).forEach((id) => {
      const h = holdingsMap[id];
      if (h.totalQty <= 0) return;

      const coin = coins.find((c) => c.id === id);
      if (!coin) return;

      const currentValue = h.totalQty * coin.price;
      const netProfit = currentValue - h.totalCost;
      const avgBuyPrice = h.totalQty > 0 ? h.totalCost / h.totalQty : 0;
      const profitPercentage = h.totalCost > 0 ? (netProfit / h.totalCost) * 100 : 0;

      holdingsList.push({
        coinId: id,
        coin,
        quantity: h.totalQty,
        avgBuyPrice,
        totalCost: h.totalCost,
        currentValue,
        netProfit,
        profitPercentage,
      });
    });

    return holdingsList;
  };

  const holdings = computeHoldings();

  // Metrics computing
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalInvested = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalProfit = totalValue - totalInvested;
  const totalProfitPct = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  // Best performer from holding lists
  const bestPerformer = holdings.length > 0 
    ? [...holdings].sort((a, b) => b.profitPercentage - a.profitPercentage)[0]
    : null;

  // Chart dataset for Recharts Pie
  const chartData = holdings.map((h) => {
    const rate = rates[currency] || 1;
    return {
      name: h.coin.name,
      value: parseFloat((h.currentValue * rate).toFixed(2)),
    };
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 || price <= 0) return;
    
    onAddTransaction({
      coinId: selectedCoinId,
      type: txType,
      quantity,
      price,
    });

    setIsOpenAddModal(false);
    setQuantity(0.1);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 2. Top Stats Overview banner row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card A: Net worth block */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">
            <Wallet size={14} className="text-blue-500" />
            <span>{t.navPortfolio || "Net Portfolio Value"}</span>
          </div>
          <div>
            <span className="text-2xl font-black font-mono text-slate-100 tracking-tight">
              {formatCurrency(totalValue, currency, rates)}
            </span>
          </div>
          <div className={`flex items-center text-xs font-bold gap-1 mt-2 ${totalProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {totalProfit >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            <span>{totalProfit >= 0 ? "+" : ""}{formatCurrency(totalProfit, currency, rates)} ({totalProfitPct.toFixed(2)}%)</span>
          </div>
        </div>

        {/* Card B: Total Investment cost */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
          <div className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">
            {lang === "id" ? "Total Modal Diinvestasikan" : "Total Invested Capital"}
          </div>
          <div>
            <span className="text-xl font-bold font-mono text-slate-200">
              {formatCurrency(totalInvested, currency, rates)}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono font-bold">
            {lang === "id" ? `Tersebar di ${holdings.length} aset.` : `Spread across ${holdings.length} unique assets.`}
          </p>
        </div>

        {/* Card C: Cumulative ROI status */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
          <div className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">
            {lang === "id" ? "Hasil Imbal Hasil (ROI)" : "Cumulative ROI Yield"}
          </div>
          <div className={`text-xl font-black font-mono ${totalProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {totalProfit >= 0 ? "+" : ""}{formatCurrency(totalProfit, currency, rates)}
          </div>
          <span className={`text-[10.5px] font-bold mt-2 font-mono ${totalProfit >= 0 ? "text-emerald-500/85" : "text-rose-500/85"}`}>
            {totalProfitPct.toFixed(1)}% ROI total
          </span>
        </div>

        {/* Card D: Best asset holder winner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">
            <Award size={14} className="text-amber-500" />
            <span>{lang === "id" ? "Bintang Performer" : "Best Asset Performer"}</span>
          </div>
          <div>
            <span className="text-md font-black text-slate-100 uppercase tracking-tight line-clamp-1">
              {bestPerformer ? `${bestPerformer.coin.name} (${bestPerformer.coin.symbol})` : "---"}
            </span>
          </div>
          <div className="text-[10px] text-emerald-400 font-bold font-mono mt-2">
            {bestPerformer ? `+${bestPerformer.profitPercentage.toFixed(1)}% ROI` : "---"}
          </div>
        </div>

      </div>

      {/* 3. Allocations and Holdings lists block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section: Holdings List Detail Table */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
          <div className="p-5 border-b border-slate-850 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">{lang === "id" ? "Aset Saya saat Ini" : "My Current Allocation Holdings"}</h3>
            </div>
            
            <button
              onClick={() => setIsOpenAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 transition-all font-black text-xs text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Plus size={14} />
              <span>{lang === "id" ? "Buat Transaksi" : "Add Order Receipt"}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-xs font-bold tracking-tight bg-slate-900/40 select-none">
                  <th className="py-3 px-4">{t.colCoin || "Coin"}</th>
                  <th className="py-3 px-3 text-right">{lang === "id" ? "Kuantitas Balans" : "Balance"}</th>
                  <th className="py-3 px-3 text-right">{lang === "id" ? "Biaya Rata-Rata" : "Avg Buy Price"}</th>
                  <th className="py-3 px-3 text-right">{t.colPrice || "Live Price"}</th>
                  <th className="py-3 px-3 text-right">{lang === "id" ? "Nilai Bersih" : "Net Value"}</th>
                  <th className="py-3 px-4 text-right">{lang === "id" ? "Kenaikan/ROI" : "Net Profit"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {holdings.map((h) => {
                  const isUp = h.netProfit >= 0;
                  return (
                    <tr key={h.coinId} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold">
                        <div className="flex items-center gap-2">
                          {h.coin.image ? (
                            <img
                              src={h.coin.image}
                              alt={h.coin.name}
                              referrerPolicy="no-referrer"
                              className="h-5.5 w-5.5 rounded-full object-cover border border-slate-800 shrink-0"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                              }}
                            />
                          ) : (
                            <div className="h-5.5 w-5.5 bg-slate-800 rounded-full flex items-center justify-center font-bold text-[9px] text-blue-400 uppercase shrink-0 font-sans">
                              {h.coin.symbol.slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <span className="text-slate-100 font-bold block leading-none">{h.coin.name}</span>
                            <span className="text-[10px] text-slate-500 font-bold font-mono">{h.coin.symbol}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-350">
                        {h.quantity.toLocaleString("en-US", { maximumFractionDigits: 5 })}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                        {formatCurrency(h.avgBuyPrice, currency, rates)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-400 font-semibold">
                        {formatCurrency(h.coin.price, currency, rates)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-100">
                        {formatCurrency(h.currentValue, currency, rates)}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-mono font-bold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                        <div className="flex items-center justify-end gap-1 text-xs">
                          {isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                          <span>{formatCurrency(Math.abs(h.netProfit), currency, rates)}</span>
                        </div>
                        <span className="text-[10px] block opacity-85 leading-none mt-0.5">
                          ({isUp ? "+" : ""}{h.profitPercentage.toFixed(1)}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {holdings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-medium font-sans text-xs">
                      {lang === "id" 
                        ? "Anda belum merekam transaksi di portofolio tiruan." 
                        : "No assets tracked yet. Get started by typing order details above."}
                    </td>
                  </tr>
                )}
               </tbody>
            </table>
          </div>
        </div>

        {/* Right Section: Visual Allocation breakdown Pie Wheel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              {lang === "id" ? "Bobot Proporsional Portofolio" : "Portfolio Weight Allocation"}
            </h3>
            <p className="text-xs font-sans text-slate-500 mb-4 leading-relaxed">
              {lang === "id" 
                ? "Proporsi kepemilikan aset koin Anda berdasarkan nilai konversi harga pasar saat ini."
                : "Realtime dynamic allocation weights matched to current localized rates."}
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center relative select-none">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${CURRENCY_SYMBOLS[currency] || ""}${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-650 text-xs font-mono">
                {lang === "id" ? "Grafik belum tersedia" : "Graph unavailable"}
              </div>
            )}
            
            {/* Display center aggregate value */}
            {chartData.length > 0 && (
              <div className="absolute top-[37%] flex flex-col items-center">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none">TOTAL</span>
                <span className="text-sm font-black text-slate-300 font-mono mt-1">
                  {formatCurrency(totalValue, currency, rates)}
                </span>
              </div>
            )}
          </div>

          {/* Allocation Legend */}
          <div className="pt-3 border-t border-slate-850 mt-2 space-y-1.5 max-h-40 overflow-y-auto scrollbar-none">
            {holdings.map((h, i) => {
              const weight = totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0;
              return (
                <div key={h.coinId} className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-300 font-sans font-semibold">{h.coin.name}</span>
                  </div>
                  <span className="text-slate-400 font-bold">{weight.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* 4. Transactions Log Panel */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-850 bg-slate-900/30">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {lang === "id" ? "Catatan Kas & Transaksi Finansial" : "Transactions Ledger Register"}
          </h4>
        </div>
        
        <div className="overflow-x-auto max-h-[300px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-slate-500 font-bold bg-slate-900/10">
                <th className="py-2.5 px-4">{lang === "id" ? "Tanggal & Waktu" : "Timestamp"}</th>
                <th className="py-2.5 px-3">{lang === "id" ? "Aset" : "Asset"}</th>
                <th className="py-2.5 px-3 text-center">{lang === "id" ? "Jenis" : "Order Type"}</th>
                <th className="py-2.5 px-3 text-right">{lang === "id" ? "Banyaknya" : "Quantity"}</th>
                <th className="py-2.5 px-3 text-right">{lang === "id" ? "Harga Eksekusi" : "Execution Rate"}</th>
                <th className="py-2.5 px-3 text-right">{lang === "id" ? "Total Dana" : "Total Flow"}</th>
                <th className="py-2.5 px-4 text-center">{lang === "id" ? "Pilihan" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 font-mono font-bold text-slate-300">
              {transactions.map((tx) => {
                const coin = coins.find((c) => c.id === tx.coinId);
                if (!coin) return null;
                const cost = tx.quantity * tx.price;
                const parsedDate = new Date(tx.date).toLocaleString(lang === "id" ? "id-ID" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
                
                return (
                  <tr key={tx.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-2 px-4 text-slate-500 font-medium">{parsedDate}</td>
                    <td className="py-2 px-3 font-sans font-bold text-slate-300">
                      <div className="flex items-center gap-1.5">
                        {coin.image ? (
                          <img
                            src={coin.image}
                            alt=""
                            className="h-4 w-4 rounded-full object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="h-4 w-4 bg-slate-800 rounded-full flex items-center justify-center font-bold text-[8px] text-blue-400 uppercase shrink-0 font-sans">
                            {coin.symbol.slice(0, 1)}
                          </div>
                        )}
                        <span>{coin.name} <span className="text-[9px] text-slate-500 font-mono">({coin.symbol})</span></span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider ${tx.type === "BUY" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">{tx.quantity.toLocaleString("en-US", { maximumFractionDigits: 6 })}</td>
                    <td className="py-2 px-3 text-right text-slate-400">{formatCurrency(tx.price, currency, rates)}</td>
                    <td className="py-2 px-3 text-right text-slate-200 font-black">{formatCurrency(cost, currency, rates)}</td>
                    <td className="py-2 px-4 text-center">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1 text-slate-600 hover:text-rose-400 transition-colors rounded hover:bg-slate-900 cursor-pointer"
                        title={lang === "id" ? "Hapus Transaksi" : "Delete record"}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr>
                   <td colSpan={7} className="py-8 text-center text-slate-600 text-xs font-sans">
                    {lang === "id" ? "Aset Anda kosong." : "Transactions ledger register is completely empty."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Trigger Add Transaction Floating Modal */}
      {isOpenAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="text-blue-500 animate-pulse" size={18} />
                <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
                  {lang === "id" ? "Rekam Transaksi Finansial" : "Log New Receipt"}
                </h3>
              </div>
              <button 
                onClick={() => setIsOpenAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              
              {/* Type Toggle: Buy vs Sell */}
              <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl w-full overflow-hidden">
                <button
                  type="button"
                  onClick={() => setTxType("BUY")}
                  className={`flex-1 py-2 rounded-lg text-xs font-black tracking-widest transition-all cursor-pointer ${
                    txType === "BUY"
                      ? "bg-emerald-500 text-slate-950 shadow bg-emerald-500"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setTxType("SELL")}
                  className={`flex-1 py-2 rounded-lg text-xs font-black tracking-widest transition-all cursor-pointer ${
                    txType === "SELL"
                      ? "bg-rose-500 text-white shadow bg-rose-500"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  SELL
                </button>
              </div>

              {/* Coin Select */}
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                  {lang === "id" ? "Pilih Aset Kripto" : "Select Token"}
                </label>
                <select
                  value={selectedCoinId}
                  onChange={(e) => handleCoinChange(e.target.value)}
                  className="w-full bg-slate-950 text-xs font-bold border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-250 outline-none focus:border-blue-500"
                >
                  {coins.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.symbol}) — Spot: {formatCurrency(c.price, currency, rates)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                
                {/* Quantity */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                    {lang === "id" ? "Banyaknya" : "Amount Quantity"}
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.0000001"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 text-sm border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-200 outline-none focus:border-blue-500 font-mono font-bold"
                  />
                </div>

                {/* Executed price */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                    {lang === "id" ? `Harga (${currency})` : `Order Execution Price (${currency})`}
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.0000001"
                    value={(price * (rates[currency] || 1))}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      const baseUSD = value / (rates[currency] || 1);
                      setPrice(baseUSD);
                    }}
                    className="w-full bg-slate-950 text-sm border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-200 outline-none focus:border-blue-500 font-mono font-bold"
                  />
                </div>

              </div>

              {/* Total Calculation breakdown */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-550 font-bold uppercase">{lang === "id" ? "Estimasi Total" : "Flow Estimate"}</span>
                <span className="text-sm font-black font-mono text-blue-400">
                  {formatCurrency((quantity * price), currency, rates)}
                </span>
              </div>

              {/* Action */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpenAddModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 transition-all text-slate-300 font-bold text-xs py-3 rounded-xl border border-slate-700 cursor-pointer"
                >
                  {lang === "id" ? "Batal" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 transition-all text-white font-black text-xs py-3 rounded-xl shadow cursor-pointer"
                >
                  {lang === "id" ? "Kirim Rekaman" : "Submit Receipt"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
