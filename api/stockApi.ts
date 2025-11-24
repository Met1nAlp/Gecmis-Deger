
const getFallbackStockPriceForYear = (symbol: string, year: number): number => {
  const fallbacks: { [key: string]: { [key: number]: number } } = {
    'THYAO.IS': { 2024: 290, 2023: 220, 2022: 180, 2021: 150, 2020: 120 },
    'AKBNK.IS': { 2024: 55, 2023: 45, 2022: 38, 2021: 32, 2020: 28 },
    'GARAN.IS': { 2024: 120, 2023: 95, 2022: 80, 2021: 70, 2020: 60 },
  };
  return fallbacks[symbol]?.[year] || 50;
};

const fetchFromBigPara = async (symbol: string): Promise<{ price: number; source: string } | null> => {
  try {
    // BigPara API (AllOrigins Proxy ile)
    // Sembol formatını düzelt: THYAO.IS -> THYAO
    const cleanSymbol = symbol.replace('.IS', '');
    const targetUrl = `https://bigpara.hurriyet.com.tr/api/v1/borsa/hisseyuzeysel/${cleanSymbol}`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

    console.log(`BigPara isteği gönderiliyor: ${cleanSymbol}`);
    const response = await fetch(proxyUrl);
    if (!response.ok) return null;

    const data = await response.json();
    // BigPara response structure: { data: { last: 290.50, ... } }
    const price = data?.data?.last;

    if (price) {
      return { price, source: 'BigPara' };
    }
    return null;
  } catch (error) {
    console.error(`BigPara ${symbol} hatası:`, error);
    return null;
  }
};

export const fetchCurrentStockPrice = async (symbol: string): Promise<{ price: number; source: string }> => {
  try {
    // 5 saniyelik timeout ekle
    const fetchPromise = fetchFromBigPara(symbol);
    const timeoutPromise = new Promise<{ price: number; source: string } | null>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 5000)
    );

    const liveData = await Promise.race([fetchPromise, timeoutPromise]);

    if (liveData && liveData.price > 0) return liveData;
  } catch (error) {
    console.warn(`Stock fetch failed for ${symbol}:`, error);
  }

  // Fallback değerlerini güncel tutalım
  const fallback = getFallbackStockPriceForYear(symbol, new Date().getFullYear());
  return { price: fallback, source: 'Yedek (Tahmini)' };
};

export const fetchStockPrice = async (symbol: string, date: Date): Promise<number> => {
  const year = date.getFullYear();
  const today = new Date().getFullYear();

  if (year === today) {
    const result = await fetchCurrentStockPrice(symbol);
    return result.price;
  }

  return getFallbackStockPriceForYear(symbol, year);
};

export const POPULAR_STOCKS = [
  { id: 'THYAO.IS', name: 'Türk Hava Yolları' },
  { id: 'AKBNK.IS', name: 'Akbank' },
  { id: 'GARAN.IS', name: 'Garanti BBVA' },
  { id: 'EREGL.IS', name: 'Ereğli Demir Çelik' },
  { id: 'BIMAS.IS', name: 'BİM' },
  { id: 'TUPRS.IS', name: 'Tüpraş' },
  { id: 'SAHOL.IS', name: 'Sabancı Holding' },
  { id: 'KCHOL.IS', name: 'Koç Holding' },
  { id: 'SISE.IS', name: 'Şişe Cam' },
  { id: 'PETKM.IS', name: 'Petkim' },
  { id: 'ISCTR.IS', name: 'İş Bankası (C)' },
  { id: 'ASELS.IS', name: 'Aselsan' },
  { id: 'KOZAL.IS', name: 'Koza Altın' },
  { id: 'TCELL.IS', name: 'Turkcell' },
  { id: 'ENKAI.IS', name: 'Enka İnşaat' },
];
