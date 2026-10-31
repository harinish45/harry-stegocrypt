import { ForensicError } from './errors';

export interface VisualDiffResult {
  readonly width: number;
  readonly height: number;
  readonly totalPixels: number;
  readonly changedPixels: number;
  readonly changedPercentage: number;
  readonly meanSquaredError: number;
  readonly psnr: number; // Peak Signal-to-Noise Ratio in dB
  readonly diffImageData: Uint8ClampedArray; // RGBA buffer with amplified diff
}

/**
 * Calculates Peak Signal-to-Noise Ratio (PSNR) from MSE.
 */
export const calculatePsnr = (mse: number): number => {
  if (mse <= 0) return 999.0; // Identical images
  const maxIntensity = 255;
  const psnr: number = 10 * Math.log10((maxIntensity * maxIntensity) / mse);
  return Math.round(psnr * 100) / 100;
};

/**
 * Computes visual and statistical pixel difference between two images.
 */
export const computeVisualDiff = (
  original: Uint8ClampedArray,
  modified: Uint8ClampedArray,
  width: number,
  height: number,
  amplificationFactor = 50
): VisualDiffResult => {
  if (original.length !== modified.length || original.length !== width * height * 4) {
    throw new ForensicError('Image dimensions or buffer sizes do not match for comparison');
  }

  const totalPixels: number = width * height;
  const diffImageData = new Uint8ClampedArray(original.length);
  let changedPixels = 0;
  let squaredErrorSum = 0;

  for (let i = 0; i < original.length; i += 4) {
    const dr: number = Math.abs(original[i] - modified[i]);
    const dg: number = Math.abs(original[i + 1] - modified[i + 1]);
    const db: number = Math.abs(original[i + 2] - modified[i + 2]);
    const da: number = Math.abs(original[i + 3] - modified[i + 3]);

    const isChanged: boolean = dr > 0 || dg > 0 || db > 0 || da > 0;
    if (isChanged) {
      changedPixels++;
    }

    squaredErrorSum += (dr * dr + dg * dg + db * db) / 3;

    // Generate amplified visualization:
    // Unchanged pixels appear dark gray; changed pixels glow bright magenta/cyan/white
    if (isChanged) {
      diffImageData[i] = Math.min(255, dr * amplificationFactor + 100);     // Red
      diffImageData[i + 1] = Math.min(255, dg * amplificationFactor);       // Green
      diffImageData[i + 2] = Math.min(255, db * amplificationFactor + 150); // Blue
      diffImageData[i + 3] = 255;                                           // Alpha
    } else {
      diffImageData[i] = 20;
      diffImageData[i + 1] = 20;
      diffImageData[i + 2] = 25;
      diffImageData[i + 3] = 255;
    }
  }

  const meanSquaredError: number = Math.round((squaredErrorSum / totalPixels) * 10_000) / 10_000;
  const psnr: number = calculatePsnr(meanSquaredError);
  const changedPercentage: number = Math.round((changedPixels / totalPixels) * 10_000) / 100;

  return {
    width,
    height,
    totalPixels,
    changedPixels,
    changedPercentage,
    meanSquaredError,
    psnr,
    diffImageData,
  };
};
