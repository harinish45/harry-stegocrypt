import CryptoJS from 'crypto-js';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import forge from 'node-forge';

export type EncryptionAlgorithm = 'AES' | 'RSA' | 'ChaCha20';

interface WorkerMessage {
  type: 'encrypt' | 'decrypt' | 'hash' | 'embed' | 'extract';
  payload: any;
}

interface WorkerResponse {
  success: boolean;
  data?: any;
  error?: string;
  progress?: number;
}

// Derive key from password
const deriveKey = (password: string, length: number = 32): Uint8Array => {
  const hash = CryptoJS.SHA256(password);
  const hashArray = new Uint8Array(length);
  const hashHex = hash.toString();
  
  for (let i = 0; i < length; i++) {
    hashArray[i] = parseInt(hashHex.substr(i * 2, 2), 16);
  }
  
  return hashArray;
};

// Encryption functions
const encryptAES = (message: string, key: string): string => {
  return CryptoJS.AES.encrypt(message, key).toString();
};

const decryptAES = (encryptedMessage: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const encryptChaCha20 = (message: string, password: string): string => {
  const key = deriveKey(password, 32);
  const nonce = nacl.randomBytes(24);
  const messageUint8 = naclUtil.decodeUTF8(message);
  
  const encrypted = nacl.secretbox(messageUint8, nonce, key);
  
  const fullMessage = new Uint8Array(nonce.length + encrypted.length);
  fullMessage.set(nonce);
  fullMessage.set(encrypted, nonce.length);
  
  return naclUtil.encodeBase64(fullMessage);
};

const decryptChaCha20 = (encryptedMessage: string, password: string): string => {
  const key = deriveKey(password, 32);
  const fullMessage = naclUtil.decodeBase64(encryptedMessage);
  
  const nonce = fullMessage.slice(0, 24);
  const message = fullMessage.slice(24);
  
  const decrypted = nacl.secretbox.open(message, nonce, key);
  
  if (!decrypted) {
    throw new Error('Decryption failed');
  }
  
  return naclUtil.encodeUTF8(decrypted);
};

const encryptRSA = (message: string, publicKeyPem: string): string => {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encrypted = publicKey.encrypt(message, 'RSA-OAEP', {
    md: forge.md.sha256.create()
  });
  return forge.util.encode64(encrypted);
};

const decryptRSA = (encryptedMessage: string, privateKeyPem: string): string => {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const encrypted = forge.util.decode64(encryptedMessage);
  const decrypted = privateKey.decrypt(encrypted, 'RSA-OAEP', {
    md: forge.md.sha256.create()
  });
  return decrypted;
};

// Message handler
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, payload } = e.data;
  
  try {
    let result: any;
    
    switch (type) {
      case 'encrypt':
        self.postMessage({ success: true, progress: 30 });
        const { message, key, algorithm } = payload;
        
        switch (algorithm) {
          case 'AES':
            result = encryptAES(message, key);
            break;
          case 'ChaCha20':
            result = encryptChaCha20(message, key);
            break;
          case 'RSA':
            result = encryptRSA(message, key);
            break;
          default:
            throw new Error('Unsupported algorithm');
        }
        
        self.postMessage({ success: true, progress: 60 });
        
        const messageHash = CryptoJS.SHA256(message).toString();
        
        self.postMessage({ 
          success: true, 
          progress: 100,
          data: { 
            encrypted: result, 
            metadata: {
              algorithm,
              timestamp: new Date().toISOString(),
              messageHash,
              keyStrength: algorithm === 'RSA' ? '2048-bit' : `${key.length * 8}-bit`
            }
          } 
        });
        break;
        
      case 'decrypt':
        self.postMessage({ success: true, progress: 30 });
        const { encryptedMessage, key: decryptKey, algorithm: decryptAlgo } = payload;
        
        switch (decryptAlgo) {
          case 'AES':
            result = decryptAES(encryptedMessage, decryptKey);
            break;
          case 'ChaCha20':
            result = decryptChaCha20(encryptedMessage, decryptKey);
            break;
          case 'RSA':
            result = decryptRSA(encryptedMessage, decryptKey);
            break;
          default:
            throw new Error('Unsupported algorithm');
        }
        
        self.postMessage({ success: true, progress: 100, data: result });
        break;
        
      case 'hash':
        const hash = CryptoJS.SHA256(payload.message).toString();
        self.postMessage({ success: true, data: hash });
        break;
        
      default:
        throw new Error('Unknown operation type');
    }
  } catch (error) {
    self.postMessage({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Operation failed' 
    });
  }
};

export {};
