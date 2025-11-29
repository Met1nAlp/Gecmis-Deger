import { API_CONFIG } from '../constants/apiConfig';
import { fetchWithCache } from '../utils/apiCache';
import { fetchCurrentCurrencyRate } from './currencyApi';

const getFallbackGoldPriceForYear = (year: number): number => {
  const fallbacks: { [key: number]: number } = {
    2024: 3000, 2023: 1800, 2022: 1000, 2021: 500, 2020: 300,
    2019: 280, 2018: 220, 2017: 150, 2016: 120, 2015: 100,
    2014: 90, 2013: 85, 2012: 95, 2011: 80, 2010: 60,
    2009: 50, 2008: 40, 2007: 30, 2006: 25, 2005: 20,
    2004: 18, 2003: 16, 2002: 14, 2001: 10, 2000: 5,
  };
  return fallbacks[year] || 3000;
};

// 1. Seçenek: CoinGecko (PAX Gold - PAXG) -> USD -> TL Çevrimi
// PAXG (1 Ons Altın) fiyatını USD olarak alıp, güncel Dolar kuru ile TL'ye çeviriyoruz.
const fetchFromCoinGeckoPAXG = async (): Promise<{ price: number; source: string } | null> => {
  try {
    console.log('Gold: CoinGecko (PAXG-USD) isteği gönderiliyor...');

    // 1. PAXG fiyatını USD olarak çek
    const url = `${API_CONFIG.COINGECKO_BASE_URL}/simple/price?ids=pax-gold&vs_currencies=usd`;
    const data = await fetchWithCache('pax-gold', url);
    // const response = await fetch(url);
    // if (!response.ok) return null;

    // const data = await response.json();
    const paxgUsd = data['pax-gold']?.usd; // 1 Ons Altın ($)

    if (paxgUsd) {
      // 2. Güncel Dolar kurunu al
      const usdRateData = await fetchCurrentCurrencyRate('USD');
      const usdTry = usdRateData.rate;

      // 3. Hesaplama: (Ons Dolar * Dolar Kuru) / 31.1035
      const oneOunceTl = paxgUsd * usdTry;
      const oneGramTl = oneOunceTl / 31.1035;

      console.log(`✅ Gold (CoinGecko PAXG): 1 Gram = ${oneGramTl.toFixed(2)} TL (Ons: $${paxgUsd}, Dolar: ${usdTry})`);
      return { price: oneGramTl, source: 'CoinGecko (PAXG)' };
    }
    return null;
  } catch (error) {
    console.error('Gold CoinGecko hatası:', error);
    return null;
  }
};

export const fetchCurrentGoldPrice = async (): Promise<{ price: number; source: string }> => {
  // 1. CoinGecko (PAXG)
  let result = await fetchFromCoinGeckoPAXG();
  if (result) return result;

  // 2. Fallback
  const fallback = getFallbackGoldPriceForYear(new Date().getFullYear());
  return { price: fallback, source: 'Yedek (Tahmini)' };
};

export const fetchGoldPrice = async (date: Date): Promise<number> => {
  const year = date.getFullYear();
  const today = new Date().getFullYear();

  if (year === today) {
    const result = await fetchCurrentGoldPrice();
    return result.price;
  }

  return getFallbackGoldPriceForYear(year);
};