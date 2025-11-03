import CryptoJS from 'crypto-js';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import forge from 'node-forge';

export type EncryptionAlgorithm = 'AES' | 'RSA' | 'ChaCha20';

export interface EncryptionMetadata {
  algorithm: EncryptionAlgorithm;
  timestamp: string;
  messageHash: string;
  keyStrength?: string;
}

/**
 * Generates SHA-256 hash of a message
 */
export const generateSHA256Hash = (message: string): string => {
  return CryptoJS.SHA256(message).toString();
};

/**
 * Derives a key from password for symmetric encryption
 */
const deriveKey = (password: string, length: number = 32): Uint8Array => {
  const hash = CryptoJS.SHA256(password);
  const hashArray = new Uint8Array(length);
  const hashHex = hash.toString();
  
  for (let i = 0; i < length; i++) {
    hashArray[i] = parseInt(hashHex.substr(i * 2, 2), 16);
  }
  
  return hashArray;
};

/**
 * Encrypts a message using AES
 */
const encryptAES = (message: string, key: string): string => {
  return CryptoJS.AES.encrypt(message, key).toString();
};

/**
 * Decrypts a message using AES
 */
const decryptAES = (encryptedMessage: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Encrypts a message using ChaCha20
 */
const encryptChaCha20 = (message: string, password: string): string => {
  const key = deriveKey(password, 32);
  const nonce = nacl.randomBytes(24);
  const messageUint8 = naclUtil.decodeUTF8(message);
  
  const encrypted = nacl.secretbox(messageUint8, nonce, key);
  
  // Combine nonce + encrypted message
  const fullMessage = new Uint8Array(nonce.length + encrypted.length);
  fullMessage.set(nonce);
  fullMessage.set(encrypted, nonce.length);
  
  return naclUtil.encodeBase64(fullMessage);
};

/**
 * Decrypts a message using ChaCha20
 */
const decryptChaCha20 = (encryptedMessage: string, password: string): string => {
  const key = deriveKey(password, 32);
  const fullMessage = naclUtil.decodeBase64(encryptedMessage);
  
  const nonce = fullMessage.slice(0, 24);
  const message = fullMessage.slice(24);
  
  const decrypted = nacl.secretbox.open(message, nonce, key);
  
  if (!decrypted) {
    throw new Error('Decryption failed. Invalid key or corrupted data.');
  }
  
  return naclUtil.encodeUTF8(decrypted);
};

/**
 * Generates RSA key pair
 */
export const generateRSAKeyPair = (): { publicKey: string; privateKey: string } => {
  const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
  const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
  const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
  
  return { publicKey, privateKey };
};

/**
 * Encrypts a message using RSA
 */
const encryptRSA = (message: string, publicKeyPem: string): string => {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encrypted = publicKey.encrypt(message, 'RSA-OAEP', {
    md: forge.md.sha256.create()
  });
  return forge.util.encode64(encrypted);
};

/**
 * Decrypts a message using RSA
 */
const decryptRSA = (encryptedMessage: string, privateKeyPem: string): string => {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const encrypted = forge.util.decode64(encryptedMessage);
  const decrypted = privateKey.decrypt(encrypted, 'RSA-OAEP', {
    md: forge.md.sha256.create()
  });
  return decrypted;
};

/**
 * Encrypts a message using the specified algorithm
 */
export const encryptMessage = (
  message: string,
  key: string,
  algorithm: EncryptionAlgorithm = 'AES'
): { encrypted: string; metadata: EncryptionMetadata } => {
  if (!message || !key) {
    throw new Error('Message and key are required');
  }

  let encrypted: string;
  const messageHash = generateSHA256Hash(message);

  try {
    switch (algorithm) {
      case 'AES':
        encrypted = encryptAES(message, key);
        break;
      case 'ChaCha20':
        encrypted = encryptChaCha20(message, key);
        break;
      case 'RSA':
        encrypted = encryptRSA(message, key);
        break;
      default:
        throw new Error('Unsupported encryption algorithm');
    }

    const metadata: EncryptionMetadata = {
      algorithm,
      timestamp: new Date().toISOString(),
      messageHash,
      keyStrength: algorithm === 'RSA' ? '2048-bit' : `${key.length * 8}-bit`
    };

    return { encrypted, metadata };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error(`Failed to encrypt message using ${algorithm}`);
  }
};

/**
 * Decrypts a message using the specified algorithm
 */
export const decryptMessage = (
  encryptedMessage: string,
  key: string,
  algorithm: EncryptionAlgorithm = 'AES'
): string => {
  if (!encryptedMessage || !key) {
    throw new Error('Encrypted message and key are required');
  }

  try {
    switch (algorithm) {
      case 'AES':
        return decryptAES(encryptedMessage, key);
      case 'ChaCha20':
        return decryptChaCha20(encryptedMessage, key);
      case 'RSA':
        return decryptRSA(encryptedMessage, key);
      default:
        throw new Error('Unsupported decryption algorithm');
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error(`Failed to decrypt message using ${algorithm}. Check your key.`);
  }
};

/**
 * Validates key strength
 */
export const validateKeyStrength = (key: string): {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
} => {
  let score = 0;
  
  if (key.length >= 8) score += 20;
  if (key.length >= 12) score += 20;
  if (key.length >= 16) score += 20;
  if (/[a-z]/.test(key)) score += 10;
  if (/[A-Z]/.test(key)) score += 10;
  if (/[0-9]/.test(key)) score += 10;
  if (/[^a-zA-Z0-9]/.test(key)) score += 10;
  
  let strength: 'weak' | 'medium' | 'strong';
  if (score < 40) strength = 'weak';
  else if (score < 70) strength = 'medium';
  else strength = 'strong';
  
  return { strength, score };
};
