import 'react-native-get-random-values';

import AsyncStorage from '@react-native-async-storage/async-storage';
import aesjs from 'aes-js';
import * as SecureStore from 'expo-secure-store';

// A Supabase auth session is larger than expo-secure-store's ~2KB per-value
// limit, so the raw session can't go straight into the keychain. Instead: a
// random AES-256 key is generated per write and stored in expo-secure-store
// (the encrypted iOS keychain / Android keystore), and only the *ciphertext* of
// the session is kept in AsyncStorage. AsyncStorage never holds a readable
// token, which is what .agents/rules/security.md forbids.
//
// Adapted from the Supabase "React Native" auth guide (LargeSecureStore).

class LargeSecureStore {
  private async encrypt(key: string, value: string): Promise<string> {
    const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));

    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey));

    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private async decrypt(key: string, value: string): Promise<string | null> {
    const encryptionKeyHex = await SecureStore.getItemAsync(key);
    if (!encryptionKeyHex) {
      return null;
    }

    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(encryptionKeyHex),
      new aesjs.Counter(1),
    );
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));

    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string): Promise<string | null> {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) {
      return null;
    }

    return this.decrypt(key, encrypted);
  }

  async setItem(key: string, value: string): Promise<void> {
    const encrypted = await this.encrypt(key, value);
    await AsyncStorage.setItem(key, encrypted);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  }
}

export const largeSecureStore = new LargeSecureStore();
