import { API_CONFIG } from '../constants/apiConfig';

// Yıl bazlı yedek kurlar (Sadece geçmiş veriler için)
const getFallbackRateForYear = (year: number): { usd: number; eur: number } => {
  const fallbacks: { [key: number]: { usd: number; eur: number } } = {
    2024: { usd: 34.50, eur: 37.50 },
    2023: { usd: 29.57, eur: 32.68 },
    2022: { usd: 18.72, eur: 19.95 },
    2021: { usd: 13.35, eur: 15.11 },
    2020: { usd: 7.43, eur: 9.13 },
  };
  // Güncel yıl için yedek döndürmüyoruz, API'den çekmeye zorluyoruz.
  return fallbacks[year] || { usd: 0, eur: 0 };
};

// TCMB XML'den kur çekme
const fetchFromTCMB = async (): Promise<{ usd: number; eur: number } | null> => {
  try {
    console.log('TCMB Kur isteği gönderiliyor...');
    const response = await fetch(API_CONFIG.TCMB_BASE_URL);
    if (!response.ok) return null;

    const text = await response.text();

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
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!response.ok) return null;

    const data = await response.json();
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
