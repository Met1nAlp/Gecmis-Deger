import Constants from 'expo-constants';

export const API_CONFIG = {
  // Döviz için TCMB (Türkiye Cumhuriyet Merkez Bankası)
  TCMB_BASE_URL: 'https://www.tcmb.gov.tr/kurlar/today.xml',

  // Kripto için CoinGecko
  COINGECKO_BASE_URL: 'https://api.coingecko.com/api/v3',

  // TCMB EVDS API Key
  EVDS_API_KEY: Constants.expoConfig?.extra?.EVDS_API_KEY ?? 'gvQcDtznoE',

  // Altın için RapidAPI Harem Altin
  RAPIDAPI_GOLD_KEY: '9c36e88987mshd14ab6ea72cf415p1f51acjsn4af6e4bcabb8',
  RAPIDAPI_GOLD_URL: 'https://harem-altin-live-gold-price-data.p.rapidapi.com/harem_altin/prices',
  RAPIDAPI_GOLD_HOST: 'harem-altin-live-gold-price-data.p.rapidapi.com',

  // Hisse için Yahoo Finance
  YAHOO_FINANCE_URL: 'https://query1.finance.yahoo.com/v8/finance/chart',

  // Yedek fiyatlar (API başarısız olursa)
  FALLBACK: {
    gold: 3250,
    crypto: { bitcoin: 103000, ethereum: 3500 },
    stocks: {
      'THYAO.IS': 290, 'AKBNK.IS': 55, 'GARAN.IS': 120,
      'EREGL.IS': 45, 'BIMAS.IS': 580, 'TUPRS.IS': 180,
      'SAHOL.IS': 95, 'KCHOL.IS': 160, 'SISE.IS': 70,
      'PETKM.IS': 25, 'ISCTR.IS': 12, 'ASELS.IS': 450,
      'KOZAL.IS': 35, 'TCELL.IS': 85, 'ENKAI.IS': 40,
    }
  }
};
