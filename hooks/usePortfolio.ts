import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
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
        setPortfolio(JSON.parse(data));
      }
    } catch (error) {
      console.error('Portföy yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
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

