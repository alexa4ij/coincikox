import { Coin, CryptoGlobalStats } from "./types";

export const INITIAL_COINS: Coin[] = [
  {
    id: "bitcoin",
    rank: 1,
    name: "Bitcoin",
    symbol: "BTC",
    price: 93450.25,
    priceChange1h: 0.18,
    priceChange24h: 3.42,
    priceChange7d: 8.75,
    marketCap: 1835690450000,
    volume24h: 42150900000,
    circulatingSupply: 19685000,
    maxSupply: 21000000,
    category: "layer-1",
    sparkline: [91200, 91500, 92000, 91800, 92500, 93100, 93450],
    description: "Bitcoin adalah aset kripto pertama yang dibangun dengan teknologi blockchain terdesentralisasi. Dikembangkan oleh Satoshi Nakamoto pada tahun 2008 sebagai alternatif mata uang fiat global yang kebal terhadap inflasi karena batas pasokan keras di angka 21 juta koin."
  },
  {
    id: "ethereum",
    rank: 2,
    name: "Ethereum",
    symbol: "ETH",
    price: 3420.50,
    priceChange1h: -0.05,
    priceChange24h: 1.85,
    priceChange7d: 4.12,
    marketCap: 410460900000,
    volume24h: 18450120000,
    circulatingSupply: 120100000,
    category: "layer-1",
    sparkline: [3350, 3380, 3410, 3390, 3400, 3445, 3420.5],
    description: "Ethereum adalah platform smart-contract terdesentralisasi global terkemuka yang diluncurkan oleh Vitalik Buterin. ETH menggerakkan ekosistem aplikasi terdesentralisasi (DApps), decentralized finance (DeFi), dan standard token ERC-20."
  },
  {
    id: "solana",
    rank: 3,
    name: "Solana",
    symbol: "SOL",
    price: 184.75,
    priceChange1h: 0.45,
    priceChange24h: 7.15,
    priceChange7d: 18.24,
    marketCap: 83500250000,
    volume24h: 4890300000,
    circulatingSupply: 451960000,
    category: "layer-1",
    sparkline: [171, 175, 178, 176, 180, 182, 184.75],
    description: "Solana adalah blockchain berkinerja tinggi yang dirancang untuk adopsi massal. Menggunakan mekanisme konsensus unik Proof of History (PoH) yang dikombinasikan dengan Proof of Stake (PoS) untuk menyelesaikan transaksi dengan biaya gas fraksional dan throughput super cepat."
  },
  {
    id: "binancecoin",
    rank: 4,
    name: "BNB",
    symbol: "BNB",
    price: 585.30,
    priceChange1h: -0.12,
    priceChange24h: 0.95,
    priceChange7d: 3.85,
    marketCap: 86340570000,
    volume24h: 1240100000,
    circulatingSupply: 147500000,
    maxSupply: 200000000,
    category: "layer-1",
    sparkline: [572, 574, 580, 582, 579, 588, 585.3],
    description: "BNB adalah koin utilitas asli dari bursa kripto terbesar di dunia Binance, serta gas token dari BNB Smart Chain (BSC). Koin ini digunakan untuk memotong biaya perdagangan dan berpartisipasi dalam penjualan token Launchpad."
  },
  {
    id: "ripple",
    rank: 5,
    name: "Ripple",
    symbol: "XRP",
    price: 1.12,
    priceChange1h: 1.22,
    priceChange24h: -1.45,
    priceChange7d: 14.50,
    marketCap: 61600000000,
    volume24h: 2150900000,
    circulatingSupply: 55000000000,
    maxSupply: 100000000000,
    category: "layer-1",
    sparkline: [0.98, 1.05, 1.18, 1.15, 1.22, 1.16, 1.12],
    description: "XRP adalah token independen milik jaringan pembayaran RippleNet. Jaringan ini dioptimalkan untuk pengiriman uang global antar bank secara seketika dan biaya transaksi yang sangat murah."
  },
  {
    id: "dogecoin",
    rank: 6,
    name: "Dogecoin",
    symbol: "DOGE",
    price: 0.385,
    priceChange1h: -0.42,
    priceChange24h: 12.80,
    priceChange7d: 34.60,
    marketCap: 56120000000,
    volume24h: 6850250000,
    circulatingSupply: 145000000000,
    category: "meme",
    sparkline: [0.28, 0.31, 0.35, 0.32, 0.37, 0.39, 0.385],
    description: "Diciptakan pada tahun 2013 sebagai lelucon ramah oleh Billy Markus dan Jackson Palmer, Dogecoin bangkit menjadi fenomena internet budaya pop yang didukung kuat oleh komunitas fanatik dan tokoh-tokoh seperti Elon Musk."
  },
  {
    id: "cardano",
    rank: 7,
    name: "Cardano",
    symbol: "ADA",
    price: 0.942,
    priceChange1h: 0.08,
    priceChange24h: 2.12,
    priceChange7d: 11.45,
    marketCap: 33450900000,
    volume24h: 890450000,
    circulatingSupply: 35600000000,
    maxSupply: 45000000000,
    category: "layer-1",
    sparkline: [0.83, 0.86, 0.90, 0.88, 0.93, 0.95, 0.942],
    description: "Cardano adalah platform blockchain ilmiah open-source pertama yang dibangun di atas dasar paper akademik peer-reviewed. Pendiri utamanya adalah Charles Hoskinson, salah satu mantan pendiri Core Ethereum."
  },
  {
    id: "pepe",
    rank: 8,
    name: "Pepe Coin",
    symbol: "PEPE",
    price: 0.0000142,
    priceChange1h: 1.54,
    priceChange24h: 18.42,
    priceChange7d: 45.20,
    marketCap: 5970800000,
    volume24h: 1890250000,
    circulatingSupply: 420690000000000,
    category: "meme",
    sparkline: [0.0000098, 0.000011, 0.000013, 0.000012, 0.0000135, 0.000014, 0.0000142],
    description: "Pepe adalah koin meme deflasi hiper-spekulatif yang diluncurkan di Ethereum sebagai penghormatan kepada karakter meme legendaris internet Pepe the Frog yang diciptakan Matt Furie."
  },
  {
    id: "shibainu",
    rank: 9,
    name: "Shiba Inu",
    symbol: "SHIB",
    price: 0.0000248,
    priceChange1h: -0.35,
    priceChange24h: -1.25,
    priceChange7d: 9.80,
    marketCap: 14610000000,
    volume24h: 912300000,
    circulatingSupply: 589270000000000,
    category: "meme",
    sparkline: [0.000022, 0.000023, 0.000025, 0.000024, 0.000026, 0.0000252, 0.0000248],
    description: "Dikenal sebagai 'Doge Killer', Shiba Inu (SHIB) adalah token meme berbasis komunitas ERC-20 yang berkembang pesat menjadi ekosistem DeFi lengkap dengan bursa desentralisasi ShibaSwap, L2 Shibarium, dan koleksi NFT."
  },
  {
    id: "chainlink",
    rank: 10,
    name: "Chainlink",
    symbol: "LINK",
    price: 18.25,
    priceChange1h: 0.22,
    priceChange24h: 4.15,
    priceChange7d: 12.30,
    marketCap: 11450250000,
    volume24h: 671200000,
    circulatingSupply: 627100000,
    maxSupply: 1000000000,
    category: "defi",
    sparkline: [16.1, 16.5, 17.2, 17.0, 17.9, 18.3, 18.25],
    description: "Chainlink menyediakan oracle terdesentralisasi mutakhir yang menjembatani data dunia nyata secara aman dengan smart-contract blockchain. Ia adalah infrastruktur tulang punggung sebagian besar protokol DeFi besar."
  },
  {
    id: "uniswap",
    rank: 11,
    name: "Uniswap",
    symbol: "UNI",
    price: 11.45,
    priceChange1h: -0.05,
    priceChange24h: 3.85,
    priceChange7d: 15.60,
    marketCap: 6870450000,
    volume24h: 345100000,
    circulatingSupply: 600000000,
    maxSupply: 1000000000,
    category: "defi",
    sparkline: [9.8, 10.2, 11.0, 10.9, 11.5, 11.6, 11.45],
    description: "Uniswap adalah protokol perdagangan bursa terdesentralisasi (DEX) terbesar berbasis Automated Market Maker (AMM) di jaringan Ethereum. Token tata kelola UNI memberi pemegangnya hak voting inovasi platform."
  },
  {
    id: "lido",
    rank: 12,
    name: "Lido DAO",
    symbol: "LDO",
    price: 194.20,
    priceChange1h: 0.15,
    priceChange24h: 2.15,
    priceChange7d: 6.70,
    marketCap: 1735900000,
    volume24h: 120500000,
    circulatingSupply: 890000000,
    category: "defi",
    sparkline: [180, 182, 191, 188, 195, 196, 194.2],
    description: "Lido DAO mengelola protokol liquid staking terpopuler yang memungkinkan deposan mengunci ETH secara aman dan menerima turunan likuid (stETH) agar tetap produktif digunakan di seluruh ceruk DeFi."
  },
  {
    id: "polygon",
    rank: 13,
    name: "Polygon Ecosystem",
    symbol: "POL",
    price: 0.545,
    priceChange1h: 0.12,
    priceChange24h: 3.55,
    priceChange7d: 14.80,
    marketCap: 4350900000,
    volume24h: 234100000,
    circulatingSupply: 7980000000,
    category: "layer-2",
    sparkline: [0.47, 0.49, 0.52, 0.51, 0.55, 0.56, 0.545],
    description: "Sistem Polygon (sebelumnya MATIC) adalah agregator integrasi platform penskalaan Layer-2 multi-chain Ethereum yang luar biasa cepat dan aman, mengandalkan arsitektur sidechain berkemampuan ZK."
  },
  {
    id: "arbitrum",
    rank: 14,
    name: "Arbitrum",
    symbol: "ARB",
    price: 0.952,
    priceChange1h: -0.21,
    priceChange24h: 1.10,
    priceChange7d: -2.35,
    marketCap: 2750000000,
    volume24h: 198030000,
    circulatingSupply: 2900000000,
    maxSupply: 1000000000,
    category: "layer-2",
    sparkline: [0.98, 0.94, 0.92, 0.95, 0.96, 0.94, 0.952],
    description: "Arbitrum merupakan solusi Layer-2 rollup optimistik termasyhur yang dirancang untuk memperluas jangkauan throughput dan skalabilitas kontrak pintar Ethereum dengan cara menggabungkan ribuan transaksi ke dalam satu batch."
  },
  {
    id: "render",
    rank: 15,
    name: "Render Token",
    symbol: "RENDER",
    price: 7.85,
    priceChange1h: 0.85,
    priceChange24h: 9.42,
    priceChange7d: 22.40,
    marketCap: 3050900000,
    volume24h: 467900000,
    circulatingSupply: 388000000,
    category: "ai",
    sparkline: [6.4, 6.8, 7.2, 7.1, 7.5, 7.9, 7.85],
    description: "Render Network adalah penyedia komputasi grafis (GPU) terdesentralisasi berbasis blockchain berbasis peer-to-peer terbaik, mendukung rendering 3D super cepat, CGI, serta pemrosesan dataset pelatihan AI canggih."
  },
  {
    id: "fetch-ai",
    rank: 16,
    name: "Artificial Superintelligence",
    symbol: "FET",
    price: 1.55,
    priceChange1h: 0.52,
    priceChange24h: 8.12,
    priceChange7d: 19.50,
    marketCap: 3910300000,
    volume24h: 310500000,
    circulatingSupply: 2520000000,
    category: "ai",
    sparkline: [1.3, 1.35, 1.45, 1.42, 1.50, 1.58, 1.55],
    description: "FET menggerakkan jaringan kecerdasan buatan terdesentralisasi terkemuka yang membantu pembuatan, integrasi, dan eksekusi jaringan 'Autonomous Economic Agents' mandiri untuk memicu automatisasi canggih skala web."
  },
  {
    id: "gala",
    rank: 17,
    name: "Gala Games",
    symbol: "GALA",
    price: 0.038,
    priceChange1h: 1.12,
    priceChange24h: 5.60,
    priceChange7d: 15.12,
    marketCap: 1140300000,
    volume24h: 145900000,
    circulatingSupply: 30400000000,
    category: "gaming",
    sparkline: [0.032, 0.034, 0.036, 0.035, 0.039, 0.037, 0.038],
    description: "Gala Games mengembalikan kepemilikan aset, NFT item, suara manajemen, serta nilai komersial bermain langsung ke tangan gamer sejati menggunakan protokol blockchain terdesentralisasi berkecepatan tinggi."
  },
  {
    id: "immutable",
    rank: 18,
    name: "Immutable X",
    symbol: "IMX",
    price: 1.38,
    priceChange1h: -0.18,
    priceChange24h: 3.12,
    priceChange7d: 11.20,
    marketCap: 2030900000,
    volume24h: 89300000,
    circulatingSupply: 1470000000,
    category: "gaming",
    sparkline: [1.22, 1.25, 1.32, 1.30, 1.35, 1.40, 1.38],
    description: "Immutable X adalah platform penskalaan Layer-2 terkemuka untuk NFT berbasis rollup ZK Stark di Ethereum, menjamin bebas gas transaksi minting dan trading instan bagi game-game Web3 kaliber AAA."
  }
];

