const fs = require('fs');
const files = [
  './metadata.json',
  './index.html',
  './src/utils/localization.ts',
  './server.ts',
  './src/App.tsx',
  './src/components/CoinDetailModal.tsx',
  './src/components/Navigation.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/CoinPulse PRO/g, 'CoinCIKOX');
  content = content.replace(/CoinPulse/g, 'CoinCIKOX');
  content = content.replace(/coinpulse/g, 'coincikox');
  content = content.replace(/coinPulse/g, 'coincikox');
  fs.writeFileSync(file, content);
});
console.log('done');
