import {
  AuthenticationError,
  CryptoError,
  InvalidInputError,
  InvalidKeyError,
} from './errors';

export interface AesGcmBundle {
  readonly version: 1;
  readonly algorithm: 'AES-GCM-256';
  readonly salt: string; // Base64
  readonly iv: string;   // Base64
  readonly ciphertext: string; // Base64 (includes 16-byte GCM authentication tag)
  readonly iterations: number;
}

export interface AesGcmResult {
  readonly bundle: AesGcmBundle;
  readonly binaryPacket: Uint8Array; // [Salt 16B][IV 12B][Iterations 4B][Ciphertext + Tag]
}

const TEXT_ENCODER: TextEncoder = new TextEncoder();
const TEXT_DECODER: TextDecoder = new TextDecoder();

export const SALT_BYTE_LENGTH = 16;
export const IV_BYTE_LENGTH = 12;
export const ITERATIONS_BYTE_LENGTH = 4;
export const DEFAULT_PBKDF2_ITERATIONS = 100_000;
export const AES_KEY_BIT_LENGTH = 256;

/**
 * Encodes Uint8Array or ArrayBuffer into Base64 string.
 */
export const uint8ArrayToBase64 = (buffer: ArrayBuffer | Uint8Array): string => {
  const bytes: Uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Decodes Base64 string into Uint8Array.
 */
export const base64ToUint8Array = (base64: string): Uint8Array => {
  try {
    const binary: string = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    throw new InvalidInputError('Invalid Base64 string provided');
  }
};

/**
 * Securely generates random bytes using WebCrypto.
 */
export const generateSecureRandomBytes = (length: number): Uint8Array => {
  if (length <= 0) {
    throw new InvalidInputError('Length must be greater than 0');
  }
  const buffer = new Uint8Array(length);
  return crypto.getRandomValues(buffer);
};

/**
 * Derives an AES-GCM-256 CryptoKey using PBKDF2 with SHA-256.
 */
export const deriveKeyFromPassword = async (
  password: string,
  salt: Uint8Array,
  iterations: number = DEFAULT_PBKDF2_ITERATIONS
): Promise<CryptoKey> => {
  if (!password || password.length === 0) {
    throw new InvalidKeyError('Password must not be empty');
  }
  if (salt.length !== SALT_BYTE_LENGTH) {
    throw new InvalidInputError(`Salt must be exactly ${SALT_BYTE_LENGTH} bytes`);
  }
  try {
    const rawKeyMaterial: CryptoKey = await crypto.subtle.importKey(
      'raw',
      TEXT_ENCODER.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations,
        hash: 'SHA-256',
      },
      rawKeyMaterial,
      { name: 'AES-GCM', length: AES_KEY_BIT_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    if (error instanceof CryptoError) throw error;
    throw new CryptoError(`Key derivation failed: ${(error as Error).message}`);
  }
};

/**
 * Encrypts data using AES-256-GCM authenticated cipher.
 */
export const encryptAesGcm = async (
  plaintext: string | Uint8Array,
  password: string,
  iterations: number = DEFAULT_PBKDF2_ITERATIONS
): Promise<AesGcmResult> => {
  if (!plaintext || (typeof plaintext === 'string' && plaintext.length === 0)) {
    throw new InvalidInputError('Plaintext must not be empty');
  }
  const dataBytes: Uint8Array = typeof plaintext === 'string'
    ? TEXT_ENCODER.encode(plaintext)
    : plaintext;

  const salt: Uint8Array = generateSecureRandomBytes(SALT_BYTE_LENGTH);
  const iv: Uint8Array = generateSecureRandomBytes(IV_BYTE_LENGTH);
  const key: CryptoKey = await deriveKeyFromPassword(password, salt, iterations);

  const encryptedBuffer: ArrayBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    dataBytes as BufferSource
  );
  const cipherBytes = new Uint8Array(encryptedBuffer);

  // Pack binary packet: [Salt: 16B][IV: 12B][Iterations: 4B][Ciphertext + Tag]
  const packetHeaderLength = SALT_BYTE_LENGTH + IV_BYTE_LENGTH + ITERATIONS_BYTE_LENGTH;
  const binaryPacket = new Uint8Array(packetHeaderLength + cipherBytes.length);
  binaryPacket.set(salt, 0);
  binaryPacket.set(iv, SALT_BYTE_LENGTH);
  
  const view = new DataView(binaryPacket.buffer, binaryPacket.byteOffset, binaryPacket.byteLength);
  view.setUint32(SALT_BYTE_LENGTH + IV_BYTE_LENGTH, iterations, false);
  binaryPacket.set(cipherBytes, packetHeaderLength);

  const bundle: AesGcmBundle = {
    version: 1,
    algorithm: 'AES-GCM-256',
    salt: uint8ArrayToBase64(salt),
    iv: uint8ArrayToBase64(iv),
    ciphertext: uint8ArrayToBase64(cipherBytes),
    iterations,
  };

  return { bundle, binaryPacket };
};

/**
 * Decrypts an AES-GCM bundle or binary packet to raw bytes.
 */
export const decryptAesGcm = async (
  encryptedInput: AesGcmBundle | Uint8Array | string,
  password: string
): Promise<Uint8Array> => {
  if (!password || password.length === 0) {
    throw new InvalidKeyError('Password must not be empty');
  }
  let salt: Uint8Array;
  let iv: Uint8Array;
  let cipherBytes: Uint8Array;
  let iterations: number = DEFAULT_PBKDF2_ITERATIONS;

  const packetHeaderLength = SALT_BYTE_LENGTH + IV_BYTE_LENGTH + ITERATIONS_BYTE_LENGTH;

  if (encryptedInput instanceof Uint8Array) {
    if (encryptedInput.length < packetHeaderLength + 16) {
      throw new InvalidInputError('Encrypted binary packet is too short');
    }
    salt = encryptedInput.slice(0, SALT_BYTE_LENGTH);
    iv = encryptedInput.slice(SALT_BYTE_LENGTH, SALT_BYTE_LENGTH + IV_BYTE_LENGTH);
    
    const view = new DataView(encryptedInput.buffer, encryptedInput.byteOffset, encryptedInput.byteLength);
    iterations = view.getUint32(SALT_BYTE_LENGTH + IV_BYTE_LENGTH, false);
    cipherBytes = encryptedInput.slice(packetHeaderLength);
  } else {
    const bundle: AesGcmBundle = typeof encryptedInput === 'string'
      ? JSON.parse(encryptedInput)
      : encryptedInput;
    salt = base64ToUint8Array(bundle.salt);
    iv = base64ToUint8Array(bundle.iv);
    cipherBytes = base64ToUint8Array(bundle.ciphertext);
    iterations = bundle.iterations ?? DEFAULT_PBKDF2_ITERATIONS;
  }

  const key: CryptoKey = await deriveKeyFromPassword(password, salt, iterations);
  try {
    const decryptedBuffer: ArrayBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      cipherBytes as BufferSource
    );
    return new Uint8Array(decryptedBuffer);
  } catch (error) {
    throw new AuthenticationError('Decryption failed: wrong password or data has been tampered with');
  }
};

/**
 * Decrypts ciphertext and decodes as UTF-8 string.
 */
export const decryptAesGcmText = async (
  encryptedInput: AesGcmBundle | Uint8Array | string,
  password: string
): Promise<string> => {
  const decryptedBytes: Uint8Array = await decryptAesGcm(encryptedInput, password);
  return TEXT_DECODER.decode(decryptedBytes);
};
