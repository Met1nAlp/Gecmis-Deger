import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { fetchCurrentCryptoPrice, fetchPastCryptoPrice } from '../api/cryptoApi';
import { fetchCurrencyRate, fetchCurrentCurrencyRate } from '../api/currencyApi';
import { fetchCurrentGoldPrice, fetchGoldPrice } from '../api/goldApi';
import { fetchCurrentStockPrice, fetchStockPrice } from '../api/stockApi';
import { PortfolioItem } from '../types';

const PORTFOLIO_KEY = '@portfolio_items';

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const data = await AsyncStorage.getItem(PORTFOLIO_KEY);
      if (data) {
        const items: PortfolioItem[] = JSON.parse(data);
        setPortfolio(items);
        // Arka planda fiyatları güncelle
        refreshPrices(items);
      }
    } catch (error) {
      console.error('Portföy yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPrices = async (items: PortfolioItem[]) => {
    const updatedItems = await Promise.all(items.map(async (item) => {
      try {
        let currentValue = item.currentValue;
        const date = new Date(item.date);

        if (item.assetId === 'custom') {
          return item; // Custom varlıklar manuel güncellenir
        }

        let initialPrice = 0;
        let currentPrice = 0;

        if (item.assetId === 'btc' && item.cryptoId) {
          initialPrice = await fetchPastCryptoPrice(item.cryptoId, date);
          const currentData = await fetchCurrentCryptoPrice(item.cryptoId);
          currentPrice = currentData.price;
        } else if (item.assetId === 'stock' && item.stockSymbol) {
          initialPrice = await fetchStockPrice(item.stockSymbol, date);
          const currentData = await fetchCurrentStockPrice(item.stockSymbol);
          currentPrice = currentData.price;
        } else if (item.assetId === 'dolar') {
          initialPrice = await fetchCurrencyRate(date, 'USD');
          const currentData = await fetchCurrentCurrencyRate('USD');
          currentPrice = currentData.rate;
        } else if (item.assetId === 'euro') {
          initialPrice = await fetchCurrencyRate(date, 'EUR');
          const currentData = await fetchCurrentCurrencyRate('EUR');
          currentPrice = currentData.rate;
        } else if (item.assetId === 'altin' || item.assetId === 'ons_altin') {
          initialPrice = await fetchGoldPrice(date);
          const currentData = await fetchCurrentGoldPrice();
          currentPrice = currentData.price;
        }

        if (initialPrice > 0 && currentPrice > 0) {
          const quantity = item.initialAmount / initialPrice;
          currentValue = quantity * currentPrice;
        }

        return { ...item, currentValue };
      } catch (error) {
        console.warn(`Fiyat güncellenemedi (${item.assetId}):`, error);
        return item;
      }
    }));

    setPortfolio(updatedItems);
    await AsyncStorage.setItem(PORTFOLIO_KEY, JSON.stringify(updatedItems));
  };

  const addToPortfolio = async (item: Omit<PortfolioItem, 'id'>) => {
    try {
      const newItem: PortfolioItem = {
        ...item,
        id: Date.now().toString(),
      };
      // @ts-ignore
      const newItems = [...portfolio, newItem];
      await AsyncStorage.setItem(PORTFOLIO_KEY, JSON.stringify(newItems));
      setPortfolio(newItems);
      // Yeni eklenen öğe için de fiyatları güncelle
      refreshPrices(newItems);
    } catch (error) {
      console.error('Portföy öğesi eklenemedi:', error);
      throw error;
    }
  };

  const removeFromPortfolio = async (id: string) => {
    try {
      const newItems = portfolio.filter(item => item.id !== id);
      await AsyncStorage.setItem(PORTFOLIO_KEY, JSON.stringify(newItems));
      setPortfolio(newItems);
    } catch (error) {
      console.error('Portföy öğesi silinemedi:', error);
      throw error;
    }
  };

  return { portfolio, loading, loadPortfolio, addToPortfolio, removeFromPortfolio };
};

