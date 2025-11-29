import { API_CONFIG } from '../constants/apiConfig';
import { fetchWithCache } from '../utils/apiCache';

// Yıl bazlı yedek kurlar (Sadece geçmiş veriler için)
const getFallbackRateForYear = (year: number): { usd: number; eur: number } => {
  const fallbacks: { [key: number]: { usd: number; eur: number } } = {
    2024: { usd: 34.50, eur: 37.50 },
    2023: { usd: 29.57, eur: 32.68 },
    2022: { usd: 18.72, eur: 19.95 },
    2021: { usd: 13.35, eur: 15.11 },
    2020: { usd: 7.43, eur: 9.13 },
    2019: { usd: 5.95, eur: 6.67 },
    2018: { usd: 5.29, eur: 6.05 },
    2017: { usd: 3.81, eur: 4.54 },
    2016: { usd: 3.51, eur: 3.71 },
    2015: { usd: 2.91, eur: 3.20 },
    2014: { usd: 2.32, eur: 2.82 },
    2013: { usd: 2.13, eur: 2.93 },
    2012: { usd: 1.78, eur: 2.35 },
    2011: { usd: 1.88, eur: 2.44 },
    2010: { usd: 1.54, eur: 2.04 },
    2009: { usd: 1.50, eur: 2.16 },
    2008: { usd: 1.51, eur: 2.14 },
    2007: { usd: 1.16, eur: 1.71 },
    2006: { usd: 1.41, eur: 1.86 },
    2005: { usd: 1.34, eur: 1.58 },
    2004: { usd: 1.34, eur: 1.82 },
    2003: { usd: 1.39, eur: 1.75 },
    2002: { usd: 1.63, eur: 1.66 },
    2001: { usd: 1.43, eur: 1.27 },
    2000: { usd: 0.67, eur: 0.61 },
  };
  // Güncel yıl için yedek döndürmüyoruz, API'den çekmeye zorluyoruz.
  return fallbacks[year] || { usd: 0, eur: 0 };
};

// TCMB XML'den kur çekme
const fetchFromTCMB = async (): Promise<{ usd: number; eur: number } | null> => {
  try {
    console.log('TCMB Kur isteği gönderiliyor...');
    const text = await fetchWithCache('tcmb', API_CONFIG.TCMB_BASE_URL, undefined, true);
    // const response = await fetch(API_CONFIG.TCMB_BASE_URL);
    // if (!response.ok) return null;

    // const text = await response.text();

    // Daha esnek Regex kullanımı (Boşluklara ve satır sonlarına duyarlı değil)
    // USD ForexSelling
    const usdMatch = text.match(/Currency Code="USD".*?ForexSelling>([\d.]+)<\/ForexSelling>/s) ||
      text.match(/Kod="USD".*?ForexSelling>([\d.]+)<\/ForexSelling>/s);

    // EUR ForexSelling
    const eurMatch = text.match(/Currency Code="EUR".*?ForexSelling>([\d.]+)<\/ForexSelling>/s) ||
      text.match(/Kod="EUR".*?ForexSelling>([\d.]+)<\/ForexSelling>/s);

    if (usdMatch && eurMatch) {
      const usd = parseFloat(usdMatch[1]);
      const eur = parseFloat(eurMatch[1]);

      if (!isNaN(usd) && !isNaN(eur)) {
        console.log('✅ TCMB Verisi Alındı - USD:', usd, 'EUR:', eur);
        return { usd, eur };
      }
    }

    return null;
  } catch (error) {
    console.error('TCMB hatası:', error);
    return null;
  }
};

// ExchangeRate-API (JSON)
const fetchFromExchangeRateAPI = async (): Promise<{ usd: number; eur: number } | null> => {
  try {
    console.log('ExchangeRate-API isteği gönderiliyor...');
    const data = await fetchWithCache('exchangerate', 'https://api.exchangerate-api.com/v4/latest/USD');
    // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    // if (!response.ok) return null;

    // const data = await response.json();
    const usdToTry = data.rates.TRY;
    const usdToEur = data.rates.EUR;

    // 1 USD = X TRY
    // 1 EUR = (1/usdToEur) * usdToTry
    const eurToTry = usdToTry / usdToEur;

    if (usdToTry && eurToTry) {
      console.log('✅ ExchangeRate-API Verisi Alındı - USD:', usdToTry, 'EUR:', eurToTry);
      return { usd: usdToTry, eur: eurToTry };
    }
    return null;
  } catch (error) {
    console.error('ExchangeRate-API hatası:', error);
    return null;
  }
};

const fetchAllCurrentRates = async (): Promise<{ usd: number; eur: number; source: string } | null> => {
  // 1. Öncelik: TCMB (Resmi)
  let rates = await fetchFromTCMB();
  if (rates) return { ...rates, source: 'TCMB (Resmi)' };

  // 2. Öncelik: ExchangeRate-API (Yedek - JSON)
  rates = await fetchFromExchangeRateAPI();
  if (rates) return { ...rates, source: 'Global API' };

  return null;
};

export const fetchCurrencyRate = async (date: Date, currency: 'USD' | 'EUR'): Promise<number> => {
  const year = date.getFullYear();
  const todayYear = new Date().getFullYear();

  // Eğer istenen tarih bugün veya bu yıl ise canlı veri çekmeyi dene
  if (year === todayYear) {
    const liveRates = await fetchAllCurrentRates();
    if (liveRates) {
      const rate = currency === 'USD' ? liveRates.usd : liveRates.eur;
      return rate;
    }
  }

  // Geçmiş yıllar için veya canlı veri çekilemezse yedeklere bak
  const fallback = getFallbackRateForYear(year);
  const fallbackRate = currency === 'USD' ? fallback.usd : fallback.eur;

  if (fallbackRate === 0 && year === todayYear) {
    // Son çare: Güncel yaklaşık değerler (2025 Tahmini/Gerçekleşen)
    return currency === 'USD' ? 42.50 : 48.90;
  }

  return fallbackRate;
};

export const fetchCurrentCurrencyRate = async (currency: 'USD' | 'EUR'): Promise<{ rate: number; source: string }> => {
  const liveRates = await fetchAllCurrentRates();
  if (liveRates) {
    return {
      rate: currency === 'USD' ? liveRates.usd : liveRates.eur,
      source: liveRates.source
    };
  }

  // Hata durumunda son bilinen yaklaşık değerler (Fallback)
  console.warn('⚠️ Canlı kur çekilemedi, varsayılan değerler kullanılıyor.');
  return {
    rate: currency === 'USD' ? 42.50 : 48.90,
    source: 'Yedek (Tahmini)'
  };
};
