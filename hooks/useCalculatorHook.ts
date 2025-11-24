import { useCallback, useState } from 'react';
import { fetchCurrentCryptoPrice, POPULAR_CRYPTOS } from '../api/cryptoApi';
import { fetchCurrentCurrencyRate } from '../api/currencyApi';
import { fetchCurrentGoldPrice } from '../api/goldApi';
import { fetchCurrentStockPrice, POPULAR_STOCKS } from '../api/stockApi';
import historicalDataRaw from '../assets/historicalData.json';
import { POPULAR_CARS } from '../data/carData';
import { inflationData } from '../data/inflationData';
import { minWageData } from '../data/minimumWage';
import { AssetId, CalculationResult } from '../types';

// Type definition for historical data
type HistoricalData = {
  [key: string]: { [date: string]: number };
};

const historicalData: HistoricalData = historicalDataRaw as HistoricalData;

// Crypto key mapping
const CRYPTO_KEY_MAP: Record<string, string> = {
  'bitcoin': 'bitcoin',
  'ethereum': 'ethereum',
  'solana': 'solana',
  'avalanche-2': 'avalanche-2',
  'matic-network': 'matic-network',
  'uniswap': 'uniswap',
  'ripple': 'ripple',
  'litecoin': 'litecoin',
  'chainlink': 'chainlink',
  'dogecoin': 'dogecoin',
  'polkadot': 'polkadot',
  'cardano': 'cardano',
  'binancecoin': 'binancecoin',
  'stellar': 'stellar',
};

