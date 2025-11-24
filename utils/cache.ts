
// DOSYA YOLU: utils/cache.ts
// AsyncStorage kullanarak basit bir önbellekleme mekanizması sağlar.
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@cache_';
const DEFAULT_EXPIRY_MINUTES = 60 * 24; // 24 saat

interface CacheItem<T> {
  value: T;
  expiry: number;
}

/**
 * Veriyi belirli bir anahtarla önbelleğe kaydeder.
 * @param key Önbellek anahtarı.
 * @param value Kaydedilecek değer.
 * @param expiryInMinutes Dakika cinsinden geçerlilik süresi.
 */
export const setCache = async <T>(
  key: string,
  value: T,
  expiryInMinutes: number = DEFAULT_EXPIRY_MINUTES,
): Promise<void> => {
  const now = new Date();
  const expiry = now.getTime() + expiryInMinutes * 60 * 1000;
  const item: CacheItem<T> = { value, expiry };

  try {
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  } catch (error) {
    console.error(`Önbelleğe yazma hatası (key: ${key}):`, error);
  }
};

/**
 * Belirli bir anahtarla önbellekten veri alır.
 * Veri mevcut değilse veya süresi dolmuşsa null döndürür.
 * @param key Önbellek anahtarı.
 * @returns Önbellekteki değer veya null.
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (jsonValue === null) {
      return null;
    }

    const item: CacheItem<T> = JSON.parse(jsonValue);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      // Önbellek süresi dolmuş, veriyi sil
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return item.value;
  } catch (error) {
    console.error(`Önbellekten okuma hatası (key: ${key}):`, error);
    return null;
  }
};
