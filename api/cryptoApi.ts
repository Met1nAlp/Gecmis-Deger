import { API_CONFIG } from '../constants/apiConfig';

export const POPULAR_CRYPTOS = [
  { id: 'bitcoin', name: 'Bitcoin (BTC)', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum (ETH)', symbol: 'ETH' },
  { id: 'binancecoin', name: 'Binance Coin (BNB)', symbol: 'BNB' },
  { id: 'ripple', name: 'Ripple (XRP)', symbol: 'XRP' },
  { id: 'cardano', name: 'Cardano (ADA)', symbol: 'ADA' },
  { id: 'solana', name: 'Solana (SOL)', symbol: 'SOL' },
  { id: 'polkadot', name: 'Polkadot (DOT)', symbol: 'DOT' },
  { id: 'dogecoin', name: 'Dogecoin (DOGE)', symbol: 'DOGE' },
  { id: 'avalanche-2', name: 'Avalanche (AVAX)', symbol: 'AVAX' },
  { id: 'chainlink', name: 'Chainlink (LINK)', symbol: 'LINK' },
  { id: 'litecoin', name: 'Litecoin (LTC)', symbol: 'LTC' },
  { id: 'matic-network', name: 'Polygon (MATIC)', symbol: 'MATIC' },
  { id: 'uniswap', name: 'Uniswap (UNI)', symbol: 'UNI' },
  { id: 'stellar', name: 'Stellar (XLM)', symbol: 'XLM' },
];

const getHistoricalCryptoPrice = (coinId: string, year: number): number => {
  const priceData: { [key: string]: { [key: number]: number } } = {
    bitcoin: { 2024: 65000, 2023: 42000, 2022: 47000, 2021: 29000, 2020: 7200 },
    ethereum: { 2024: 3500, 2023: 2300, 2022: 3800, 2021: 730, 2020: 130 },
  };
  return priceData[coinId]?.[year] || 100;
};

export const fetchCurrentCryptoPrice = async (coinId: string = 'bitcoin'): Promise<{ price: number; source: string }> => {
  try {
    const url = `${API_CONFIG.COINGECKO_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`CoinGecko hata: ${response.status}`);
    const data = await response.json();
    if (data[coinId]?.usd) {
      console.log(`✓ CoinGecko ${coinId}:`, data[coinId].usd);
      return { price: data[coinId].usd, source: 'CoinGecko' };
    }
    throw new Error('Fiyat bulunamadı');
  } catch (error) {
    console.error(`CoinGecko ${coinId} hatası:`, error);
    const fallback = API_CONFIG.FALLBACK.crypto[coinId] || 100;
    console.warn(`${coinId} fallback:`, fallback);
    return { price: fallback, source: 'Yedek (Tahmini)' };
  }
};

export const fetchPastCryptoPrice = async (coinId: string, date: Date): Promise<number> => {
  const year = date.getFullYear();
  const today = new Date().getFullYear();

  if (year === today) {
    const result = await fetchCurrentCryptoPrice(coinId);
    return result.price;
  }

  const price = getHistoricalCryptoPrice(coinId, year);
  console.log(`${coinId} geçmiş fiyat (${year}):`, price);
  return price;
};

export const fetchCurrentBitcoinPrice = async () => {
  const result = await fetchCurrentCryptoPrice('bitcoin');
  return result.price;
};
export const fetchPastBitcoinPrice = (date: Date) => fetchPastCryptoPrice('bitcoin', date);