export const useCalculatorHook = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getHistoricalPrice = (assetId: string, date: Date): number | null => {
    // Format date as YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0];
    console.log(`[Historical] Looking for ${assetId} on ${dateStr}`);

    // Direct match
    if (historicalData[assetId]?.[dateStr]) {
      console.log(`[Historical] Found direct match: ${historicalData[assetId][dateStr]}`);
      return historicalData[assetId][dateStr];
    }

    // If exact date not found (weekend/holiday), look for closest previous date
    // Check up to 7 days back
    const d = new Date(date);
    for (let i = 0; i < 7; i++) {
      d.setDate(d.getDate() - 1);
      const prevDateStr = d.toISOString().split('T')[0];
      if (historicalData[assetId]?.[prevDateStr]) {
        console.log(`[Historical] Found fallback match on ${prevDateStr}: ${historicalData[assetId][prevDateStr]}`);
        return historicalData[assetId][prevDateStr];
      }
    }

    console.warn(`[Historical] No data found for ${assetId} around ${dateStr}`);
    return null;
  };

  const getDataRange = (assetId: string) => {
    const data = historicalData[assetId];
    if (!data) return null;
    const dates = Object.keys(data).sort();
    return { min: dates[0], max: dates[dates.length - 1] };
  };

  const getLatestHistoricalPrice = (assetId: string): number | null => {
    const data = historicalData[assetId];
    if (!data) return null;
    const dates = Object.keys(data).sort();
    if (dates.length === 0) return null;
    const latestDate = dates[dates.length - 1];
    console.log(`[Latest Historical] ${assetId} on ${latestDate}: ${data[latestDate]}`);
    return data[latestDate];
  };

  const calculate = useCallback(async (
    initialAmount: number,
    date: Date,
    assetId: AssetId,
    stockSymbol?: string,
    cryptoId?: string,
    carId?: string,
    isFromPortfolio?: boolean
  ) => {
    const amount = initialAmount;
    setLoading(true);
    setError(null);
    setResult(null);

    console.log(`[Calculate] Starting calculation for ${assetId} on ${date.toISOString()}`);

    try {
      let resultData: CalculationResult;
      const pastDate = new Date(date);
      const pastYear = pastDate.getFullYear();
      const currentYear = new Date().getFullYear();

      // Common fetch for USD rate (needed for crypto conversion)
      const getUSDRates = async () => {
        const pastUSD = getHistoricalPrice('USD', pastDate);
        const currentUSDData = await fetchCurrentCurrencyRate('USD');
        console.log(`[USD Rates] Past: ${pastUSD}, Current: ${currentUSDData.rate}`);
        return { pastUSD, currentUSD: currentUSDData.rate };
      };

      switch (assetId) {
        case 'dolar':
          const usdRates = await getUSDRates();
          if (!usdRates.pastUSD) throw new Error('Seçilen tarih için Dolar verisi bulunamadı.');

          const usdBought = amount / usdRates.pastUSD;
          const usdValue = usdBought * usdRates.currentUSD;
          resultData = {
            id: 'dolar',
            label: 'Dolar',
            value: usdValue,
            amount: usdBought,
            unit: '$',
            description: `O zaman ${amount.toFixed(0)} TL (${usdBought.toFixed(2)}$) alsaydınız, bugün ${usdValue.toFixed(0)} TL olurdu.`,
            pastPrice: usdRates.pastUSD,
            currentPrice: usdRates.currentUSD,
            initialAmount: amount,
            currentValue: usdValue,
            profit: usdValue - amount,
            percentageChange: ((usdValue - amount) / amount) * 100,
            initialRate: usdRates.pastUSD,
            currentRate: usdRates.currentUSD,
          };
          break;

        case 'euro':
          const pastEUR = getHistoricalPrice('EUR', pastDate);
          const currentEURData = await fetchCurrentCurrencyRate('EUR');
          const currentEUR = currentEURData.rate;

          if (!pastEUR) throw new Error('Seçilen tarih için Euro verisi bulunamadı.');

          const eurBought = amount / pastEUR;
          const eurValue = eurBought * currentEUR;
          resultData = {
            id: 'euro',
            label: 'Euro',
            value: eurValue,
            amount: eurBought,
            unit: '€',
            description: `O zaman ${amount.toFixed(0)} TL (${eurBought.toFixed(2)}€) alsaydınız, bugün ${eurValue.toFixed(0)} TL olurdu.`,
            pastPrice: pastEUR,
            currentPrice: currentEUR,
            initialAmount: amount,
            currentValue: eurValue,
            profit: eurValue - amount,
            percentageChange: ((eurValue - amount) / amount) * 100,
            initialRate: pastEUR,
            currentRate: currentEUR,
          };
          break;

        case 'altin':
          const pastGold = getHistoricalPrice('altin', pastDate);
          const currentGoldData = await fetchCurrentGoldPrice();
          const currentGold = currentGoldData.price;

          if (!pastGold) throw new Error('Seçilen tarih için Altın verisi bulunamadı.');

          const goldBought = amount / pastGold;
          const goldValue = goldBought * currentGold;
          resultData = {
            id: 'altin',
            label: 'Gram Altın',
            value: goldValue,
            amount: goldBought,
            unit: 'gr',
            description: `O zaman ${amount.toFixed(0)} TL (${goldBought.toFixed(2)} gr) alsaydınız, bugün ${goldValue.toFixed(0)} TL olurdu.`,
            pastPrice: pastGold,
            currentPrice: currentGold,
            initialAmount: amount,
            currentValue: goldValue,
            profit: goldValue - amount,
            percentageChange: ((goldValue - amount) / amount) * 100,
            initialRate: pastGold,
            currentRate: currentGold,
          };
          break;

        case 'stock':
          if (stockSymbol) {
            // Ensure symbol matches historical data key (append .IS if needed)
            const historicalKey = stockSymbol.endsWith('.IS') ? stockSymbol : `${stockSymbol}.IS`;
            const pastStock = getHistoricalPrice(historicalKey, pastDate);

            if (!pastStock) {
              const range = getDataRange(historicalKey);
              if (range) {
                throw new Error(`${stockSymbol} verileri ${range.min} tarihinde başlamaktadır. Lütfen bu tarihten sonraki bir seçim yapın.`);
              }
              throw new Error(`${stockSymbol} için seçilen tarihte veri bulunamadı.`);
            }

            // fetchCurrentStockPrice now handles timeouts internally
            const currentStockData = await fetchCurrentStockPrice(stockSymbol);
            let currentStock = currentStockData.price;

            // If source is fallback, use latest historical data instead
            if (currentStockData.source && currentStockData.source.includes('Yedek')) {
              const latestHistorical = getLatestHistoricalPrice(historicalKey);
              if (latestHistorical) {
                currentStock = latestHistorical;
                console.log(`[Stock] Using latest historical price for ${stockSymbol}: ${currentStock}`);
              }
            }

            const sharesBought = amount / pastStock;
            const stockValue = sharesBought * currentStock;
            const stockName = POPULAR_STOCKS.find(s => s.id === stockSymbol)?.name || stockSymbol;
            resultData = {
              id: 'stock',
              label: stockName,
              value: stockValue,
              amount: sharesBought,
              unit: 'hisse',
              description: `O zaman ${amount.toFixed(0)} TL (${sharesBought.toFixed(2)} hisse) alsaydınız, bugün ${stockValue.toFixed(0)} TL olurdu.`,
              pastPrice: pastStock,
              currentPrice: currentStock,
              initialAmount: amount,
              currentValue: stockValue,
              profit: stockValue - amount,
              percentageChange: ((stockValue - amount) / amount) * 100,
              initialRate: pastStock,
              currentRate: currentStock,
            };
          } else {
            throw new Error('Hisse senedi seçilmedi.');
          }
          break;

        case 'btc':
          if (cryptoId) {
            const mappedKey = CRYPTO_KEY_MAP[cryptoId] || cryptoId;
            const pastCryptoRaw = getHistoricalPrice(mappedKey, pastDate);
            const cryptoName = POPULAR_CRYPTOS.find(c => c.id === cryptoId)?.name || cryptoId;

            if (!pastCryptoRaw) {
              const range = getDataRange(mappedKey);
              if (range) {
                throw new Error(`${cryptoName} verileri ${range.min} tarihinde başlamaktadır. Lütfen bu tarihten sonraki bir seçim yapın.`);
              }
              throw new Error(`${cryptoName} için seçilen tarihte veri bulunamadı.`);
            }

            const currentCryptoData = await fetchCurrentCryptoPrice(cryptoId);
            let currentCryptoUSD = currentCryptoData.price; // API returns USD

            // If source is fallback, use latest historical data instead
            if (currentCryptoData.source && currentCryptoData.source.includes('Yedek')) {
              const latestHistorical = getLatestHistoricalPrice(mappedKey);
              if (latestHistorical) {
                currentCryptoUSD = latestHistorical;
                console.log(`[Crypto] Using latest historical price for ${cryptoId}: ${currentCryptoUSD}`);
              }
            }

            // Currency Conversion Logic
            // Polygon (matic-network) is in TRY (according to user), others are in USD
            const isPolygon = mappedKey === 'matic-network';

            let pastCryptoTRY = pastCryptoRaw;
            let currentCryptoTRY = currentCryptoUSD;

            if (!isPolygon) {
              // Convert USD to TRY
              const { pastUSD, currentUSD } = await getUSDRates();
              if (!pastUSD) {
                console.warn('Dolar kuru bulunamadı, kripto hesaplaması için 1.0 varsayılıyor (HATA)');
                throw new Error('Dolar kuru bulunamadığı için kripto hesaplanamadı.');
              }

              pastCryptoTRY = pastCryptoRaw * pastUSD;
              currentCryptoTRY = currentCryptoUSD * currentUSD;
            }

            const cryptoBought = amount / pastCryptoTRY;
            const cryptoValue = cryptoBought * currentCryptoTRY;
            const cryptoSymbol = POPULAR_CRYPTOS.find(c => c.id === cryptoId)?.symbol || 'CRYPTO';

            resultData = {
              id: 'btc',
              label: cryptoName,
              value: cryptoValue,
              amount: cryptoBought,
              unit: cryptoSymbol,
              description: `O zaman ${amount.toFixed(0)} TL ile ${cryptoBought.toFixed(4)} ${cryptoSymbol} alsaydınız, bugün ${cryptoValue.toFixed(0)} TL olurdu.`,
              pastPrice: pastCryptoTRY,
              currentPrice: currentCryptoTRY,
              initialAmount: amount,
              currentValue: cryptoValue,
              profit: cryptoValue - amount,
              percentageChange: ((cryptoValue - amount) / amount) * 100,
              initialRate: pastCryptoTRY,
              currentRate: currentCryptoTRY,
            };
          } else {
            throw new Error('Kripto para seçilmedi.');
          }
          break;

        case 'minWage':
          const pastWage = minWageData[pastYear];
          const currentWage = minWageData[currentYear];
          if (!pastWage || !currentWage) {
            throw new Error('Asgari ücret verisi bulunamadı.');
          } else {
            const wageValue = (amount / pastWage) * currentWage;
            resultData = {
              id: 'minWage',
              label: 'Asgari Ücret',
              value: wageValue,
              description: `O zaman ${amount.toFixed(0)} TL(${(amount / pastWage).toFixed(1)} asgari ücret), bugün ${wageValue.toFixed(0)} TL olurdu.`,
              pastPrice: pastWage,
              currentPrice: currentWage,
              initialAmount: amount,
              currentValue: wageValue,
              profit: wageValue - amount,
              percentageChange: ((wageValue - amount) / amount) * 100,
              initialRate: pastWage,
              currentRate: currentWage,
            };
          }
          break;

        case 'inflation':
          const pastRate = inflationData[pastYear];
          const currentRate = inflationData[currentYear];
          if (!pastRate || !currentRate) {
            throw new Error('Enflasyon verisi bulunamadı.');
          } else {
            const years = currentYear - pastYear;
            const avgInflation = currentRate / 100;
            const inflationValue = amount * Math.pow(1 + avgInflation, years);
            resultData = {
              id: 'inflation',
              label: 'Enflasyon',
              value: inflationValue,
              description: `O zamanki ${amount.toFixed(0)} TL'nin bugünkü tahmini alım gücü ${inflationValue.toFixed(0)} TL olurdu.`,
              initialAmount: amount,
              currentValue: inflationValue,
              profit: inflationValue - amount,
              percentageChange: ((inflationValue - amount) / amount) * 100,
              initialRate: 1,
              currentRate: Math.pow(1 + avgInflation, years),
            };
          }
          break;

        case 'car':
          if (carId) {
            const car = POPULAR_CARS.find(c => c.id === carId);
            if (!car) {
              throw new Error('Araba bulunamadı.');
            }
            const pastPrice = car.prices[pastYear];
            const currentPrice = car.prices[currentYear];
            if (!pastPrice || !currentPrice) {
              throw new Error('Fiyat verisi bulunamadı.');
            }
            const carValue = (amount / pastPrice) * currentPrice;
            resultData = {
              id: 'car',
              label: car.name,
              value: carValue,
              description: `${pastYear} yılındaki ${amount.toFixed(0)} TL ile ${car.name} (o günkü fiyatı ${pastPrice} TL) alsaydınız, bugün ${carValue.toFixed(0)} TL olurdu.`,
              pastPrice,
              currentPrice,
              initialAmount: amount,
              currentValue: carValue,
              profit: carValue - amount,
              percentageChange: ((carValue - amount) / amount) * 100,
              initialRate: pastPrice,
              currentRate: currentPrice,
            };
          } else {
            throw new Error('Araba seçilmedi.');
          }
          break;

        default:
          throw new Error('Bilinmeyen varlık türü.');
      }

      setResult(resultData);
    } catch (error: any) {
      console.error('Hesaplama hatası:', error);
      setError(error.message || 'Hesaplama sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, result, error, calculate };
};
