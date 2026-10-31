import { ForensicError } from './errors';

export interface ChannelEntropyResult {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
  readonly alpha: number;
  readonly overall: number;
}

export interface BlockCoordinate {
  readonly blockX: number;
  readonly blockY: number;
  readonly pixelX: number;
  readonly pixelY: number;
  readonly entropy: number;
}

export interface BlockEntropyResult {
  readonly blockSize: number;
  readonly gridWidth: number;
  readonly gridHeight: number;
  readonly minEntropy: number;
  readonly maxEntropy: number;
  readonly averageEntropy: number;
  readonly standardDeviation: number;
  readonly grid: number[][]; // [row][col]
  readonly suspiciousBlocks: BlockCoordinate[];
}

/**
 * Calculates Shannon entropy from frequency counts.
 */
export const calculateEntropyFromCounts = (counts: number[], totalCount: number): number => {
  if (totalCount === 0) return 0;
  let entropy = 0;
  for (let i = 0; i < counts.length; i++) {
    const count: number = counts[i];
    if (count > 0) {
      const probability: number = count / totalCount;
      entropy -= probability * Math.log2(probability);
    }
  }
  return Math.round(entropy * 10_000) / 10_000;
};

/**
 * Calculates Shannon entropy per color channel (R, G, B, A) and overall.
 */
export const calculateChannelEntropy = (
  carrierData: Uint8ClampedArray
): ChannelEntropyResult => {
  if (!carrierData || carrierData.length === 0 || carrierData.length % 4 !== 0) {
    throw new ForensicError('Invalid carrier data: buffer length must be a positive multiple of 4');
  }

  const rCounts = new Array(256).fill(0);
  const gCounts = new Array(256).fill(0);
  const bCounts = new Array(256).fill(0);
  const aCounts = new Array(256).fill(0);
  const totalPixels: number = carrierData.length / 4;

  for (let i = 0; i < carrierData.length; i += 4) {
    rCounts[carrierData[i]]++;
    gCounts[carrierData[i + 1]]++;
    bCounts[carrierData[i + 2]]++;
    aCounts[carrierData[i + 3]]++;
  }

  const red: number = calculateEntropyFromCounts(rCounts, totalPixels);
  const green: number = calculateEntropyFromCounts(gCounts, totalPixels);
  const blue: number = calculateEntropyFromCounts(bCounts, totalPixels);
  const alpha: number = calculateEntropyFromCounts(aCounts, totalPixels);
  const overall: number = Math.round(((red + green + blue) / 3) * 10_000) / 10_000;

  return { red, green, blue, alpha, overall };
};

/**
 * Calculates block-level Shannon entropy across the image.
 */
export const calculateBlockEntropy = (
  carrierData: Uint8ClampedArray,
  width: number,
  height: number,
  blockSize = 16
): BlockEntropyResult => {
  if (!carrierData || carrierData.length !== width * height * 4) {
    throw new ForensicError('Carrier data size does not match width and height dimensions');
  }
  if (blockSize <= 0 || width <= 0 || height <= 0) {
    throw new ForensicError('Dimensions and blockSize must be greater than zero');
  }

  const gridWidth: number = Math.ceil(width / blockSize);
  const gridHeight: number = Math.ceil(height / blockSize);
  const grid: number[][] = [];
  const allEntropies: number[] = [];

  for (let gy = 0; gy < gridHeight; gy++) {
    const row: number[] = [];
    for (let gx = 0; gx < gridWidth; gx++) {
      const counts = new Array(256).fill(0);
      let count = 0;

      const startX: number = gx * blockSize;
      const startY: number = gy * blockSize;
      const endX: number = Math.min(startX + blockSize, width);
      const endY: number = Math.min(startY + blockSize, height);

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const index: number = (y * width + x) * 4;
          // RGB values sampled
          counts[carrierData[index]]++;
          counts[carrierData[index + 1]]++;
          counts[carrierData[index + 2]]++;
          count += 3;
        }
      }

      const blockH: number = calculateEntropyFromCounts(counts, count);
      row.push(blockH);
      allEntropies.push(blockH);
    }
    grid.push(row);
  }

  const minEntropy: number = Math.min(...allEntropies);
  const maxEntropy: number = Math.max(...allEntropies);
  const averageEntropy: number = Math.round(
    (allEntropies.reduce((acc, v) => acc + v, 0) / allEntropies.length) * 10_000
  ) / 10_000;

  const variance: number = allEntropies.reduce((acc, v) => acc + (v - averageEntropy) ** 2, 0) / allEntropies.length;
  const standardDeviation: number = Math.round(Math.sqrt(variance) * 10_000) / 10_000;

  // Flag suspicious blocks (high entropy > 7.5 or > mean + 1.5 * stddev)
  const suspiciousThreshold: number = Math.max(7.4, averageEntropy + 1.5 * standardDeviation);
  const suspiciousBlocks: BlockCoordinate[] = [];

  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      const entropy: number = grid[gy][gx];
      if (entropy >= suspiciousThreshold && entropy > 6.5) {
        suspiciousBlocks.push({
          blockX: gx,
          blockY: gy,
          pixelX: gx * blockSize,
          pixelY: gy * blockSize,
          entropy,
        });
      }
    }
  }

  return {
    blockSize,
    gridWidth,
    gridHeight,
    minEntropy,
    maxEntropy,
    averageEntropy,
    standardDeviation,
    grid,
    suspiciousBlocks,
  };
};
