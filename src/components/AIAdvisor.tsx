import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "../types";
import { Send, Sparkles, MessageCircle, RefreshCw } from "lucide-react";
import { SupportedLang, SupportedCurrency, TRANSLATIONS } from "../utils/localization";

interface AIAdvisorProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  loading: boolean;
  lang: SupportedLang;
  currency: SupportedCurrency;
  rates: Record<string, number>;
}

export default function AIAdvisor({
  chatHistory,
  onSendMessage,
  onClearChat,
  loading,
  lang,
  currency,
  rates,
}: AIAdvisorProps) {
  const t = TRANSLATIONS[lang];
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  // Suggested Prompts based on user language
  const idPrompts = [
    "Bagaimana mendiversifikasi portofolio koin dengan risiko moderat?",
    "Mengapa transaksi Solana (SOL) lebih cepat dibandingkan Ethereum?",
    "Bagaimana mekanisme pembakaran (deflasi) PEPE dan koin meme?",
    "Apa peran Oracle Chainlink (LINK) di DeFi?",
  ];

  const enPrompts = [
    "How should a beginner structure a moderate-risk portfolio?",
    "What are the main architectural trade-offs between Solana and Ethereum?",
    "Explain deflationary burn mechanisms in PEPE/Meme assets.",
    "Detail how Chainlink's decentralized oracles guard modern DeFi.",
  ];

  const dePrompts = [
    "Wie sollte ein Anfänger ein Portfolio mit moderatem Risiko aufbauen?",
    "Was sind die architektonischen Unterschiede zwischen Solana und Ethereum?",
    "Erklären Sie den deflationären Verbrennungsmechanismus von Meme-Coins.",
    "Rolle von Chainlink-Orakeln bei DeFi-Sicherheit?",
  ];

  const esPrompts = [
    "¿Cómo debe estructurar un principiante un portafolio de riesgo moderado?",
    "¿Cuáles son las diferencias de rendimiento entre Solana y Ethereum?",
    "Explique el mecanismo de quema deflacionaria de PEPE y monedas meme.",
    "¿Cómo protegen los oráculos de Chainlink a los sistemas DeFi?",
  ];

  const getSuggestedPrompts = () => {
    if (lang === "id") return idPrompts;
    if (lang === "de") return dePrompts;
    if (lang === "es") return esPrompts;
    return enPrompts;
  };

  const suggestedPrompts = getSuggestedPrompts();

  // Custom text formatter to support clean visual blocks
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return (
      <div className="space-y-3 font-sans text-sm tracking-normal leading-relaxed select-text">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // H1/H2
          if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
            return (
              <span key={idx} className="text-sm font-extrabold text-blue-400 block mt-3">
                {trimmed.replace(/\*\*/g, "")}
              </span>
            );
          }
          // Markdown Headings
          if (trimmed.startsWith("###")) {
            return (
              <span key={idx} className="text-xs font-black text-slate-100 uppercase tracking-widest block mt-3">
                {trimmed.replace(/###/g, "").trim()}
              </span>
            );
          }
          if (trimmed.startsWith("##") || trimmed.startsWith("#")) {
            return (
              <span key={idx} className="text-sm font-black text-slate-50 border-b border-slate-800 pb-0.5 block mt-4">
                {trimmed.replace(/[#*]/g, "").trim()}
              </span>
            );
          }
          // Bullets
          if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
            return (
              <li key={idx} className="list-disc ml-4 pl-0.5 text-slate-300">
                {trimmed.replace(/^[-*]\s*/, "")}
              </li>
            );
          }
          // Number lists
          if (/^\d+\.\s*/.test(trimmed)) {
            return (
              <div key={idx} className="pl-2 border-l-2 border-slate-800 my-1 text-slate-200">
                <span className="font-semibold block">{trimmed}</span>
              </div>
            );
          }

          return <p key={idx} className="text-slate-300">{trimmed}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 pt-2 font-sans select-none">
      
      {/* Left section: Information panel with preset questions */}
      <div className="md:col-span-1 space-y-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-xs uppercase tracking-wider mb-1">
            <Sparkles className="text-blue-400" size={15} />
            <span>{lang === "id" ? "Pemandu AI" : "AI Advisory Scope"}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
            {lang === "id" 
              ? "Tanyakan apa saja seputar pasar blockchain global, manajemen risiko modal, trend multi-chain, dan fundamental token utilitas murni." 
              : "Engage regarding capital splits, blockchain mechanics, Layer-2 scaling solutions, and asset safety routines."}
          </p>
          <div className="pt-2">
            <button
              onClick={onClearChat}
              className="w-full text-slate-500 hover:text-rose-400 text-xs font-extrabold flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-950 transition-all font-mono cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>{lang === "id" ? "RESET CHAT" : "RESET CHAT"}</span>
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="hidden md:block bg-slate-950/45 p-1.5 space-y-2">
          <span className="text-[10px] text-slate-550 font-extrabold uppercase tracking-widest block px-2">
            {lang === "id" ? "Rekomendasi Topik:" : "Suggested Topics:"}
          </span>
          <div className="flex flex-col gap-1.5">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => setInput(p)}
                className="text-left text-[11px] text-slate-400 hover:text-blue-400 hover:border-blue-500/30 p-2 rounded-xl bg-slate-900/60 border border-slate-850 hover:bg-slate-900 transition-all leading-normal font-sans font-medium cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Right section: Messaging window board with feed */}
      <div className="md:col-span-3 bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[75vh] shadow-xl relative">
        <div className="p-4 border-b border-slate-850 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <div>
              <h3 className="text-sm font-black text-slate-150 uppercase tracking-wider leading-none">
                AI Crypto Advisor Room
              </h3>
              <span className="text-[10px] text-slate-500 font-bold font-mono">
                Direct Gemini Link Connection
              </span>
            </div>
          </div>
        </div>

        {/* Messaging Box Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin select-text">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 select-none">
              <MessageCircle size={36} className="text-slate-800 animate-bounce" />
              <p className="text-sm font-extrabold text-slate-400">
                {lang === "id" ? "Selamat datang di AI Crypto Advisor!" : "Welcome to the AI Advisory Forum!"}
              </p>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed font-sans font-semibold">
                {lang === "id" 
                  ? "Tanyakan strategi investasi pintar secara obyektif atau klik pintasan rekomendasi di menu kiri." 
                  : "Submit complex prompts regarding allocations, risk margins, or smart contracts to generate strategic analysis reports."}
              </p>
            </div>
          ) : (
            chatHistory.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2.5`}
                >
                  {!isUser && (
                    <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-505 flex items-center justify-center text-slate-100 p-1 shrink-0 font-black text-xs shadow-md select-none">
                      AI
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 ${
                      isUser
                        ? "bg-blue-600 text-white rounded-tr-none shadow-md"
                        : "bg-slate-900 border border-slate-850 rounded-tl-none text-slate-300"
                    }`}
                  >
                    {isUser ? (
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                    ) : (
                      renderMessageContent(msg.text)
                    )}
                    <span className="text-[8px] font-mono text-slate-500 block text-right mt-2 select-none">
                      {msg.timestamp}
                    </span>
                  </div>

                  {isUser && (
                    <div className="h-7 w-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-300 shrink-0 uppercase shadow select-none">
                      ME
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Loader */}
          {loading && (
            <div className="flex justify-start items-center gap-2.5">
              <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-505 flex items-center justify-center text-slate-100 p-1 shrink-0 font-black text-xs">
                AI
              </div>
              <div className="bg-slate-900 border border-slate-850 rounded-2xl rounded-tl-none p-4 max-w-[80%] flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-xs text-slate-400 italic animate-pulse">
                  {lang === "id" ? "Gemini sedang mengalkulasi riset..." : "Gemini is building advisor insights..."}
                </span>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-850 bg-slate-900/10 flex gap-3 select-none">
          <input
            type="text"
            required
            disabled={loading}
            placeholder={
              lang === "id" 
                ? "Tulis pesan atau pertanyaan Finansial kripto Anda..." 
                : "Submit query or allocation question..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-150 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 transition-all text-white p-3.5 rounded-xl shadow-lg flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Send size={15} />
          </button>
        </form>
      </div>

    </div>
  );
}