export const GLOBAL_STATS: CryptoGlobalStats = {
  activeCryptos: 18452,
  activeExchanges: 742,
  totalMarketCap: 3180250900000,
  marketCapChange24h: 2.14,
  volume24h: 93450900000,
  volumeChange24h: 14.85,
  btcDominance: 57.2,
  ethDominance: 17.1,
  gasPriceGwei: 18,
};

// Generates smooth historical data for Recharts (e.g. 1D, 7D, 30D, 1Y)
export function generateChartData(coin: Coin, timeframe: "1D" | "7D" | "30D" | "1Y") {
  const dataPointsCount = timeframe === "1D" ? 24 : timeframe === "7D" ? 28 : timeframe === "30D" ? 30 : 52;
  const data = [];
  
  let currentBasis = coin.price;
  const volatility = coin.category === "meme" ? 0.07 : 0.025; // Memes are much more volatile
  
  const now = new Date();
  
  for (let i = dataPointsCount; i >= 0; i--) {
    let dateStr = "";
    const targetDate = new Date(now.getTime());
    
    if (timeframe === "1D") {
      targetDate.setHours(now.getHours() - i);
      dateStr = targetDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    } else if (timeframe === "7D") {
      targetDate.setHours(now.getHours() - (i * 6)); // every 6 hours
      dateStr = targetDate.toLocaleDateString("id-ID", { weekday: "short", hour: "2-digit" });
    } else if (timeframe === "30D") {
      targetDate.setDate(now.getDate() - i);
      dateStr = targetDate.toLocaleDateString("id-ID", { month: "short", day: "numeric" });
    } else {
      targetDate.setDate(now.getDate() - (i * 7)); // weekly for 1 year
      dateStr = targetDate.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    }
    
    // Simulate trend matching either negative or positive historical flow
    const changeDir = coin.priceChange24h > 0 ? 0.52 : 0.48; // slight bias matching actual 24h change
    const delta = (Math.random() - changeDir + 0.02) * currentBasis * volatility;
    currentBasis += delta;
    
    data.push({
      date: dateStr,
      USD: parseFloat(currentBasis.toFixed(coin.price < 0.01 ? 7 : 2)),
    });
  }
  
  // Make sure final element equals current price exactly
  data[data.length - 1].USD = coin.price;
  
  return data;
}

// Simulated dynamic price fluctuations to make UI live and exciting
export function getFluctuatedCoins(coins: Coin[]): Coin[] {
  return coins.map((c) => {
    // 60% chance to fluctuate very slightly
    if (Math.random() > 0.40) {
      const percentage = (Math.random() - 0.49) * 0.005; // -0.245% to +0.255%
      const newPrice = Math.max(c.price * (1 + percentage), 0.0000001);
      
      const priceChange1h = parseFloat((c.priceChange1h + percentage * 20).toFixed(2));
      const priceChange24h = parseFloat((c.priceChange24h + percentage * 10).toFixed(2));
      
      const newSparkline = [...c.sparkline.slice(1), parseFloat(newPrice.toFixed(4))];
      
      return {
        ...c,
        price: parseFloat(newPrice.toFixed(c.price < 0.01 ? 7 : 2)),
        priceChange1h,
        priceChange24h,
        marketCap: Math.round(c.marketCap * (1 + percentage)),
        volume24h: Math.round(c.volume24h * (1 + (Math.random() - 0.5) * 0.02)),
        sparkline: newSparkline,
      };
    }
    return c;
  });
}
