import { describe, it, expect } from 'vitest';
import {
  embedLsb,
  extractLsb,
  extractLsbText,
  hasLsbPayload,
} from '../src/lib/steganography/lsb';
import {
  calculateCapacity,
  calculateUtilizationPercent,
  fitsInCapacity,
} from '../src/lib/steganography/capacity';
import {
  CapacityExceededError,
  CorruptedCarrierError,
  InvalidMagicError,
  InvalidPayloadError,
} from '../src/lib/steganography/errors';
import { encryptAesGcm, decryptAesGcmText } from '../src/lib/crypto/aes';

describe('LSB Steganography Engine', () => {
  // Helper to create a dummy RGBA image carrier
  const createCarrier = (width: number, height: number, fillColor = [128, 128, 128, 255]): Uint8ClampedArray => {
    const buffer = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = fillColor[0];
      buffer[i + 1] = fillColor[1];
      buffer[i + 2] = fillColor[2];
      buffer[i + 3] = fillColor[3];
    }
    return buffer;
  };

  it('embeds and extracts text payload roundtrip', () => {
    const carrier = createCarrier(64, 64);
    const secretMessage = 'Top secret coordinates: 37.7749° N, 122.4194° W';

    expect(hasLsbPayload(carrier)).toBe(false);

    const stegoImage = embedLsb(carrier, secretMessage);
    expect(hasLsbPayload(stegoImage)).toBe(true);

    const extracted = extractLsbText(stegoImage);
    expect(extracted).toBe(secretMessage);
  });

  it('embeds and extracts raw binary Uint8Array payload roundtrip', () => {
    const carrier = createCarrier(50, 50);
    const rawPayload = new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x01, 0x02, 0x03, 0xff]);

    const stegoImage = embedLsb(carrier, rawPayload);
    const extracted = extractLsb(stegoImage);

    expect(extracted).toEqual(rawPayload);
  });

  it('preserves alpha channel completely untouched', () => {
    const carrier = createCarrier(20, 20, [100, 150, 200, 255]);
    const message = 'Alpha channel test';

    const stegoImage = embedLsb(carrier, message);
    for (let i = 3; i < stegoImage.length; i += 4) {
      expect(stegoImage[i]).toBe(255);
    }
  });

  it('throws CapacityExceededError when payload is too large for carrier', () => {
    const tinyCarrier = createCarrier(4, 4); // 16 pixels * 3 channels = 48 bits = 6 raw bytes (header alone is 8B)
    const message = 'This message is way too large to fit in a 4x4 image carrier!';

    expect(() => embedLsb(tinyCarrier, message)).toThrow(CapacityExceededError);
  });

  it('throws InvalidMagicError when carrier does not contain HSTG magic header', () => {
    const cleanCarrier = createCarrier(32, 32);
    expect(() => extractLsb(cleanCarrier)).toThrow(InvalidMagicError);
  });

  it('throws CorruptedCarrierError when carrier data length is invalid', () => {
    const invalidCarrier = new Uint8ClampedArray([1, 2, 3]); // Not multiple of 4
    expect(() => embedLsb(invalidCarrier, 'Test')).toThrow(CorruptedCarrierError);
  });

  it('throws InvalidPayloadError when payload is empty', () => {
    const carrier = createCarrier(32, 32);
    expect(() => embedLsb(carrier, '')).toThrow(InvalidPayloadError);
  });

  it('throws CorruptedCarrierError if declared length in header is tampered/excessive', () => {
    const carrier = createCarrier(32, 32);
    const stegoImage = embedLsb(carrier, 'Legit message');

    // Tamper with the length bits in header (bits 32..63 are uint32 length)
    // Overwrite the length bytes by directly modifying LSBs
    // To forge a 4GB length, set bits to 1
    for (let bit = 32; bit < 64; bit++) {
      const pixelIdx = Math.floor(bit / 3);
      const chOffset = bit % 3;
      const idx = pixelIdx * 4 + chOffset;
      stegoImage[idx] = (stegoImage[idx] & 0xfe) | 1;
    }

    expect(() => extractLsb(stegoImage)).toThrow(CorruptedCarrierError);
  });

  it('performs end-to-end cryptographic steganography (encrypt -> embed -> extract -> decrypt)', async () => {
    const carrier = createCarrier(80, 80);
    const password = 'ZeroTrustPassphrase$2026';
    const secretIntel = 'Mission classified: Operation Dark Star active';

    // Step 1: Encrypt payload with AES-256-GCM
    const encrypted = await encryptAesGcm(secretIntel, password, 5_000);

    // Step 2: Embed encrypted binary packet into image
    const stegoImage = embedLsb(carrier, encrypted.binaryPacket);

    // Step 3: Extract encrypted binary packet from carrier
    const extractedBytes = extractLsb(stegoImage);

    // Step 4: Decrypt with passphrase
    const decryptedIntel = await decryptAesGcmText(extractedBytes, password);
    expect(decryptedIntel).toBe(secretIntel);
  });

  describe('Capacity Calculator', () => {
    it('correctly calculates storage capacities for various dimensions', () => {
      // 100 x 100 pixels = 10,000 pixels
      // 3 channels (RGB) * 1 bit = 30,000 bits
      // 30,000 / 8 = 3750 raw bytes
      // Header = 8 bytes -> max payload = 3742 bytes
      const capacity100 = calculateCapacity(100, 100);
      expect(capacity100.totalPixels).toBe(10_000);
      expect(capacity100.totalRawBytes).toBe(3750);
      expect(capacity100.headerBytes).toBe(8);
      expect(capacity100.maxPayloadBytes).toBe(3742);

      expect(fitsInCapacity(1000, 100, 100)).toBe(true);
      expect(fitsInCapacity(4000, 100, 100)).toBe(false);
      expect(calculateUtilizationPercent(1871, capacity100.maxPayloadBytes)).toBe(50);
    });

    it('rejects invalid dimensions', () => {
      expect(() => calculateCapacity(0, 100)).toThrow();
      expect(() => calculateCapacity(100, -5)).toThrow();
    });
  });
});
