import { describe, it, expect } from 'vitest';
import {
  calculateChannelEntropy,
  calculateBlockEntropy,
  calculateEntropyFromCounts,
} from '../src/lib/forensics/entropy';
import { calculateChiSquare } from '../src/lib/forensics/chisquare';
import { extractBitPlane } from '../src/lib/forensics/bitplane';
import { computeVisualDiff, calculatePsnr } from '../src/lib/forensics/visualDiff';
import { ForensicError } from '../src/lib/forensics/errors';
import { embedLsb } from '../src/lib/steganography/lsb';

describe('Forensic Steganalysis Engine', () => {
  // Helper to build RGBA buffers
  const createTestImage = (width: number, height: number, generator: (x: number, y: number, ch: number) => number): Uint8ClampedArray => {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        data[idx] = generator(x, y, 0);     // R
        data[idx + 1] = generator(x, y, 1); // G
        data[idx + 2] = generator(x, y, 2); // B
        data[idx + 3] = 255;                // A
      }
    }
    return data;
  };

  describe('Shannon Entropy', () => {
    it('calculates 0 entropy for monochromatic images', () => {
      const solidImage = createTestImage(32, 32, () => 128);
      const entropy = calculateChannelEntropy(solidImage);

      expect(entropy.red).toBe(0);
      expect(entropy.green).toBe(0);
      expect(entropy.blue).toBe(0);
      expect(entropy.overall).toBe(0);
    });

    it('calculates maximum entropy (~8.0 bits) for uniform 256 byte distributions', () => {
      const counts = new Array(256).fill(100);
      const h = calculateEntropyFromCounts(counts, 256 * 100);
      expect(h).toBeCloseTo(8.0, 2);
    });

    it('calculates block-level spatial entropy and detects anomalies', () => {
      const width = 64;
      const height = 64;
      // Normal background: smooth gradient
      const image = createTestImage(width, height, (x, y) => (x + y) % 100);

      // Inject pseudo-random high entropy block at top-left (0..15, 0..15)
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const idx = (y * width + x) * 4;
          image[idx] = (x * 73 + y * 191) % 256;
          image[idx + 1] = (x * 37 + y * 127) % 256;
          image[idx + 2] = (x * 53 + y * 223) % 256;
        }
      }

      const blockResult = calculateBlockEntropy(image, width, height, 16);
      expect(blockResult.gridWidth).toBe(4);
      expect(blockResult.gridHeight).toBe(4);
      expect(blockResult.grid.length).toBe(4);
      expect(blockResult.maxEntropy).toBeGreaterThan(blockResult.minEntropy);
    });
  });

  describe('Chi-Square Steganalysis (Pairs of Values)', () => {
    it('correctly assesses natural smooth images as clean', () => {
      // Natural gradient image
      const naturalImage = createTestImage(100, 100, (x, y) => Math.floor((x / 100) * 200));
      const result = calculateChiSquare(naturalImage, 'all');

      expect(result.degreesOfFreedom).toBeGreaterThan(0);
      expect(result.channel).toBe('all');
      expect(result.chiSquare).toBeDefined();
    });

    it('detects steganography tampering when encrypted payload is embedded', () => {
      const carrier = createTestImage(100, 100, (x, y) => (x * 2 + y * 3) % 256);
      
      // Random encrypted payload to embed
      const randomPayload = new Uint8Array(2000);
      for (let i = 0; i < randomPayload.length; i++) {
        randomPayload[i] = (i * 97 + 13) % 256;
      }

      const stego = embedLsb(carrier, randomPayload);
      const result = calculateChiSquare(stego, 'all');

      expect(result).toBeDefined();
      expect(result.degreesOfFreedom).toBeGreaterThan(50);
      expect(result.verdict).toBeTruthy();
    });
  });

  describe('Bit-Plane Extractor', () => {
    it('extracts bit planes 0 through 7 with binary contrast', () => {
      const width = 16;
      const height = 16;
      const testImage = createTestImage(width, height, (x, y) => (x + y * 16) % 256);

      // Extract LSB (plane 0)
      const lsbPlane = extractBitPlane(testImage, width, height, { plane: 0, channel: 'grayscale' });
      expect(lsbPlane.length).toBe(width * height * 4);

      // Verify pixel values are either 0 or 255 (binary)
      for (let i = 0; i < lsbPlane.length; i += 4) {
        expect([0, 255]).toContain(lsbPlane[i]);
        expect(lsbPlane[i + 3]).toBe(255); // Alpha always 255
      }

      // Extract MSB (plane 7)
      const msbPlane = extractBitPlane(testImage, width, height, { plane: 7, channel: 'red' });
      expect(msbPlane.length).toBe(width * height * 4);
    });

    it('rejects invalid plane index', () => {
      const img = createTestImage(10, 10, () => 100);
      expect(() => extractBitPlane(img, 10, 10, { plane: 8 })).toThrow(ForensicError);
      expect(() => extractBitPlane(img, 10, 10, { plane: -1 })).toThrow(ForensicError);
    });
  });

  describe('Visual Diff & Metrics', () => {
    it('computes zero difference on identical images', () => {
      const img1 = createTestImage(20, 20, () => 120);
      const img2 = createTestImage(20, 20, () => 120);

      const diff = computeVisualDiff(img1, img2, 20, 20);
      expect(diff.changedPixels).toBe(0);
      expect(diff.changedPercentage).toBe(0);
      expect(diff.meanSquaredError).toBe(0);
      expect(diff.psnr).toBe(999.0);
    });

    it('detects and amplifies differences between carrier and stego image', () => {
      const carrier = createTestImage(40, 40, () => 150);
      const stego = embedLsb(carrier, 'Secret diff test payload');

      const diff = computeVisualDiff(carrier, stego, 40, 40, 50);
      expect(diff.changedPixels).toBeGreaterThan(0);
      expect(diff.changedPercentage).toBeGreaterThan(0);
      expect(diff.meanSquaredError).toBeGreaterThan(0);
      expect(diff.psnr).toBeLessThan(999.0);
      expect(diff.diffImageData.length).toBe(40 * 40 * 4);
    });

    it('calculates PSNR correctly for standard MSE values', () => {
      // MSE = 1 -> PSNR = 10 * log10(255^2 / 1) = 48.13 dB
      expect(calculatePsnr(1)).toBeCloseTo(48.13, 1);
    });
  });
});
