import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store has no web implementation (no OS keychain to back it).
// Fall back to localStorage there — fine for local dev/testing; the real
// target platform (iOS/Android) always gets the real secure keychain.
const isWeb = Platform.OS === 'web';

export async function getItem(key) {
  if (isWeb) {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

export async function setItem(key, value) {
  if (isWeb) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }

  return SecureStore.setItemAsync(key, value);
}

export async function deleteItem(key) {
  if (isWeb) {
    globalThis.localStorage?.removeItem(key);
    return;
  }

  return SecureStore.deleteItemAsync(key);
}
