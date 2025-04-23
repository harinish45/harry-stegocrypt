
import CryptoJS from 'crypto-js';

/**
 * Encrypts a message using AES encryption
 * @param message The message to encrypt
 * @param key The encryption key
 * @returns The encrypted message
 */
export const encryptMessage = (message: string, key: string): string => {
  if (!message || !key) return '';
  try {
    return CryptoJS.AES.encrypt(message, key).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
};

/**
 * Decrypts a message using AES encryption
 * @param encryptedMessage The encrypted message
 * @param key The encryption key
 * @returns The decrypted message
 */
export const decryptMessage = (encryptedMessage: string, key: string): string => {
  if (!encryptedMessage || !key) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt message. Check your encryption key.');
  }
};
