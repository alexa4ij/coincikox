import React, { useState, useEffect } from "react";
import { 
  Server, 
  Globe, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  HelpCircle, 
  Terminal, 
  RefreshCw, 
  Layers, 
  Cpu, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  Database
} from "lucide-react";
import { SupportedLang, SupportedCurrency, formatCurrency } from "../utils/localization";

interface ExchangeApiHubProps {
  lang: SupportedLang;
  currency: SupportedCurrency;
  rates: Record<string, number>;
}

interface ExchangeMeta {
  id: string;
  name: string;
  hq: string;
  trustScore: number;
  vol24h: string;
  docUrl: string;
  baseUrl: string;
  popularPairs: string[];
  description: string;
}

const EXCHANGES_LIST: ExchangeMeta[] = [
  {
    id: "binance",
    name: "Binance",
    hq: "Seychelles",
    trustScore: 10,
    vol24h: "$12,450,000,000",
    docUrl: "https://binance-docs.github.io/apidocs/spot/en/",
    baseUrl: "https://api.binance.com",
    popularPairs: ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
    description: "Bursa kripto terbesar di dunia berdasarkan volume perdagangan spot dan derivatif, menawarkan likuiditas tertinggi secara global."
  },
  {
    id: "coinbase",
    name: "Coinbase Exchange",
    hq: "United States",
    trustScore: 10,
    vol24h: "$1,890,000,000",
    docUrl: "https://docs.cloud.coinbase.com/exchange/docs",
    baseUrl: "https://api.exchange.coinbase.com",
    popularPairs: ["BTC/USDT", "ETH/USDT"],
    description: "Bursa teregulasi secara penuh di AS, terkenal dengan standar kepatuhan institusional dan transparansi audit publik."
  },
  {
    id: "kraken",
    name: "Kraken",
    hq: "United States",
    trustScore: 10,
    vol24h: "$940,000,000",
    docUrl: "https://docs.kraken.com/rest/",
    baseUrl: "https://api.kraken.com",
    popularPairs: ["BTC/USDT", "ETH/USDT"],
    description: "Salah satu bursa perintis tertua di dunia dengan sistem keamanan canggih dan integrasi sirkuit pendanaan fiat global terpercaya."
  },
  {
    id: "okx",
    name: "OKX",
    hq: "Seychelles",
    trustScore: 9,
    vol24h: "$2,650,000,000",
    docUrl: "https://www.okx.com/docs-v5/en/",
    baseUrl: "https://www.okx.com",
    popularPairs: ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
    description: "Hub bursa finansial bertenaga tinggi yang memadukan likuiditas spot mendalam dengan ekosistem Web3 Wallet independen."
  },
  {
    id: "bybit",
    name: "Bybit",
    hq: "Singapore",
    trustScore: 9,
    vol24h: "$3,120,000,000",
    docUrl: "https://bybit-exchange.github.io/docs/v5/intro",
    baseUrl: "https://api.bybit.com",
    popularPairs: ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
    description: "Bursa lincah berkinerja tinggi yang populer dalam inovasi trading margin cerdas dan pasar spot bebas biaya promo musiman."
  },
  {
    id: "indodax",
    name: "Indodax",
    hq: "Indonesia",
    trustScore: 8,
    vol24h: "Rp 125,000,000,000",
    docUrl: "https://github.com/btcid/indodax-official-api-docs",
    baseUrl: "https://indodax.com",
    popularPairs: ["BTC/IDR"],
    description: "Bursa perintis terbesar di Indonesia yang teregulasi resmi oleh Bappebti, menawarkan perdagangan langsung koin rupiah (IDR)."
  },
  {
    id: "kucoin",
    name: "KuCoin",
    hq: "Seychelles",
    trustScore: 9,
    vol24h: "$1,150,000,000",
    docUrl: "https://docs.kucoin.com/",
    baseUrl: "https://api.kucoin.com",
    popularPairs: ["BTC/USDT", "ETH/USDT"],
    description: "Bursa terdesentralisasi sebagian dengan pilihan permata (gems) koin alternatif berskala kecil bertaraf global."
  },
  {
    id: "gateio",
    name: "Gate.io",
    hq: "Cayman Islands",
    trustScore: 8,
    vol24h: "$1,480,000,000",
    docUrl: "https://www.gate.io/docs/developers/apiv4/en/",
    baseUrl: "https://api.gateio.ws",
    popularPairs: ["BTC/USDT", "ETH/USDT"],
    description: "Bursa serba ada dengan ekosistem ribuan pilihan token mikro/makro serta sistem API analitis on-chain fleksibel."
  }
];

