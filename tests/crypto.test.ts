import { describe, it, expect } from 'vitest';
import {
  encryptAesGcm,
  decryptAesGcm,
  decryptAesGcmText,
  uint8ArrayToBase64,
  base64ToUint8Array,
  generateSecureRandomBytes,
  deriveKeyFromPassword,
} from '../src/lib/crypto/aes';
import {
  AuthenticationError,
  InvalidInputError,
  InvalidKeyError,
} from '../src/lib/crypto/errors';

describe('AES-256-GCM WebCrypto Engine', () => {
  const password = 'SuperSecretMasterKey!2026';

  it('encrypts and decrypts text successfully (roundtrip)', async () => {
    const message = 'Confidential payload: The eagle flies at midnight. 🦅🔐';
    const encrypted = await encryptAesGcm(message, password, 10_000);

    expect(encrypted.bundle).toBeDefined();
    expect(encrypted.bundle.algorithm).toBe('AES-GCM-256');
    expect(encrypted.bundle.salt).toBeTruthy();
    expect(encrypted.bundle.iv).toBeTruthy();
    expect(encrypted.bundle.ciphertext).toBeTruthy();

    const decrypted = await decryptAesGcmText(encrypted.bundle, password);
    expect(decrypted).toBe(message);
  });

  it('encrypts and decrypts binary Uint8Array payload via binaryPacket', async () => {
    const rawData = new Uint8Array([0x00, 0xff, 0x42, 0x13, 0x37, 0xaa, 0x55]);
    const encrypted = await encryptAesGcm(rawData, password, 10_000);

    const decrypted = await decryptAesGcm(encrypted.binaryPacket, password);
    expect(decrypted).toEqual(rawData);
  });

  it('encrypts and decrypts large payloads (100KB+)', async () => {
    const largeText = 'A'.repeat(120_000);
    const encrypted = await encryptAesGcm(largeText, password, 5_000);

    const decrypted = await decryptAesGcmText(encrypted.bundle, password);
    expect(decrypted).toBe(largeText);
  });

  it('fails decryption with an invalid password (AuthenticationError)', async () => {
    const message = 'Secret message';
    const encrypted = await encryptAesGcm(message, password, 5_000);

    await expect(decryptAesGcmText(encrypted.bundle, 'WrongPassword123!')).rejects.toThrow(
      AuthenticationError
    );
  });

  it('fails decryption if ciphertext authentication tag or data is tampered with', async () => {
    const message = 'Authenticated data';
    const encrypted = await encryptAesGcm(message, password, 5_000);

    // Tamper with ciphertext
    const ctBytes = base64ToUint8Array(encrypted.bundle.ciphertext);
    ctBytes[0] ^= 0x01; // flip one bit
    const tamperedBundle = {
      ...encrypted.bundle,
      ciphertext: uint8ArrayToBase64(ctBytes),
    };

    await expect(decryptAesGcmText(tamperedBundle, password)).rejects.toThrow(
      AuthenticationError
    );
  });

  it('fails decryption if IV is tampered with', async () => {
    const message = 'Tampered IV';
    const encrypted = await encryptAesGcm(message, password, 5_000);

    const ivBytes = base64ToUint8Array(encrypted.bundle.iv);
    ivBytes[0] ^= 0xff;
    const tamperedBundle = {
      ...encrypted.bundle,
      iv: uint8ArrayToBase64(ivBytes),
    };

    await expect(decryptAesGcmText(tamperedBundle, password)).rejects.toThrow(
      AuthenticationError
    );
  });

  it('rejects empty password with InvalidKeyError', async () => {
    await expect(encryptAesGcm('Hello', '', 5_000)).rejects.toThrow(InvalidKeyError);
  });

  it('rejects empty plaintext with InvalidInputError', async () => {
    await expect(encryptAesGcm('', password, 5_000)).rejects.toThrow(InvalidInputError);
  });

  it('generates secure random bytes', () => {
    const bytes1 = generateSecureRandomBytes(16);
    const bytes2 = generateSecureRandomBytes(16);
    expect(bytes1.length).toBe(16);
    expect(bytes2.length).toBe(16);
    expect(bytes1).not.toEqual(bytes2);
  });
});
