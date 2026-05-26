import React from "react";
import logoUrl from "../assets/images/coincikox_logo_1779765697670.png";
import { Coins, Search, Star, Award, TrendingUp, HelpCircle, Globe, ChevronDown, Check, X } from "lucide-react";
import { 
  SupportedLang, 
  SupportedCurrency, 
  TRANSLATIONS, 
  SUPPORTED_LANGUAGES, 
  SUPPORTED_CURRENCIES 
} from "../utils/localization";

interface NavigationProps {
  currentTab: "market" | "portfolio" | "watchlist" | "converter" | "advisor" | "exchanges";
  setCurrentTab: (tab: "market" | "portfolio" | "watchlist" | "converter" | "advisor" | "exchanges") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  lang: SupportedLang;
  setLang: (lang: SupportedLang) => void;
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
}

// Custom Premium unified Settings and Localization dropdown
interface PreferencesDropdownProps {
  lang: SupportedLang;
  setLang: (lang: SupportedLang) => void;
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
  align?: "left" | "right";
}

function PreferencesDropdown({
  lang,
  setLang,
  currency,
  setCurrency,
  align = "right",
}: PreferencesDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [langSearch, setLangSearch] = React.useState("");
  const [curSearch, setCurSearch] = React.useState("");
  const [mobileTab, setMobileTab] = React.useState<"lang" | "cur">("lang");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredLanguages = Object.entries(SUPPORTED_LANGUAGES).filter(([code, def]) => {
    const s = langSearch.toLowerCase();
    return code.toLowerCase().includes(s) || def.name.toLowerCase().includes(s);
  });

  const filteredCurrencies = Object.entries(SUPPORTED_CURRENCIES).filter(([code, def]) => {
    const s = curSearch.toLowerCase();
    return code.toLowerCase().includes(s) || def.name.toLowerCase().includes(s) || def.symbol.toLowerCase().includes(s);
  });

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold tracking-wide transition-all shadow-md cursor-pointer hover:bg-slate-850 active:scale-95 duration-150"
      >
        <Globe size={13} className="text-blue-400 animate-spin-slow" />
        <span className="flex items-center gap-1">
          <span>{SUPPORTED_LANGUAGES[lang].flag}</span>
          <span className="uppercase text-[10px] tracking-wider text-slate-300">{lang}</span>
        </span>
        <span className="text-slate-700 font-light">•</span>
        <span className="font-mono text-blue-400 font-extrabold">{currency}</span>
        <ChevronDown size={12} className={`text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-2 bg-slate-950 border border-slate-800 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] z-50 p-4 w-[280px] sm:w-[500px] text-slate-200`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                <Globe size={12} className="text-blue-500" />
                Language & Currency
              </h4>
              <p className="text-[10px] text-slate-500">Select preferences from our global database</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-900 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Desktop Dual-Column Layout */}
          <div className="hidden sm:flex items-stretch gap-4">
            {/* Language Column */}
            <div className="flex-1 flex flex-col min-w-0">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 block">
                Select Language
              </label>
              {/* Search Bar */}
              <div className="relative mb-2">
                <Search size={12} className="absolute left-2.5 top-2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg py-1 pl-7 pr-3 text-[10.5px] outline-none text-slate-200 focus:border-blue-500/50 focus:bg-slate-900 transition-all font-sans"
                />
              </div>
              {/* Scroll list */}
              <div className="flex-1 max-h-[185px] overflow-y-auto pr-1 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-800">
                {filteredLanguages.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center py-4">No languages found</p>
                ) : (
                  filteredLanguages.map(([code, def]) => {
                    const isSelected = lang === code;
                    return (
                      <button
                        key={code}
                        onClick={() => setLang(code as SupportedLang)}
                        className={`w-full flex items-center justify-between text-left px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-blue-600/10 text-blue-400 font-bold border border-blue-500/20"
                            : "hover:bg-slate-900 text-slate-400 hover:text-slate-100 border border-transparent"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-[13px]">{def.flag}</span>
                          <span className="font-medium truncate">{def.name}</span>
                        </span>
                        {isSelected && <Check size={12} className="text-blue-500 flex-shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Vertical Splitter */}
            <div className="w-[1px] bg-slate-900" />

            {/* Currency Column */}
            <div className="flex-1 flex flex-col min-w-0">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 block">
                Select Currency
              </label>
              {/* Search Bar */}
              <div className="relative mb-2">
                <Search size={12} className="absolute left-2.5 top-2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by code or name..."
                  value={curSearch}
                  onChange={(e) => setCurSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg py-1 pl-7 pr-3 text-[10.5px] outline-none text-slate-200 focus:border-blue-500/50 focus:bg-slate-900 transition-all font-sans"
                />
              </div>
              {/* Scroll list */}
              <div className="flex-1 max-h-[185px] overflow-y-auto pr-1 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-800">
                {filteredCurrencies.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center py-4">No currencies found</p>
                ) : (
                  filteredCurrencies.map(([code, def]) => {
                    const isSelected = currency === code;
                    return (
                      <button
                        key={code}
                        onClick={() => setCurrency(code as SupportedCurrency)}
                        className={`w-full flex items-center justify-between text-left px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-blue-600/10 text-blue-400 font-bold border border-blue-500/20"
                            : "hover:bg-slate-900 text-slate-400 hover:text-slate-100 border border-transparent"
                        }`}
                      >
                        <div className="flex flex-col min-w-0 leading-tight">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-200 font-mono text-[11px]">{code}</span>
                            <span className="text-[10px] font-medium text-slate-550">({def.symbol})</span>
                          </div>
                          <span className="text-[9px] text-slate-500 truncate max-w-[130px]">{def.name}</span>
                        </div>
                        {isSelected && <Check size={12} className="text-blue-500 flex-shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Mobile Layout (Swappable Tabs) */}
          <div className="sm:hidden flex flex-col">
            {/* Tabs Trigger */}
            <div className="flex bg-slate-900 p-0.5 rounded-xl mb-2.5">
              <button
                type="button"
                onClick={() => setMobileTab("lang")}
                className={`flex-1 py-1.5 text-center text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                  mobileTab === "lang"
                    ? "bg-slate-850 text-slate-100 shadow-sm border border-slate-800/80"
                    : "text-slate-500"
                }`}
              >
                Languages ({filteredLanguages.length})
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("cur")}
                className={`flex-1 py-1.5 text-center text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                  mobileTab === "cur"
                    ? "bg-slate-850 text-slate-100 shadow-sm border border-slate-800/80"
                    : "text-slate-500"
                }`}
              >
                Currencies ({filteredCurrencies.length})
              </button>
            </div>

            {/* Active Content */}
            {mobileTab === "lang" ? (
              <div className="flex flex-col">
                <div className="relative mb-2">
                  <Search size={11} className="absolute left-2.5 top-1.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 pl-7 pr-3 text-[10.5px] outline-none text-slate-200"
                  />
                </div>
                <div className="max-h-[170px] overflow-y-auto space-y-0.5 pr-0.5 scrollbar-thin scrollbar-thumb-slate-800">
                  {filteredLanguages.map(([code, def]) => {
                    const isSelected = lang === code;
                    return (
                      <button
                        key={code}
                        onClick={() => setLang(code as SupportedLang)}
                        className={`w-full flex items-center justify-between text-left px-2 py-1.5 rounded-lg text-xs cursor-pointer ${
                          isSelected ? "bg-blue-600/10 text-blue-400 font-bold" : "text-slate-400"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{def.flag}</span>
                          <span className="truncate">{def.name}</span>
                        </span>
                        {isSelected && <Check size={11} className="text-blue-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="relative mb-2">
                  <Search size={11} className="absolute left-2.5 top-1.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={curSearch}
                    onChange={(e) => setCurSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 pl-7 pr-3 text-[10.5px] outline-none text-slate-200"
                  />
                </div>
                <div className="max-h-[170px] overflow-y-auto space-y-0.5 pr-0.5 scrollbar-thin scrollbar-thumb-slate-800">
                  {filteredCurrencies.map(([code, def]) => {
                    const isSelected = currency === code;
                    return (
                      <button
                        key={code}
                        onClick={() => setCurrency(code as SupportedCurrency)}
                        className={`w-full flex items-center justify-between text-left px-2 py-1.5 rounded-lg text-xs cursor-pointer ${
                          isSelected ? "bg-blue-600/10 text-blue-400 font-bold" : "text-slate-400"
                        }`}
                      >
                        <span>
                          <span className="font-bold text-slate-200 font-mono text-[11px]">{code}</span>
                          <span className="text-slate-500 ml-1">({def.symbol})</span>
                          <span className="text-slate-550 block text-[9px] -mt-0.5 truncate max-w-[180px]">{def.name}</span>
                        </span>
                        {isSelected && <Check size={11} className="text-blue-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-900 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10.5px] tracking-wide uppercase px-3.5 py-1.5 rounded-xl cursor-pointer shadow-md shadow-blue-550/10 active:scale-95 transition-all duration-150"
            >
              Apply Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navigation({
  currentTab,
  setCurrentTab,
  searchQuery,
  setSearchQuery,
  lang,
  setLang,
  currency,
  setCurrency,
}: NavigationProps) {
  const t = TRANSLATIONS[lang];
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

  return (
    <header className="w-full bg-[#0a0c14] border-b border-slate-900 sticky top-0 z-40 shadow-xl">
      {/* Row 1: Main authentic CoinCIKOX Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        {/* Left Side: Brand Logo and Navigation links */}
        <div className="flex items-center gap-6">
          {/* Logo Brand */}
          <div 
            onClick={() => setCurrentTab("market")} 
            className="flex items-center gap-2 cursor-pointer select-none"
            id="coincikox-logo-container"
          >
            {/* Beautiful customized CoinCIKOX Logo Mark */}
            <div className="bg-blue-600/20 border border-blue-500/30 p-1 rounded-lg flex items-center justify-center text-white shadow-lg relative group overflow-hidden">
              <img src={logoUrl} alt="CoinCIKOX Logo" className="w-[18px] h-[18px] rounded-md object-cover" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[17px] text-white tracking-tight font-sans">CoinCIKOX</span>
              <span className="bg-gradient-to-r from-blue-500/20 to-indigo-550/25 text-blue-400 text-[8px] font-black px-1 py-0.5 rounded border border-blue-500/30 uppercase tracking-widest hidden md:inline">
                PRO
              </span>
            </div>
          </div>

          {/* Core Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-[13.5px] font-bold text-slate-300">
            <button
              onClick={() => setCurrentTab("market")}
              className={`hover:text-white transition-colors cursor-pointer py-1 ${currentTab === "market" ? "text-blue-400" : ""}`}
            >
              Cryptocurrencies
            </button>
            <button
              onClick={() => setCurrentTab("portfolio")}
              className={`hover:text-white transition-colors cursor-pointer py-1 ${currentTab === "portfolio" ? "text-blue-400" : ""}`}
            >
              Dashboards
            </button>
            <button
              onClick={() => setCurrentTab("exchanges")}
              className={`hover:text-white transition-colors cursor-pointer py-1 ${currentTab === "exchanges" ? "text-blue-400" : ""}`}
            >
              DexScan
            </button>
            <button
              onClick={() => setCurrentTab("exchanges")}
              className={`hover:text-white transition-colors cursor-pointer py-1 ${currentTab === "exchanges" ? "text-blue-400" : ""}`}
            >
              Exchanges
            </button>
            
            {/* More Multi dropdown menu */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-1"
              >
                <span>More</span>
                <ChevronDown size={12} className={`text-slate-500 transition-transform ${showMoreMenu ? "rotate-180" : ""}`} />
              </button>
              
              {showMoreMenu && (
                <div className="absolute left-0 mt-2 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 py-2 w-48">
                  <button
                    onClick={() => {
                      setCurrentTab("converter");
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition-colors flex items-center gap-2"
                  >
                    <Coins size={12} />
                    <span>Currency Converter</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab("advisor");
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition-colors flex items-center gap-2"
                  >
                    <HelpCircle size={12} />
                    <span>AI Crypto Advisor</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Side: Tools, Search, Preferences, Login & Profile Avatar */}
        <div className="flex items-center gap-3">
          
          {/* Portfolio & Watchlist Text shortcuts */}
          <div className="hidden xl:flex items-center gap-4 text-xs font-bold text-slate-300">
            <button 
              onClick={() => setCurrentTab("portfolio")}
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Award size={14} className="text-amber-500" />
              <span>Portfolio</span>
            </button>
            <button 
              onClick={() => setCurrentTab("watchlist")}
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Star size={14} className="text-yellow-500" />
              <span>Watchlist</span>
            </button>
          </div>

          {/* Tidy search pill with keyboard shortcut helper element */}
          <div className="relative hidden md:flex items-center w-48 lg:w-56">
            <Search className="absolute left-3 text-slate-500" size={13} />
            <input
              type="text"
              placeholder={t.searchPlaceholder || "Search"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#191e2e]/90 text-[11px] border border-slate-800 rounded-full py-1.5 pl-8 pr-10 text-slate-200 outline-none focus:border-blue-500 focus:bg-slate-900 transition-all font-sans font-medium"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-slate-500 hover:text-slate-300 text-[10px] font-black"
              >
                ✕
              </button>
            ) : (
              <span className="absolute right-3 bg-slate-800 text-[9px] font-black text-slate-500 px-1.5 py-0.5 rounded border border-slate-750">
                /
              </span>
            )}
          </div>

          {/* Dynamic Language / Currency switch dropdown */}
          <PreferencesDropdown
            lang={lang}
            setLang={setLang}
            currency={currency}
            setCurrency={setCurrency}
            align="right"
          />

          {/* Premium Blue Login Button */}
          <button 
            type="button"
            className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] px-3.5 py-1.5 rounded-xl cursor-pointer shadow-md select-none tracking-wide"
          >
            Log In
          </button>

          {/* Sleek Profile Circle Avatar */}
          <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center border border-slate-750 shadow-inner relative cursor-pointer select-none">
            <span className="text-[10px] font-black text-slate-300 uppercase">SU</span>
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border-2 border-[#0a0c14]" />
          </div>

        </div>
      </div>

      {/* Row 2: Sub-navigation horizontal tabs row matching the image */}
      <div className="w-full bg-[#0d1220] border-t border-slate-900 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-[13px] text-slate-400 whitespace-nowrap">
          {/* Sub menu Navigation list */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentTab("market")}
              className={`px-3 py-2.5 font-bold transition-all relative ${
                currentTab === "market"
                  ? "text-blue-500 text-shadow-sm font-black"
                  : "hover:text-slate-200"
              }`}
            >
              <span>Top</span>
              {currentTab === "market" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => {
                setCurrentTab("market");
                // Trigger a mini mock search keyword of trending or just go there
              }}
              className="px-3 py-2.5 font-bold hover:text-slate-200 flex items-center gap-1.5"
            >
              <span>Trending</span>
              <span className="w-1 h-1 bg-red-500 rounded-full animate-ping" />
            </button>

            <button
              onClick={() => setCurrentTab("watchlist")}
              className={`px-3 py-2.5 font-bold transition-all relative ${
                currentTab === "watchlist"
                  ? "text-blue-500 text-shadow-sm font-black"
                  : "hover:text-slate-200"
              }`}
            >
              <span>Watchlist</span>
              {currentTab === "watchlist" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setCurrentTab("advisor")}
              className={`px-3 py-2.5 font-bold transition-all relative flex items-center gap-1.5 ${
                currentTab === "advisor"
                  ? "text-blue-500 text-shadow-sm font-black"
                  : "hover:text-slate-200"
              }`}
            >
              <span>Prediction Markets</span>
              <span className="bg-blue-500/10 text-blue-400 text-[8px] font-extrabold px-1 py-0.2 rounded border border-blue-500/20 uppercase tracking-widest leading-none">
                AI
              </span>
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-500 rounded-full opacity-0" />
              {currentTab === "advisor" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setCurrentTab("portfolio")}
              className={`px-3 py-2.5 font-bold transition-all relative ${
                currentTab === "portfolio"
                  ? "text-blue-500 text-shadow-sm font-black"
                  : "hover:text-slate-200"
              }`}
            >
              <span>Most Visited</span>
              {currentTab === "portfolio" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setCurrentTab("converter")}
              className={`px-3 py-2.5 font-bold transition-all relative ${
                currentTab === "converter"
                  ? "text-blue-500 text-shadow-sm font-black"
                  : "hover:text-slate-200"
              }`}
            >
              <span>New</span>
              {currentTab === "converter" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setCurrentTab("exchanges")}
              className={`px-3 py-2.5 font-bold transition-all relative ${
                currentTab === "exchanges"
                  ? "text-blue-500 text-shadow-sm font-black"
                  : "hover:text-slate-200"
              }`}
            >
              <span>Exchanges</span>
              {currentTab === "exchanges" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-500 rounded-full" />
              )}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-slate-500">
              <span>Show/Hide:</span>
              <span className="text-slate-300 hover:text-white cursor-pointer select-none">Filters</span>
              <span>•</span>
              <span className="text-slate-300 hover:text-white cursor-pointer select-none">Columns</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
