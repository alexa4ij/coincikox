import React, { useState, useEffect } from "react";
import { Coin, Transaction, ChatMessage, CryptoGlobalStats } from "./types";
import { INITIAL_COINS, GLOBAL_STATS, getFluctuatedCoins } from "./data";
import { SupportedLang, SupportedCurrency } from "./utils/localization";

// Components
import GlobalStatsHeader from "./components/GlobalStatsHeader";
import Navigation from "./components/Navigation";
import MarketOverview from "./components/MarketOverview";
import CoinDetailModal from "./components/CoinDetailModal";
import PortfolioTracker from "./components/PortfolioTracker";
import Watchlist from "./components/Watchlist";
import Converter from "./components/Converter";
import AIAdvisor from "./components/AIAdvisor";
import ExchangeApiHub from "./components/ExchangeApiHub";

const LOCAL_WATCHLIST_KEY = "cmc_clone_watchlist";
const LOCAL_TRANSACTIONS_KEY = "cmc_clone_transactions";
const LOCAL_CHAT_KEY = "cmc_clone_chat_history";
const LOCAL_LANG_KEY = "cmc_clone_lang";
const LOCAL_CURRENCY_KEY = "cmc_clone_currency";

export default function App() {
  // Global configurations
  const [lang, setLang] = useState<SupportedLang>(() => {
    const saved = localStorage.getItem(LOCAL_LANG_KEY);
    return (saved as SupportedLang) || "id";
  });

  const [currency, setCurrency] = useState<SupportedCurrency>(() => {
    const saved = localStorage.getItem(LOCAL_CURRENCY_KEY);
    return (saved as SupportedCurrency) || "USD";
  });

  const [rates, setRates] = useState<Record<string, number>>({
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
  });

  const [currentTab, setCurrentTab] = useState<
    "market" | "portfolio" | "watchlist" | "converter" | "advisor" | "exchanges"
  >("market");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

  // Core market state
  const [coins, setCoins] = useState<Coin[]>(INITIAL_COINS);
  const [globalStats, setGlobalStats] = useState<CryptoGlobalStats>(GLOBAL_STATS);

  // Watchlist state (Starred Coin IDs)
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_WATCHLIST_KEY);
      return saved ? JSON.parse(saved) : ["bitcoin", "ethereum", "solana"]; // Pre-starred populars
    } catch {
      return [];
    }
  });

  // Portfolio Transaction state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_TRANSACTIONS_KEY);
      if (saved) return JSON.parse(saved);
      
      // Default mock mock transactions so portfolio isn't empty initially!
      const initialDate = new Date();
      initialDate.setDate(initialDate.getDate() - 3);
      return [
        {
          id: "tx-mock-1",
          coinId: "bitcoin",
          type: "BUY",
          quantity: 0.15,
          price: 91500,
          date: initialDate.toISOString(),
        },
        {
          id: "tx-mock-2",
          coinId: "ethereum",
          type: "BUY",
          quantity: 1.5,
          price: 3350,
          date: new Date(initialDate.getTime() + 3600000).toISOString(),
        },
        {
          id: "tx-mock-3",
          coinId: "solana",
          type: "BUY",
          quantity: 12,
          price: 172.5,
          date: new Date(initialDate.getTime() + 7200000).toISOString(),
        },
      ];
    } catch {
      return [];
    }
  });

  // Chat advisor message history state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CHAT_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loadingChat, setLoadingChat] = useState(false);

  // Side-effect: Persist configurations and state to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem(LOCAL_TRANSACTIONS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_CHAT_KEY, JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem(LOCAL_LANG_KEY, lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(LOCAL_CURRENCY_KEY, currency);
  }, [currency]);

  // Load authentic real-world blockchain spot prices and global stats
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const [marketRes, globalRes, ratesRes] = await Promise.all([
          fetch("/api/crypto/market"),
          fetch("/api/crypto/global"),
          fetch("/api/crypto/rates"),
        ]);
        if (marketRes.ok && globalRes.ok) {
          const marketData = await marketRes.json();
          const globalData = await globalRes.json();
          if (marketData.coins) {
            setCoins(marketData.coins);
          }
          if (globalData.stats) {
            setGlobalStats(globalData.stats);
          }
        }
        if (ratesRes && ratesRes.ok) {
          const ratesData = await ratesRes.json();
          if (ratesData && ratesData.rates) {
            setRates(ratesData.rates);
          }
        }
      } catch (err) {
        console.error("Failed to load official spot rates:", err);
      }
    };

    // Load instantly on start
    fetchRealData();

    // Re-verify actual prices every 15 seconds
    const apiInterval = setInterval(fetchRealData, 15000);
    return () => clearInterval(apiInterval);
  }, []);

  // Real-time interval price tick scheduler for micro-adjustments (Fluctuate every 4.5 seconds to feel live!)
  useEffect(() => {
    const handleTickerTick = () => {
      setCoins((currentCoins) => getFluctuatedCoins(currentCoins));
      
      // Slightly fluctuate global stats to sync with coin movements
      setGlobalStats((prev) => {
        const delta = (Math.random() - 0.49) * 0.1; // small change
        return {
          ...prev,
          totalMarketCap: Math.round(prev.totalMarketCap * (1 + delta / 100)),
          marketCapChange24h: parseFloat((prev.marketCapChange24h + delta).toFixed(2)),
          volume24h: Math.round(prev.volume24h * (1 + (Math.random() - 0.5) * 0.01)),
          gasPriceGwei: Math.max(8, prev.gasPriceGwei + Math.floor(Math.random() * 3) - 1),
        };
      });
    };

    const interval = setInterval(handleTickerTick, 4500);
    return () => clearInterval(interval);
  }, []);

  // Handler: Watchlist star/unstar toggle
  const handleToggleWatchlist = (coinId: string) => {
    setWatchlist((prev) =>
      prev.includes(coinId) ? prev.filter((id) => id !== coinId) : [...prev, coinId]
    );
  };

  // Handler: Register buy/sell order transaction
  const handleAddTransaction = (newTx: Omit<Transaction, "id" | "date">) => {
    const transaction: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [transaction, ...prev]);
  };

  // Handler: Remove transaction entry
  const handleDeleteTransaction = (txId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
  };

  // Handler: AI Advisor conversational messenger dispatcher
  const handleSendMessage = async (userMessage: string) => {
    const userMsgObj: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      text: userMessage,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    // Append message visually
    const nextHistory = [...chatHistory, userMsgObj];
    setChatHistory(nextHistory);
    setLoadingChat(true);

    try {
      // Map history states to match server schemas
      const mappedHistory = chatHistory.slice(-6).map((h) => ({
        role: h.role,
        text: h.text,
      }));

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          chatHistory: mappedHistory,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal menghubungi asisten AI.");
      }

      const modelMsgObj: ChatMessage = {
        id: `msg-${Date.now()}-model`,
        role: "model",
        text: data.reply || "Maaf, sistem tidak mengembalikan tanggapan.",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };

      setChatHistory((prev) => [...prev, modelMsgObj]);
    } catch (err: any) {
      console.error(err);
      const errMsgObj: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: "model",
        text: `Maaf, terjadi galat saat mengolah advis finansial Anda: ${err.message || String(err)}`,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatHistory((prev) => [...prev, errMsgObj]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleClearChat = () => {
    setChatHistory([]);
  };

  // Filtering based on globally-bound Nav Search Query
  const getSearchedCoins = () => {
    if (!searchQuery.trim()) return coins;
    const lower = searchQuery.toLowerCase();
    return coins.filter(
      (c) => c.name.toLowerCase().includes(lower) || c.symbol.toLowerCase().includes(lower)
    );
  };

  const searchedCoins = getSearchedCoins();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-300 select-none antialiased">
      
      {/* 1. Global Stat Ticker Bar */}
      <GlobalStatsHeader stats={globalStats} lang={lang} currency={currency} rates={rates} />

      {/* 2. Brand & Menu Navigation */}
      <Navigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        lang={lang}
        setLang={setLang}
        currency={currency}
        setCurrency={setCurrency}
      />

      {/* 3. Main Dynamic Viewing Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Core View router conditional switcher */}
        {currentTab === "market" && (
          <MarketOverview
            coins={searchedCoins}
            onSelectCoin={(coin) => setSelectedCoin(coin)}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            globalStats={globalStats}
            lang={lang}
            currency={currency}
            rates={rates}
          />
        )}

        {currentTab === "portfolio" && (
          <PortfolioTracker
            coins={coins}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            lang={lang}
            currency={currency}
            rates={rates}
          />
        )}

        {currentTab === "watchlist" && (
          <Watchlist
            coins={coins}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectCoin={(coin) => setSelectedCoin(coin)}
            lang={lang}
            currency={currency}
            rates={rates}
          />
        )}

        {currentTab === "converter" && (
          <Converter 
            coins={coins} 
            lang={lang}
            currency={currency}
            rates={rates}
          />
        )}

        {currentTab === "advisor" && (
          <AIAdvisor
            chatHistory={chatHistory}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            loading={loadingChat}
            lang={lang}
            currency={currency}
            rates={rates}
          />
        )}

        {currentTab === "exchanges" && (
          <ExchangeApiHub
            lang={lang}
            currency={currency}
            rates={rates}
          />
        )}

      </main>

      {/* 4. Overlay Drawer Side View Modal */}
      {selectedCoin && (
        <CoinDetailModal
          coin={coins.find((c) => c.id === selectedCoin.id) || selectedCoin}
          onClose={() => setSelectedCoin(null)}
          lang={lang}
          currency={currency}
          rates={rates}
        />
      )}

      {/* 5. Clean Institutional Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 py-6 px-4 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-500 text-[10.5px] font-mono gap-4">
          <div>
            &copy; 2026 CoinCIKOX Intel Terminal. Segala hak dilindungi undang-undang.
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-slate-300">Privacy Policy</span>
            <span>&bull;</span>
            <span className="cursor-pointer hover:text-slate-300">Terms of Use</span>
            <span>&bull;</span>
            <span className="text-slate-600">Simulated Sandbox Sandbox</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

