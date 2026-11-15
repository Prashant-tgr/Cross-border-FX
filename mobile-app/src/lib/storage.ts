// ─────────────────────────────────────────────────────────────────
// Token Storage — expo-secure-store wrapper
// Replaces localStorage from web version
// ─────────────────────────────────────────────────────────────────
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'fx_auth_token';

export const storage = {
  getToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken: async (token: string): Promise<void> => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  deleteToken: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
