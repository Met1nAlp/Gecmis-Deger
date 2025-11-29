import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const CACHE_PREFIX = '@api_cache_';

interface CacheItem {
    timestamp: number;
    data: any;
}

export const fetchWithCache = async (key: string, url: string, options?: RequestInit, isText: boolean = false): Promise<any> => {
    const cacheKey = `${CACHE_PREFIX}${key}`;

    try {
        const netInfo = await NetInfo.fetch();

        if (netInfo.isConnected) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
                const data = isText ? await response.text() : await response.json();

                // Save to cache
                const cacheItem: CacheItem = {
                    timestamp: Date.now(),
                    data: data
                };
                await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));

                return data;
            } catch (fetchError) {
                console.warn(`Fetch failed for ${url}, trying cache...`, fetchError);
                // Fallback to cache if fetch fails even if connected (e.g. server error)
                return getFromCache(cacheKey);
            }
        } else {
            console.log('Offline mode, using cache for:', key);
            return getFromCache(cacheKey);
        }
    } catch (error) {
        console.error('Cache error:', error);
        throw error;
    }
};

const getFromCache = async (cacheKey: string) => {
    try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
            const { data } = JSON.parse(cached) as CacheItem;
            return data;
        }
        throw new Error('No cached data available');
    } catch (error) {
        throw error;
    }
};
