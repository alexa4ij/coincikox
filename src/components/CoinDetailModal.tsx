import React, { useState, useEffect, useRef } from "react";
import { Coin, ChatMessage } from "../types";
import { generateChartData } from "../data";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  X,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Info,
  Activity,
  Award,
  BookOpen,
  Star,
  Share2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ThumbsUp,
  Send,
  Check,
  Zap,
} from "lucide-react";
import {
  SupportedLang,
  SupportedCurrency,
  TRANSLATIONS,
  formatCurrency,
  CURRENCY_SYMBOLS,
} from "../utils/localization";

interface CoinDetailModalProps {
  coin: Coin;
  onClose: () => void;
  lang: SupportedLang;
  currency: SupportedCurrency;
  rates: Record<string, number>;
}

interface MockPost {
  id: string;
  author: string;
  username: string;
  avatarText: string;
  timeText: string;
  verified: boolean;
  content: string;
  likes: number;
  comments: number;
}

export default function CoinDetailModal({
  coin,
  onClose,
  lang,
  currency,
  rates,
}: CoinDetailModalProps) {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<
    "chart" | "markets" | "news" | "yield" | "cycles" | "treasury"
  >("chart");
  const [timeframe, setTimeframe] = useState<"1D" | "7D" | "30D" | "1Y">("7D");
  const [chartData, setChartData] = useState(() => generateChartData(coin, "7D"));

  // Accordion for "Why is price down/up today?"
  const [showAccordian, setShowAccordian] = useState(false);

  // Poll Votes
  const [voteType, setVoteType] = useState<"bullish" | "bearish" | null>(null);
  const [votesCount, setVotesCount] = useState({ bullish: 82, bearish: 18 });
  const [totalPollVotes, setTotalPollVotes] = useState(6541285);

  // Live Chat input & status
  const [coincikoxAiQuery, setCoinCIKOXAiQuery] = useState("");
  const [aiChatLogs, setAiChatLogs] = useState<ChatMessage[]>([]);
  const [loadingAiChat, setLoadingAiChat] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Interactive local post feed state
  const [feedInput, setFeedInput] = useState("");
  const [feedCategory, setFeedCategory] = useState<"top" | "latest">("top");
  const [posts, setPosts] = useState<MockPost[]>([
    {
      id: "feed-1",
      author: "Daniel_Markson",
      username: "@Daniel_Markson",
      avatarText: "DM",
      timeText: "5h ago",
      verified: true,
      content: `Coinbase CEO Maps Out the Future: AI, 24/7 Markets, and $35B in Real World Assets (RWAs). This puts ${coin.name} in an extremely bullish posture for the upcoming quarter as institutional funds continue to consolidate.`,
      likes: 12450,
      comments: 324,
    },
    {
      id: "feed-2",
      author: "CryptoNews",
      username: "@CryptoNews",
      avatarText: "CN",
      timeText: "8h ago",
      verified: true,
      content: `While $${coin.symbol} remains the gold standard for decentralized sound money, various macroeconomic indicators are signaling an unprecedented supply squeeze. Over 1B USD is estimated to be flees toward secure spot positions daily.`,
      likes: 8520,
      comments: 185,
    },
    {
      id: "feed-3",
      author: "SatoshiVibes",
      username: "@SatoshiVibes",
      avatarText: "SV",
      timeText: "1d ago",
      verified: false,
      content: `Just added more $${coin.symbol} to my long-term cold wallet. The on-chain analytics show that long-term holders (HODLers) are not selling at these key levels. Prepare for liftoff! 🚀`,
      likes: 420,
      comments: 36,
    },
  ]);

  useEffect(() => {
    setChartData(generateChartData(coin, timeframe));
  }, [coin.id, timeframe]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [aiChatLogs]);

  const handleVote = (type: "bullish" | "bearish") => {
    if (voteType) return; // Allow voting only once
    setVoteType(type);
    setTotalPollVotes((prev) => prev + 1);
    if (type === "bullish") {
      setVotesCount((prev) => ({
        bullish: prev.bullish + 1,
        bearish: Math.max(0, 100 - (prev.bullish + 1)),
      }));
    } else {
      setVotesCount((prev) => ({
        bullish: Math.max(0, 100 - (prev.bearish + 1)),
        bearish: prev.bearish + 1,
      }));
    }
  };

  const submitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedInput.trim()) return;

    const newPost: MockPost = {
      id: `custom-${Date.now()}`,
      author: "You (User)",
      username: "@supraonedollar",
      avatarText: "ME",
      timeText: "Just now",
      verified: false,
      content: feedInput,
      likes: 0,
      comments: 0,
    };

    setPosts([newPost, ...posts]);
    setFeedInput("");
  };

  const handleCoinCIKOXAiSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!coincikoxAiQuery.trim() || loadingAiChat) return;

    const userMsg: ChatMessage = {
      id: `coincikox-user-${Date.now()}`,
      role: "user",
      text: coincikoxAiQuery,
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setAiChatLogs((prev) => [...prev, userMsg]);
    const currentQuery = coincikoxAiQuery;
    setCoinCIKOXAiQuery("");
    setLoadingAiChat(true);

    try {
      // Create quick conversation memory for context
      const chatHistoryMapped = aiChatLogs.slice(-4).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Kamu adalah asisten AI CoinCIKOX. Berikan analisis akurat tentang koin ${coin.name} (${coin.symbol}). Pertanyaan pengguna: "${currentQuery}". Harga koin saat ini adalah ${coin.price} USD. Jawablah sesuai bahasa sistem (${lang}).`,
          chatHistory: chatHistoryMapped,
        }),
      });

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: `coincikox-ai-${Date.now()}`,
        role: "model",
        text: data.reply || "Maaf, sistem AI sedang sibuk. Silakan coba sesaat lagi.",
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setAiChatLogs((prev) => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `coincikox-ai-err-${Date.now()}`,
        role: "model",
        text: "Terjadi kesalahan koneksi saat berbicara dengan asisten AI Gemini.",
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setAiChatLogs((prev) => [...prev, errMsg]);
    } finally {
      setLoadingAiChat(false);
    }
  };

  const isUp24h = coin.priceChange24h >= 0;
  const rate = rates[currency] || 1;

  // Convert chartData USD values to localized values
  const convertedChartData = chartData.map((d) => ({
    ...d,
    localValue: d.USD * rate,
  }));

  // Formatted Metrics
  const calculatedFDV = coin.maxSupply
    ? coin.maxSupply * coin.price
    : coin.marketCap * 1.12;

  const mktCapFormatted = formatCurrency(coin.marketCap, currency, rates);
  const vol24hFormatted = formatCurrency(coin.volume24h, currency, rates);
  const fdvFormatted = formatCurrency(calculatedFDV, currency, rates);
  const volToMktCapRatio = ((coin.volume24h / coin.marketCap) * 100).toFixed(2);

  return (
    <div className="fixed inset-0 bg-[#06070a]/90 backdrop-blur-md flex justify-center items-center z-50 p-0 sm:p-4 overflow-y-auto font-sans select-none fill-current">
      <div className="bg-[#0b0e14] border-0 sm:border border-[#191e2e] w-full max-w-7xl h-full sm:h-[95vh] rounded-none sm:rounded-2xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col relative">
        
        {/* TOP COMPACT TITLE BAR */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#191e2e] bg-[#0d1220]/80 sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="bg-gradient-to-r from-blue-500/25 to-blue-600/30 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">
              Coin Details
            </span>
            <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
              Spot Market &bull; Automated Analytics
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        {/* CONTAINER WORKSPACE GRID: THREE PANELS */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[#191e2e]">
          
          {/* ========================================================= */}
          {/* PANEL 1: LEFT COMPREHENSIVE STATS SIDEBAR */}
          {/* ========================================================= */}
          <div className="w-full lg:w-[30%] p-6 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-850">
            
            {/* Identity line */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                {coin.image ? (
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-8 h-8 rounded-lg object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-xs">
                    {coin.symbol}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-lg font-black text-white leading-none">{coin.name}</h1>
                    <span className="text-[10px] font-black font-sans text-slate-400 uppercase bg-[#191e2e] px-1.5 py-0.5 rounded">
                      {coin.symbol}
                    </span>
                  </div>
                  <span className="inline-block mt-1 bg-slate-850 border border-slate-800 text-slate-300 text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-md">
                    Rank #{coin.rank}
                  </span>
                </div>
              </div>

              {/* Watchlist Star + Share Buttons */}
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-slate-400 hover:text-yellow-400 bg-slate-900 border border-slate-800 hover:border-slate-750 rounded-lg flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-all">
                  <Star size={12} className="fill-current text-yellow-500" />
                  <span>6M</span>
                </button>
                <button className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-750 rounded-lg cursor-pointer transition-all">
                  <Share2 size={12} />
                </button>
              </div>
            </div>

            {/* Display Big Numerals Price */}
            <div>
              <div className="flex items-baseline gap-2.5 leading-none">
                <span className="text-3xl font-black text-white font-mono tracking-tight">
                  {formatCurrency(coin.price, currency, rates)}
                </span>
                <span
                  className={`text-xs font-black flex items-center ${
                    isUp24h ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isUp24h ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                  {Math.abs(coin.priceChange24h)}% (24h)
                </span>
              </div>
            </div>

            {/* Price Down / Price Up Accordian Box */}
            <div className="border border-[#191e2e] bg-[#0c101c]/80 rounded-xl p-3.5 space-y-2">
              <button
                onClick={() => setShowAccordian(!showAccordian)}
                className="w-full flex items-center justify-between text-left text-xs text-slate-300 font-extrabold cursor-pointer hover:text-white"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Why is {coin.symbol}'s price {isUp24h ? "up" : "down"} today?
                </span>
                {showAccordian ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
              
              {showAccordian && (
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-2 pt-2 border-t border-[#191e2e]/50 select-text">
                  Based on recent dynamic market flows and order books, $${coin.symbol} price indexes reflect higher levels of liquidity absorption. {coin.name} is showcasing the characteristic volatility within {coin.category} fields. For complete sentiment insights or regulatory shifts, submit a question in our <b>Ask CoinCIKOX AI</b> chat zone below!
                </p>
              )}
            </div>

            {/* Interactive Grid of Stats cubes */}
            <div className="space-y-3 pt-2">
              
              {/* Box: Market Cap */}
              <div className="flex items-center justify-between py-2.5 border-b border-[#191e2e]/65">
                <div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    Market Cap
                    <Info size={10} className="text-slate-600" />
                  </span>
                  <span className="text-xs font-black text-white font-mono mt-0.5 block">
                    {mktCapFormatted}
                  </span>
                </div>
                <div className={`text-[10px] font-extrabold font-mono flex items-center ${isUp24h ? "text-emerald-500" : "text-rose-500"}`}>
                  {isUp24h ? "▲" : "▼"} {Math.abs(coin.priceChange24h)}%
                </div>
              </div>

              {/* Box: Volume 24h */}
              <div className="flex items-center justify-between py-2.5 border-b border-[#191e2e]/65">
                <div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    Volume (24H)
                    <Info size={10} className="text-slate-600" />
                  </span>
                  <span className="text-xs font-black text-white font-mono mt-0.5 block">
                    {vol24hFormatted}
                  </span>
                </div>
                <div className="text-[10px] font-black font-sans text-slate-500">
                  Global Rank #1
                </div>
              </div>

              {/* Box: Vol/Mkt Cap Ratio */}
              <div className="flex items-center justify-between py-2.5 border-b border-[#191e2e]/65">
                <div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Vol/Mkt Cap (24h)
                  </span>
                  <span className="text-xs font-black text-white font-mono mt-0.5 block">
                    {volToMktCapRatio}%
                  </span>
                </div>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider font-mono bg-slate-900 border border-slate-800 px-1 py-0.2 rounded">
                  Healthy Liquidity
                </span>
              </div>

              {/* Box: FDV */}
              <div className="flex items-center justify-between py-2.5 border-b border-[#191e2e]/65">
                <div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Fully Diluted Valuation (FDV)
                  </span>
                  <span className="text-xs font-black text-white font-mono mt-0.5 block">
                    {fdvFormatted}
                  </span>
                </div>
                <span className="text-[10px] font-black text-blue-500 font-sans">
                  PRO Estimate
                </span>
              </div>

              {/* Supply parameters */}
              <div className="space-y-2 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-extrabold text-slate-400">Circulating Supply</span>
                  <span className="text-xs font-black text-white font-mono">
                    {coin.circulatingSupply.toLocaleString()} {coin.symbol}
                  </span>
                </div>

                {/* Meter progress bar */}
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-850">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{
                      width: coin.maxSupply ? `${(coin.circulatingSupply / coin.maxSupply) * 100}%` : "85%",
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold font-mono">
                  {coin.maxSupply ? (
                    <>
                      <span>Max Supply: {coin.maxSupply.toLocaleString()}</span>
                      <span>{((coin.circulatingSupply / coin.maxSupply) * 100).toFixed(0)}% mined</span>
                    </>
                  ) : (
                    <>
                      <span>Max Supply: Unlimited</span>
                      <span className="text-blue-400">Continuous Block Mint</span>
                    </>
                  )}
                </div>
              </div>

              {/* Total Supply & Treasury */}
              <div className="flex items-center justify-between py-2.5 border-b border-[#191e2e]/65">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Total Supply
                </span>
                <span className="text-xs font-black text-white font-mono">
                  {coin.circulatingSupply.toLocaleString()} {coin.symbol}
                </span>
              </div>

              <div className="flex items-center justify-between py-2.5 border-b border-[#191e2e]/65">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Treasury Holdings
                </span>
                <span className="text-xs font-black text-indigo-400 font-mono">
                  {(coin.circulatingSupply * 0.0655).toLocaleString(undefined, { maximumFractionDigits: 0 })} {coin.symbol} (6.55%)
                </span>
              </div>

              {/* Profile Score meter with gorgeous green bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-black uppercase">
                  <span>Profile Assessment Score</span>
                  <span className="text-emerald-400">100% Guaranteed</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-full" />
                </div>
              </div>

            </div>

          </div>

          {/* ========================================================= */}
          {/* PANEL 2: CORE WORKSPACE MIDDLE COLUMN (TABS + CHART + CHAT) */}
          {/* ========================================================= */}
          <div className="flex-1 lg:w-[45%] flex flex-col min-w-0">
            
            {/* Horizontal Tabs bar line matching CoinCIKOX */}
            <div className="px-6 border-b border-[#191e2e] bg-[#0c101c]/50 flex items-center justify-between overflow-x-auto whitespace-nowrap scrollbar-none">
              <div className="flex gap-4">
                {(["chart", "markets", "news", "yield", "cycles", "treasury"] as const).map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-3.5 text-xs font-black uppercase tracking-wider relative cursor-pointer block hover:text-white transition-all ${
                        isActive ? "text-blue-500" : "text-slate-400"
                      }`}
                    >
                      <span>{tab}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Boost + Buy Actions */}
              <div className="hidden sm:flex items-center gap-2">
                <button className="flex items-center gap-1 bg-gradient-to-r from-orange-500/10 to-amber-500/20 text-orange-400 border border-orange-500/30 px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer uppercase tracking-widest hover:scale-105 transition-all">
                  <Zap size={10} className="fill-current animate-bounce" />
                  Boost
                </button>
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-xl cursor-pointer shadow-md select-none">
                  Buy {coin.symbol}
                </button>
              </div>
            </div>

            {/* TAB CONTENT SPACE */}
            <div className="p-6 flex-1 flex flex-col space-y-6">
              
              {activeTab === "chart" && (
                <>
                  {/* Chart Utility Toolbar line */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                      <button className="bg-[#191e2e] text-blue-400 border border-slate-755 px-2.5 py-1 rounded-md">
                        Price
                      </button>
                      <button className="text-slate-400 hover:text-white px-2.5 py-1">
                        Mkt Cap
                      </button>
                      <button className="text-slate-400 hover:text-white px-2.5 py-1 flex items-center gap-1">
                        <Activity size={10} />
                        TradingView
                      </button>
                    </div>

                    {/* Timeframe selector controls */}
                    <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[10px] font-black leading-none font-mono">
                      {(["1D", "7D", "30D", "1Y"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTimeframe(t)}
                          className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                            timeframe === t
                              ? "bg-blue-600 text-white"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* High Fidelity Recharts Container */}
                  <div className="w-full h-72 bg-[#0c101c]/40 border border-[#191e2e]/50 p-4 rounded-2xl relative">
                    <div className="absolute top-4 left-4 flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Spot rate Index {coin.symbol}</span>
                      <span className={`text-[12px] font-black ${isUp24h ? "text-emerald-400" : "text-rose-400"}`}>
                        {isUp24h ? "+" : ""}{coin.priceChange24h}% (24h)
                      </span>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={convertedChartData}
                        margin={{ top: 40, right: 10, left: -20, bottom: -10 }}
                      >
                        <defs>
                          <linearGradient id="colorPriceModal" x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="5%"
                              stopColor={isUp24h ? "#10b981" : "#ef4444"}
                              stopOpacity={0.25}
                            />
                            <stop
                              offset="95%"
                              stopColor={isUp24h ? "#10b981" : "#ef4444"}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.2} />
                        <XAxis
                          dataKey="date"
                          stroke="#64748b"
                          fontSize={9}
                          tickLine={false}
                          tick={{ fill: "#475569" }}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={9}
                          orientation="right"
                          tickFormatter={(val) => {
                            const symbol = CURRENCY_SYMBOLS[currency] || "";
                            if (val >= 1e6) return `${symbol}${(val / 1e6).toFixed(1)}M`;
                            if (val >= 1e3) return `${symbol}${(val / 1e3).toFixed(1)}K`;
                            return `${symbol}${val.toLocaleString(undefined, { maximumFractionDigits: 1 })}`;
                          }}
                          tickLine={false}
                          domain={["auto", "auto"]}
                          tick={{ fill: "#475569" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#020617",
                            borderColor: "#1e293b",
                            borderRadius: "12px",
                          }}
                          labelStyle={{ color: "#94a3b8", fontWeight: "bold", fontSize: "10px" }}
                          itemStyle={{ color: "#f8fafc", fontSize: "12px" }}
                          formatter={(value) => [
                            `${CURRENCY_SYMBOLS[currency] || ""}${Number(value).toLocaleString(
                              undefined,
                              { minimumFractionDigits: 2, maximumFractionDigits: 4 }
                            )}`,
                            "Price",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="localValue"
                          stroke={isUp24h ? "#10b981" : "#ef4444"}
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorPriceModal)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}

              {activeTab === "markets" && (
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Activity size={12} className="text-blue-500" />
                    Available Spot Exchanges for {coin.symbol}
                  </h4>
                  <p className="text-[11px] text-slate-400">Official order books sync indexes across top global exchanges.</p>
                  <div className="space-y-2 pt-2">
                    {[
                      { name: "Binance Spot", pair: `${coin.symbol}/USDT`, volume: coin.volume24h * 0.42, trust: "High" },
                      { name: "Coinbase Exchange", pair: `${coin.symbol}/USD`, volume: coin.volume24h * 0.28, trust: "High" },
                      { name: "KuCoin", pair: `${coin.symbol}/USDT`, volume: coin.volume24h * 0.15, trust: "Medium" },
                      { name: "OKX", pair: `${coin.symbol}/USDC`, volume: coin.volume24h * 0.10, trust: "High" },
                    ].map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-800/60 font-mono">
                        <span className="font-bold text-slate-200">{m.name}</span>
                        <span className="text-blue-400">{m.pair}</span>
                        <span className="text-slate-400">{formatCurrency(m.volume, currency, rates)}</span>
                        <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">{m.trust}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "news" && (
                <div className="space-y-4">
                  {[
                    { title: `${coin.name} Core Developers Submit New Improvement Proposal`, source: "CoinDesk", time: "2h ago", highlight: "A high importance protocol update is currently being evaluated by key mining pools." },
                    { title: "Institutional Spot Exchange Accumulation Reaches Record Multi-Year Peak", source: "Bloomberg Crypto", time: "6h ago", highlight: "Data suggests long-term custody holders are increasing purchase volumes, leading to positive pricing support lines." },
                  ].map((n, idx) => (
                    <div key={idx} className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                        <span>{n.source}</span>
                        <span>{n.time}</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-200 hover:text-blue-400 transition-colors cursor-pointer">{n.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed leading-normal">{n.highlight}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "yield" && (
                <div className="bg-[#0c101c]/50 border border-slate-800 p-5 rounded-2xl text-center space-y-3">
                  <Award size={24} className="text-blue-400 mx-auto" />
                  <h4 className="text-xs font-black text-white uppercase">Decentralized Yield Opportunities</h4>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Stake or farm {coin.symbol} inside validated DeFi pools. Expected Annual Percentage Yields (APY) range dynamically with network demand metrics.
                  </p>
                  <div className="pt-2">
                    <button className="bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white px-3.5 py-2 rounded-xl text-xs font-extrabold text-blue-400 cursor-pointer">
                      View Smart Contract ABI
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "cycles" && (
                <div className="space-y-3 bg-[#0c101c]/60 border border-slate-850 p-4 rounded-2xl">
                  <h4 className="text-xs font-black text-slate-300 uppercase">On-Chain Halving & Market Cycles</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Analyzing chronological spot parameters suggests we are currently in an accumulation phase of the current four-year economic crypto cycle.
                  </p>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-[#10b981] to-blue-500 h-full w-[72%]" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Cycle Bottom Proximity: 12%</span>
                    <span>Next Local Top Projection: Q4 2026</span>
                  </div>
                </div>
              )}

              {activeTab === "treasury" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300">Total Institutional Allocations</span>
                    <span className="text-xs font-black font-mono text-slate-200">{(coin.circulatingSupply * 0.112).toLocaleString(undefined, { maximumFractionDigits: 0 })} {coin.symbol} (11.20%)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    This encompasses company balances, sovereign reserve ratios, and exchange-traded product assets identified on public block ledgers.
                  </p>
                </div>
              )}

              {/* ======================================================== */}
              {/* LIVE GEMINI CONSOLE INTEGRATION: "ASK COINPULSE AI" */}
              {/* ======================================================== */}
              <div className="mt-auto border-t border-[#191e2e] pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black text-white text-xs">
                    <Sparkles size={13} className="text-blue-400 animate-spin-slow" />
                    <span>Ask CoinCIKOX AI Agent</span>
                  </div>
                  <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400/90 text-[8.5px] font-black px-1.5 py-0.2 rounded-lg leading-none uppercase">
                    Powered by Gemini 3.5
                  </span>
                </div>

                {/* Sub chat container */}
                {aiChatLogs.length > 0 && (
                  <div
                    ref={chatScrollRef}
                    className="max-h-[140px] overflow-y-auto border border-[#191e2e]/60 bg-[#07090f]/75 rounded-xl p-3.5 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-900"
                  >
                    {aiChatLogs.map((log) => {
                      const isModel = log.role === "model";
                      return (
                        <div
                          key={log.id}
                          className={`flex flex-col space-y-0.5 leading-normal ${
                            isModel ? "items-start" : "items-end"
                          }`}
                        >
                          <span className="text-[9.5px] font-bold text-slate-500 uppercase font-mono">
                            {isModel ? "CoinCIKOX AI" : "You"}
                          </span>
                          <div
                            className={`rounded-xl px-3 py-1.8 text-[11px] max-w-[85%] select-text whitespace-pre-wrap leading-relaxed ${
                              isModel
                                ? "bg-slate-900 text-slate-250 border border-slate-800/80"
                                : "bg-blue-600 text-white"
                            }`}
                          >
                            {log.text}
                          </div>
                        </div>
                      );
                    })}
                    {loadingAiChat && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                        <span>Thinking...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Search / Chat console form exactly as pictured in the screenshot overlay */}
                <form
                  onSubmit={handleCoinCIKOXAiSubmit}
                  className="relative flex items-center bg-[#131722] border border-[#2d313f] hover:border-slate-600 rounded-full py-2.5 pl-4 pr-12 transition-all transition-colors duration-150"
                  id="ask-coincikox-ai-console"
                >
                  <Sparkles size={13} className="text-purple-400 mr-2 shrink-0 animate-pulse" />
                  <input
                    type="text"
                    value={coincikoxAiQuery}
                    onChange={(e) => setCoinCIKOXAiQuery(e.target.value)}
                    placeholder={`Ask CoinCIKOX AI about ${coin.name}...`}
                    className="w-full bg-transparent text-[11.5px] border-0 outline-none text-slate-200 placeholder-slate-500 font-sans"
                    disabled={loadingAiChat}
                  />

                  {/* Submission Keyboard helper label and send button */}
                  <div className="absolute right-2.5 flex items-center gap-1.5">
                    <span className="hidden sm:inline-block text-[8.5px] font-black font-sans text-slate-500 uppercase tracking-widest bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-center leading-none">
                      Shift + /
                    </span>
                    <button
                      type="submit"
                      className="p-1 px-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer active:scale-90"
                      disabled={loadingAiChat}
                    >
                      <Send size={11} />
                    </button>
                  </div>
                </form>
              </div>

            </div>

          </div>

          {/* ========================================================= */}
          {/* PANEL 3: COMMUNITY CHATS & HOT TOPICS RIGHT CONTENT */}
          {/* ========================================================= */}
          <div className="w-full lg:w-[30%] p-6 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-850">
            
            {/* 1. Hot Topic Card */}
            <div className="bg-gradient-to-br from-blue-900/40 to-indigo-950/20 border border-blue-900/30 rounded-2xl p-4 space-y-2 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 top-0 w-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-1.5">
                <span className="text-[12px]">🔥</span>
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Hot Topic</span>
              </div>
              <h4 className="text-[12.5px] font-black text-slate-150 leading-snug">
                1B USD flees BTC and ETH ETFs for alts. Are XRP & HYPE the new ETF kings?
              </h4>
            </div>

            {/* 2. Sentiment Poll Widget */}
            <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4.5 space-y-4">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Activity size={12} className="text-emerald-500" />
                  Community Sentiment
                </span>
                <span className="text-slate-500 font-mono font-bold">
                  {(totalPollVotes / 1e6).toFixed(1)}M votes
                </span>
              </div>

              {/* Progress bars bullish vs bearish */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-black">
                  <span className="text-emerald-400">{votesCount.bullish}% Bullish</span>
                  <span className="text-rose-400">{votesCount.bearish}% Bearish</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex [direction:ltr]">
                  <div
                    className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
                    style={{ width: `${votesCount.bullish}%` }}
                  />
                  <div
                    className="bg-rose-500 h-full rounded-r-full transition-all duration-500"
                    style={{ width: `${votesCount.bearish}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons to vote */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleVote("bullish")}
                  className={`py-2 text-xs font-black rounded-xl text-center cursor-pointer transition-all border ${
                    voteType === "bullish"
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/10"
                      : "bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800"
                  }`}
                  disabled={voteType !== null}
                >
                  🐂 Bullish
                </button>
                <button
                  type="button"
                  onClick={() => handleVote("bearish")}
                  className={`py-2 text-xs font-black rounded-xl text-center cursor-pointer transition-all border ${
                    voteType === "bearish"
                      ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-500/10"
                      : "bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800"
                  }`}
                  disabled={voteType !== null}
                >
                  🐻 Bearish
                </button>
              </div>
            </div>

            {/* 3. Feed Tab and Feed block */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <div className="flex bg-slate-950 p-0.5 rounded-lg text-[10px] font-black">
                  <button
                    onClick={() => setFeedCategory("top")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      feedCategory === "top" ? "bg-slate-900 text-white" : "text-slate-500"
                    }`}
                  >
                    Top
                  </button>
                  <button
                    onClick={() => setFeedCategory("latest")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      feedCategory === "latest" ? "bg-slate-900 text-white" : "text-slate-500"
                    }`}
                  >
                    Latest
                  </button>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CoinCIKOX community</span>
              </div>

              {/* Feed composition input area */}
              <form onSubmit={submitPost} className="space-y-2 bg-[#0c101c]/40 border border-[#191e2e]/60 p-3 rounded-xl">
                <textarea
                  value={feedInput}
                  onChange={(e) => setFeedInput(e.target.value)}
                  placeholder={`$${coin.symbol} How do you feel to...`}
                  maxLength={180}
                  className="w-full bg-transparent border-0 resize-none outline-none text-xs text-slate-200 placeholder-slate-500 h-10 font-sans"
                />

                <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                  <span className="text-[9px] text-slate-600 font-mono">
                    {feedInput.length}/180 chars
                  </span>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-lg cursor-pointer max-h-[22px] flex items-center justify-center leading-none active:scale-95 transition-all"
                  >
                    Post
                  </button>
                </div>
              </form>

              {/* Individual listed Feed posts */}
              <div className="space-y-3.5 pt-2">
                {posts.map((post) => (
                  <div key={post.id} className="bg-[#0b0e14]/50 border border-slate-900 pb-3 rounded-xl space-y-2 select-text">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Circle Avatar */}
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 select-none">
                          <span className="text-[9px] font-black text-slate-300">{post.avatarText}</span>
                        </div>
                        <div className="flex flex-col leading-tight">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-bold text-slate-100">{post.author}</span>
                            {post.verified && (
                              <span className="bg-blue-500 text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">
                                ✓
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-500">{post.username}</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-600 font-mono">{post.timeText}</span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-medium leading-relaxed font-sans pr-1">
                      {post.content}
                    </p>

                    {/* Likes & Comments mock bars */}
                    <div className="flex items-center gap-4 text-[10px] text-slate-600 font-mono pt-1">
                      <button className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">
                        <ThumbsUp size={10} />
                        <span>{post.likes.toLocaleString()}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">
                        <MessageSquare size={10} />
                        <span>{post.comments.toLocaleString()}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
