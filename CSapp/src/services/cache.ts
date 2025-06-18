import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_EXPIRATION = 15 * 60 * 1000; // 5 minutos

interface CacheData {
  data: any;
  timestamp: number;
}

export const cacheService = {
  async set(key: string, data: any): Promise<void> {
    const cacheData: CacheData = {
      data,
      timestamp: Date.now()
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheData));
  },

  async get(key: string): Promise<any | null> {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp }: CacheData = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > CACHE_EXPIRATION;

    if (isExpired) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return data;
  },

  async clear(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('cache_'));
    await AsyncStorage.multiRemove(cacheKeys);
  }
}; 