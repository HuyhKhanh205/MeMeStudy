import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'memestudy.token';
const isWeb = Platform.OS === 'web';

/** Lưu JWT: SecureStore trên mobile, localStorage trên web (SecureStore không hỗ trợ web). */
export const tokenStorage = {
  async get(): Promise<string | null> {
    if (isWeb) return globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async set(token: string): Promise<void> {
    if (isWeb) {
      globalThis.localStorage?.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clear(): Promise<void> {
    if (isWeb) {
      globalThis.localStorage?.removeItem(TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
