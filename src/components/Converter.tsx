import React, { useState, useEffect } from "react";
import { Coin } from "../types";
import { ArrowLeftRight, HelpCircle } from "lucide-react";
import { SupportedLang, SupportedCurrency, TRANSLATIONS, CURRENCY_SYMBOLS } from "../utils/localization";

interface ConverterProps {
  coins: Coin[];
  lang: SupportedLang;
  currency: SupportedCurrency;
  rates: Record<string, number>;
}

export default function Converter({ coins, lang, currency, rates }: ConverterProps) {
  const t = TRANSLATIONS[lang];

  const [fromAmount, setFromAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>("BTC");
  const [toCurrency, setToCurrency] = useState<string>(currency);
  const [toAmount, setToAmount] = useState<number>(0);

  // Compile full dynamic options including all fiat currencies from rates + all coins
  const options = [
    { value: "USD", label: "US Dollar (USD)", rate: 1, isFiat: true },
    { value: "IDR", label: "Indonesian Rupiah (IDR)", rate: 1 / (rates.IDR || 16120), isFiat: true },
    { value: "EUR", label: "Euro (EUR)", rate: 1 / (rates.EUR || 0.922), isFiat: true },
    { value: "GBP", label: "Pound Sterling (GBP)", rate: 1 / (rates.GBP || 0.785), isFiat: true },
    { value: "JPY", label: "Japanese Yen (JPY)", rate: 1 / (rates.JPY || 156.8), isFiat: true },
    { value: "AUD", label: "Australian Dollar (AUD)", rate: 1 / (rates.AUD || 1.505), isFiat: true },
    ...coins.map((c) => ({
      value: c.symbol.toUpperCase(),
      label: `${c.name} (${c.symbol})`,
      rate: c.price,
      isFiat: false,
    })),
  ];

  // Recalculate converter rate
  const performConversion = () => {
    const fromOpt = options.find((o) => o.value === fromCurrency.toUpperCase());
    const toOpt = options.find((o) => o.value === toCurrency.toUpperCase());

    if (!fromOpt || !toOpt || fromAmount <= 0) {
      setToAmount(0);
      return;
    }

    // Convert input -> USD, then USD -> target
    const amountInUSD = fromAmount * fromOpt.rate;
    const finalAmount = amountInUSD / toOpt.rate;

    setToAmount(parseFloat(finalAmount.toFixed(toOpt.isFiat ? 2 : 7)));
  };

  useEffect(() => {
    performConversion();
  }, [fromAmount, fromCurrency, toCurrency, coins, rates]);

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setFromAmount(toAmount || 1);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-4 font-sans">
      
      {/* Swap Frame */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-850 pb-3">
          <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
            {lang === "id" ? "Kalkulator Konversi Finansial" : "Multi-Currency Calculator Conversion"}
          </h3>
          <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2.5 py-0.5 rounded border border-blue-500/20">
            {lang === "id" ? "Kurs Spot Instan" : "Instant Spot FX Rate"}
          </span>
        </div>

        {/* Input Block: FROM */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
            {lang === "id" ? "Dari Kuantitas" : "Convert From"}
          </label>
          <div className="grid grid-cols-3 gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-850 items-center">
            <input
              type="number"
              step="any"
              min="0"
              value={fromAmount}
              onChange={(e) => setFromAmount(parseFloat(e.target.value) || 0)}
              className="col-span-2 bg-transparent text-xl font-bold font-mono text-slate-100 outline-none pl-2"
              placeholder="0.00"
            />
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs font-bold rounded-xl py-2 px-3 text-slate-200 outline-none cursor-pointer"
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Action Button */}
        <div className="flex justify-center -my-2.5">
          <button
            onClick={handleSwap}
            className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-blue-400 hover:text-blue-300 p-3 rounded-full transition-all hover:scale-105 active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
            title={lang === "id" ? "Tukar Arah Konversi" : "Flip direction"}
          >
            <ArrowLeftRight size={16} />
          </button>
        </div>

        {/* Input Block: TO */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
            {lang === "id" ? "Ke Estimasi Nilai" : "Receiving Value"}
          </label>
          <div className="grid grid-cols-3 gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-850 items-center font-mono">
            <input
              type="text"
              readOnly
              value={toAmount.toLocaleString(undefined, { maximumFractionDigits: 7 })}
              className="col-span-2 bg-transparent text-xl font-bold text-slate-400 outline-none pl-2"
              placeholder="0.00"
            />
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs font-bold rounded-xl py-2 px-3 text-slate-200 outline-none cursor-pointer"
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic description of spot exchange rate */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 flex items-center gap-3 text-xs text-slate-400 leading-relaxed font-sans font-medium">
          <HelpCircle size={18} className="text-slate-500 shrink-0" />
          <p>
            {lang === "id" ? (
              <span>
                Nilai tukar spot saat ini: <strong>1 {fromCurrency}</strong> setara dengan{" "}
                <strong className="text-slate-200 font-mono">
                  {((options.find((o) => o.value === fromCurrency)?.rate || 1) /
                    (options.find((o) => o.value === toCurrency)?.rate || 1)).toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })}{" "}
                  {toCurrency}
                </strong>
                . Diperbarui otomatis berdasarkan fluktuasi pasar simulasi.
              </span>
            ) : (
              <span>
                Standard conversion mapping: <strong>1 {fromCurrency}</strong> equates to{" "}
                <strong className="text-slate-200 font-mono">
                  {((options.find((o) => o.value === fromCurrency)?.rate || 1) /
                    (options.find((o) => o.value === toCurrency)?.rate || 1)).toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })}{" "}
                  {toCurrency}
                </strong>
                . Values shift automatically in-line with live ticker spot calculations.
              </span>
            )}
          </p>
        </div>

      </div>
    </div>
  );
}
