
import { EncryptionService } from './encryptionService';
import { FacebookCredentials } from '../types';

const STORAGE_KEY = 'ef_vault_encrypted';

export class VaultService {
  static async saveCredentials(creds: FacebookCredentials, masterPassword: string): Promise<void> {
    const data = JSON.stringify(creds);
    const encrypted = await EncryptionService.encrypt(data, masterPassword);
    localStorage.setItem(STORAGE_KEY, encrypted);
  }

  static async loadCredentials(masterPassword: string): Promise<FacebookCredentials | null> {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;

    try {
      const decrypted = await EncryptionService.decrypt(encrypted, masterPassword);
      return JSON.parse(decrypted);
    } catch (e) {
      throw e;
    }
  }

  static clearVault(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  static hasVault(): boolean {
    return !!localStorage.getItem(STORAGE_KEY);
  }
}