export default function ExchangeApiHub({ lang, currency, rates }: ExchangeApiHubProps) {
  // Simulator State
  const [exchange, setExchange] = useState<string>("binance");
  const [endpointType, setEndpointType] = useState<"ticker" | "orderbook">("ticker");
  const [tradingPair, setTradingPair] = useState<string>("BTC/USDT");
  
  // API Response States
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Filter pairs based on exchange preferences (e.g. BTC/IDR for Indodax)
  const availablePairs = exchange === "indodax" ? ["BTC/IDR"] : ["BTC/USDT", "ETH/USDT", "SOL/USDT"];

  const triggerQuery = async (ex = exchange, pair = tradingPair, type = endpointType) => {
    setLoading(true);
    setError(null);
    try {
      const parsedPair = ex === "indodax" && pair === "BTC/USDT" ? "BTC/IDR" : pair;
      if (ex === "indodax" && tradingPair !== "BTC/IDR") {
        setTradingPair("BTC/IDR");
      }
      
      const response = await fetch(
        `/api/exchanges/query?exchange=${ex}&type=${type}&pair=${encodeURIComponent(parsedPair)}`
      );
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Gagal menghubungi API bursa.");
      }
      setApiResponse(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // Run automatically on first render
  useEffect(() => {
    triggerQuery("binance", "BTC/USDT", "ticker");
  }, []);

  const handleCopy = () => {
    if (!apiResponse) return;
    navigator.clipboard.writeText(JSON.stringify(apiResponse.raw, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectFromGrid = (exId: string) => {
    setExchange(exId);
    const defaultPair = exId === "indodax" ? "BTC/IDR" : "BTC/USDT";
    setTradingPair(defaultPair);
    triggerQuery(exId, defaultPair, endpointType);
    
    // Smooth scroll back to top simulator element
    document.getElementById("api-sandbox")?.scrollIntoView({ behavior: "smooth" });
  };

  // Localized copy based on selected language
  const textDict = {
    id: {
      title: "Pusat Hub API Publik Bursa Global",
      desc: "Uji coba dan akses muatan data real-time autentik dari API publik bursa-bursa kripto terkemuka dunia. Tanpa pendaftaran kunci API, dilindungi oleh proxy server aman.",
      sandboxTitle: "Simulator Sandbox API Publik",
      sandboxDesc: "Pilih bursa dan instrumen pasangan dagang untuk memicu query REST API riil di backend.",
      btnRun: "Mulai Ambil Data Live",
      running: "Memproses...",
      lblExchange: "Pilih Bursa Kripto",
      lblType: "Format Informasi",
      lblPair: "Pasangan Dagang (Pair)",
      rawJson: "Payload JSON Mentah",
      statsTitle: "Metrik Hasil Ekstraksi",
      statsDesc: "Data struktur yang berhasil dipetakan secara seragam dari respons resmi API bursa.",
      statPrice: "Harga Terakhir",
      statHigh: "Tertinggi 24j",
      statLow: "Terendah 24j",
      statVol: "Volume Transaksi 24j",
      statBid: "Penawaran Terbaik (Bid)",
      statAsk: "Permintaan Terbaik (Ask)",
      statSpread: "Rentang Spread Kebutuhan",
      directoryTitle: "Direktori API Bursa Berizin Global",
      directoryDesc: "Panduan teknis dan profil operasional bursa kripto utama beserta alamat dokumentasi publik pengembang mereka."
    },
    en: {
      title: "Global Exchange Public API Hub",
      desc: "Test and capture live authentic data payloads from the world's leading cryptocurrency bursa API systems. Fully proxy-safeguarded, completely keyless.",
      sandboxTitle: "Public API Sandbox Simulator",
      sandboxDesc: "Configure any exchange node and market instrument pair to dispatch active REST API queries server-side.",
      btnRun: "Dispatch Live API Call",
      running: "Querying...",
      lblExchange: "Choose Crypto Exchange",
      lblType: "Information Format",
      lblPair: "Trading Pair",
      rawJson: "Raw JSON Response",
      statsTitle: "Extracted Market Metrics",
      statsDesc: "Standardized parameters successfully parsed from the exchange's official public API response.",
      statPrice: "Last Trade Price",
      statHigh: "24h High Price",
      statLow: "24h Low Price",
      statVol: "Relative 24h Volume",
      statBid: "Best Bid Offers",
      statAsk: "Best Ask Requests",
      statSpread: "Absolute Market Spread",
      directoryTitle: "Global Crypto Exchange Node Registry",
      directoryDesc: "Technical guides and deployment specifications of dominant platforms including offical developer API documents."
    },
    de: {
      title: "Zentrales Verzeichnis für Börsen-APIs",
      desc: "Testen und erfassen Sie offizielle Echtzeit-API-Rückmeldungen führender Krypto-Börsen über unseren sicheren Server-Proxy. Registrierung nicht erforderlich.",
      sandboxTitle: "Schnittstellen-Sandbox-Simulator",
      sandboxDesc: "Wählen Sie einen Knotenpunkt und ein Handelspaar aus, um eine echte REST-Anfrage im Hintergrund zu senden.",
      btnRun: "Echtzeit-Anfrage senden",
      running: "Senden...",
      lblExchange: "Kryptobörse wählen",
      lblType: "Informationsformat",
      lblPair: "Handelspaar",
      rawJson: "Rohe JSON-Schnittstelle",
      statsTitle: "Standardisierte Metriken",
      statsDesc: "Extrahierte Schlüsselindikatoren, die einheitlich aus der offiziellen API-Antwort konvertiert wurden.",
      statPrice: "Letzter Kurs",
      statHigh: "24h Höchstkurs",
      statLow: "24h Tiefstkurs",
      statVol: "24h-Handelsvolumen",
      statBid: "Bestes Kaufangebot",
      statAsk: "Bestes Verkaufsangebot",
      statSpread: "Absolute Marktspanne",
      directoryTitle: "Globale Krypto-Node-Registrierung",
      directoryDesc: "Technische Profile und Richtlinien der wichtigsten Plattformen inklusive offizieller API-Dokumentation für Entwickler."
    },
    es: {
      title: "Módulo de APIs Públicas de Exchange Global",
      desc: "Pruebe y extraiga en tiempo real cargas auténticas de APIs públicas de las principales casas de intercambio cripto globales. Integrado de forma segura y libre de credenciales.",
      sandboxTitle: "Simulador Sandbox de APIs",
      sandboxDesc: "Seleccione cualquier plataforma e instrumento para realizar solicitudes REST API reales en nuestro servidor.",
      btnRun: "Ejecutar Consulta Live",
      running: "Consultando...",
      lblExchange: "Seleccionar Casa de Cambio",
      lblType: "Formato Informativo",
      lblPair: "Par Comercial",
      rawJson: "Respuesta JSON Original",
      statsTitle: "Métricas Extraídas Uniformes",
      statsDesc: "Estructura de datos normalizada extraída a partir de los datos que devuelve el API oficial.",
      statPrice: "Último Precio Spot",
      statHigh: "Precio Máximo 24h",
      statLow: "Precio Mínimo 24h",
      statVol: "Volumen Comercial 24h",
      statBid: "Oferta de Compra (Bid)",
      statAsk: "Demanda de Venta (Ask)",
      statSpread: "Spread de Mercado",
      directoryTitle: "Registro de Nodos e Intercambios Cripto",
      directoryDesc: "Perfiles técnicos de desarrollo y manuales de desarrolladores para optimizar consultas de mercado."
    }
  };

  const currentStrings = textDict[lang] || textDict.en;

  // Render Mapped stats values or mock simulator defaults
  const stats = apiResponse?.parsedStats || {
    lastPrice: 0,
    high24h: 0,
    low24h: 0,
    volume24h: 0,
    bid: 0,
    ask: 0,
    priceChangePercent: 0
  };

  // Convert stats.lastPrice (always USD unless Indodax IDR) into selected Currency
  const formatStatsPrice = (priceVal: number) => {
    if (priceVal <= 0) return "-";
    if (exchange === "indodax" && tradingPair === "BTC/IDR") {
      // Indodax returned value is already in Rupiah. Let's convert into USD/others appropriately based on our exchange currency rate if needed, or keeping it local
      if (currency === "IDR") {
        return `Rp ${Math.round(priceVal).toLocaleString("id-ID")}`;
      } else {
        // Convert Rupiah to USD first, then format in appropriate target currency
        const usdEquivalent = priceVal / (rates["IDR"] || 16120);
        return formatCurrency(usdEquivalent, currency, rates);
      }
    } else {
      // Normal USD price returned by standard API
      return formatCurrency(priceVal, currency, rates);
    }
  };

  // Safe formatting for numbers
  const formatNumberValue = (val: number, isQty = false) => {
    if (val <= 0) return "-";
    if (isQty) {
      return val.toLocaleString(undefined, { maximumFractionDigits: 3 });
    }
    return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const calculatedSpread = stats.ask > 0 && stats.bid > 0 ? (stats.ask - stats.bid) : 0;
  const spreadPercent = calculatedSpread > 0 && stats.bid > 0 ? ((calculatedSpread / stats.bid) * 100).toFixed(4) : "0.0000";

  return (
    <div id="api-sandbox" className="space-y-8">
      {/* Page Hero Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-905 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 opacity-5 pointer-events-none hidden md:block">
          <Terminal size={400} className="text-blue-500 transform rotate-12 translate-x-12 translate-y-12" />
        </div>
        
        <div className="space-y-3 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/10 text-indigo-400 text-[10.5px] font-black px-2.5 py-1 rounded-full border border-indigo-500/20 uppercase tracking-widest font-mono">
              Live API Gateway
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10.5px] font-black px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              Proxy Online
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight leading-tight">
            {currentStrings.title}
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
            {currentStrings.desc}
          </p>
        </div>

        <div className="flex min-w-[130px] flex-row md:flex-col gap-3 justify-center text-center font-mono relative z-10">
          <div className="flex-1 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Supported Exchanges</p>
            <p className="text-2xl font-black text-indigo-400 mt-0.5">8 Nodes</p>
          </div>
          <div className="flex-1 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Daily REST Activity</p>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">100% Free</p>
          </div>
        </div>
      </div>

      {/* Simulator Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input Parameters Layout (Left) */}
        <div className="lg:col-span-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 space-y-5 h-full">
          <div>
            <h2 className="text-sm font-bold text-slate-100">{currentStrings.sandboxTitle}</h2>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{currentStrings.sandboxDesc}</p>
          </div>

          <div className="space-y-4 pt-1">
            {/* 1. Exchange selection */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                <Globe size={12} className="text-indigo-400" />
                {currentStrings.lblExchange}
              </label>
              <select
                value={exchange}
                onChange={(e) => {
                  const val = e.target.value;
                  setExchange(val);
                  setTradingPair(val === "indodax" ? "BTC/IDR" : "BTC/USDT");
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 font-bold transition-all cursor-pointer"
              >
                {EXCHANGES_LIST.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.hq})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Format Selection */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                <Database size={12} className="text-indigo-400" />
                {currentStrings.lblType}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setEndpointType("ticker")}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                    endpointType === "ticker"
                      ? "bg-indigo-600 border-indigo-500 text-white font-black"
                      : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-100"
                  }`}
                >
                  Ticker (24h)
                </button>
                <button
                  onClick={() => setEndpointType("orderbook")}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                    endpointType === "orderbook"
                      ? "bg-indigo-600 border-indigo-500 text-white font-black"
                      : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-100"
                  }`}
                >
                  Orderbook (Depth)
                </button>
              </div>
            </div>

            {/* 3. Symbol Selection */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                <Cpu size={12} className="text-indigo-400" />
                {currentStrings.lblPair}
              </label>
              <select
                value={tradingPair}
                onChange={(e) => setTradingPair(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 font-bold transition-all cursor-pointer"
              >
                {availablePairs.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => triggerQuery()}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-indigo-550/10 flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200"
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Play size={14} fill="currentColor" />
              )}
              {loading ? currentStrings.running : currentStrings.btnRun}
            </button>
          </div>

          {/* Active target endpoints information */}
          {apiResponse?.url && (
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 space-y-2 mt-4">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Active Endpoint Endpoint</span>
                <span className="text-blue-400 uppercase font-bold">GET</span>
              </div>
              <p className="text-[10px] font-mono text-indigo-300 break-all select-all font-semibold select-text leading-relaxed">
                {apiResponse.url}
              </p>
            </div>
          )}
        </div>

        {/* Sandbox Simulation Results (Right & Middle) */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full justify-between">
          {error ? (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-center text-slate-200 flex flex-col items-center justify-center gap-3">
              <AlertTriangle className="text-red-400 animate-bounce" size={40} />
              <h3 className="text-sm font-bold">Terjadi Galat Koneksi API</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
              <button
                onClick={() => triggerQuery()}
                className="mt-2 bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-bold rounded-xl text-slate-200 hover:bg-slate-800"
              >
                Coba Hubungkan Kembali
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Stat Card Metrics Extractions */}
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-emerald-400" />
                    {currentStrings.statsTitle}
                  </h3>
                  <p className="text-[10.5px] text-slate-500 mt-0.5 leading-normal">
                    {currentStrings.statsDesc}
                  </p>
                </div>

                {endpointType === "ticker" ? (
                  <div className="grid grid-cols-2 gap-3 mt-5 font-mono">
                    <div className="col-span-2 bg-slate-950/80 p-4 rounded-xl border border-slate-850 flex flex-col justify-between">
                      <p className="text-[9.5px] text-slate-500 uppercase font-black">{currentStrings.statPrice}</p>
                      <p className="text-2xl font-black text-slate-100 tracking-tight mt-1-">
                        {formatStatsPrice(stats.lastPrice)}
                      </p>
                      {stats.priceChangePercent !== 0 && (
                        <span className={`text-[10.5px] font-bold ${stats.priceChangePercent > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {stats.priceChangePercent > 0 ? "+" : ""}{stats.priceChangePercent.toFixed(2)}% (24j)
                        </span>
                      )}
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850/60">
                      <p className="text-[9px] text-slate-500 uppercase">{currentStrings.statHigh}</p>
                      <p className="text-xs font-bold text-emerald-400 mt-1">
                        {formatStatsPrice(stats.high24h)}
                      </p>
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850/60">
                      <p className="text-[9px] text-slate-500 uppercase">{currentStrings.statLow}</p>
                      <p className="text-xs font-bold text-rose-450 mt-1">
                        {formatStatsPrice(stats.low24h)}
                      </p>
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850/60">
                      <p className="text-[9px] text-slate-500 uppercase">{currentStrings.statBid}</p>
                      <p className="text-xs font-bold text-indigo-400 mt-1">
                        {formatStatsPrice(stats.bid)}
                      </p>
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850/60">
                      <p className="text-[9px] text-slate-500 uppercase">{currentStrings.statAsk}</p>
                      <p className="text-xs font-bold text-amber-500 mt-1">
                        {formatStatsPrice(stats.ask)}
                      </p>
                    </div>

                    <div className="col-span-2 bg-slate-950/60 p-3 rounded-xl border border-slate-850/60 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase">{currentStrings.statSpread}</p>
                        <p className="text-xs font-bold text-slate-300 mt-0.5">
                          {formatStatsPrice(calculatedSpread)}
                        </p>
                      </div>
                      <span className="text-[9.5px] bg-indigo-500/10 text-indigo-300 font-bold px-1.5 py-0.5 rounded uppercase">
                        Spot Spread: {spreadPercent}%
                      </span>
                    </div>
                  </div>
                ) : (
                  // Orderbook visualization
                  <div className="mt-5 space-y-4 font-mono text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Bids Column */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-emerald-500/10 pb-1">
                          <span className="text-emerald-400 font-bold">Bids (Buy)</span>
                          <span className="text-[9px] text-slate-500">Qty (Bebas)</span>
                        </div>
                        <div className="space-y-1">
                          {apiResponse?.raw?.bids?.slice(0, 5).map((bidItem: any, i: number) => (
                            <div key={i} className="flex justify-between text-[10.5px]">
                              <span className="text-emerald-500 font-medium">
                                {formatStatsPrice(parseFloat(bidItem[0]) || 0)}
                              </span>
                              <span className="text-slate-400">
                                {formatNumberValue(parseFloat(bidItem[1]) || 0, true)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Asks Column */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-rose-500/10 pb-1">
                          <span className="text-rose-400 font-bold">Asks (Sell)</span>
                          <span className="text-[9px] text-slate-500">Qty (Bebas)</span>
                        </div>
                        <div className="space-y-1">
                          {apiResponse?.raw?.asks?.slice(0, 5).map((askItem: any, i: number) => (
                            <div key={i} className="flex justify-between text-[10.5px]">
                              <span className="text-rose-500 font-medium">
                                {formatStatsPrice(parseFloat(askItem[0]) || 0)}
                              </span>
                              <span className="text-slate-400">
                                {formatNumberValue(parseFloat(askItem[1]) || 0, true)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-sans">Orderbook Depth Depth</span>
                      <span className="text-indigo-400">Peringkat Likuiditas Optimal</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Raw JSON Code Terminal View */}
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Terminal size={14} className="text-indigo-400" />
                    <span className="text-[11px] font-bold text-slate-200 font-mono">
                      {currentStrings.rawJson}
                    </span>
                  </div>
                  
                  {apiResponse?.raw && (
                    <button
                      onClick={handleCopy}
                      className="bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1"
                    >
                      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span className="text-[9.5px] font-mono">{copied ? "Copied" : "Copy"}</span>
                    </button>
                  )}
                </div>

                <div className="bg-slate-950 rounded-xl p-4 border border-slate-850 text-slate-300 font-mono text-[10px] h-64 overflow-y-auto mt-4 leading-normal scrollbar-thin scrollbar-thumb-slate-850 scrollbar-track-transparent">
                  <pre className="text-emerald-400/80 select-text">
                    {loading ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-2 text-indigo-400 font-semibold pt-16 animate-pulse">
                        <Terminal size={24} />
                        <p>Executing REST request to: {exchange}...</p>
                      </div>
                    ) : apiResponse?.raw ? (
                      JSON.stringify(apiResponse.raw, null, 2)
                    ) : (
                      `// Menanti instruksi eksekusi sandbox...`
                    )}
                  </pre>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Corporate Exchanges Node Directory */}
      <div className="bg-slate-900/40 rounded-3xl border border-slate-900 p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-100 tracking-tight">
            {currentStrings.directoryTitle}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {currentStrings.directoryDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {EXCHANGES_LIST.map((node) => {
            const isCurrentlySelected = exchange === node.id;
            return (
              <div 
                key={node.id} 
                className={`flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 ${
                  isCurrentlySelected 
                    ? "bg-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-500/5" 
                    : "bg-slate-900/30 border-slate-850 hover:bg-slate-900/60 hover:border-slate-800"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-100">{node.name}</span>
                    <span className="bg-slate-950 font-mono text-[9px] text-indigo-400 font-bold px-1.5 py-0.5 rounded border border-slate-850 uppercase">
                      {node.hq}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans line-clamp-3">
                    {node.description}
                  </p>

                  <div className="space-y-1.5 font-mono text-[9px] pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Public Base URL URL</span>
                      <span className="text-indigo-300 font-semibold truncate max-w-[120px]">{node.baseUrl}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Trust Score (CMC)</span>
                      <span className="text-emerald-400 font-black flex items-center gap-0.5">
                        ★ {node.trustScore}/10
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Est. Volume spot 24j</span>
                      <span className="text-slate-200 font-bold">{node.vol24h}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-900 mt-4">
                  <button
                    onClick={() => handleSelectFromGrid(node.id)}
                    className="flex-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-[10px] font-bold py-2 rounded-xl transition-all border border-indigo-500/20 font-mono flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Simulator
                    <ChevronRight size={10} />
                  </button>
                  <a
                    href={node.docUrl}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    rel="noopener noreferrer"
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-850 p-2 rounded-xl text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center"
                    title="Developer API Documentation"
                  >
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
