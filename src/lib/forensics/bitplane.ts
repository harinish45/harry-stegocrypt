import { ForensicError } from './errors';

export type BitPlaneChannel = 'red' | 'green' | 'blue' | 'grayscale';

export interface BitPlaneOptions {
  readonly plane: number; // 0 to 7 (0 = LSB, 7 = MSB)
  readonly channel?: BitPlaneChannel;
}

/**
 * Extracts a single bit-plane (0-7) from carrier image data for visual inspection.
 * Bit 0 is the Least Significant Bit (LSB).
 */
export const extractBitPlane = (
  carrierData: Uint8ClampedArray,
  width: number,
  height: number,
  options: BitPlaneOptions
): Uint8ClampedArray => {
  const { plane, channel = 'grayscale' } = options;

  if (plane < 0 || plane > 7 || !Number.isInteger(plane)) {
    throw new ForensicError('Bit-plane index must be an integer between 0 and 7');
  }
  if (!carrierData || carrierData.length !== width * height * 4) {
    throw new ForensicError('Carrier data length does not match width and height dimensions');
  }

  const output = new Uint8ClampedArray(carrierData.length);
  const bitMask: number = 1 << plane;

  for (let i = 0; i < carrierData.length; i += 4) {
    let bitValue = 0;

    switch (channel) {
      case 'red':
        bitValue = (carrierData[i] & bitMask) !== 0 ? 255 : 0;
        output[i] = bitValue;
        output[i + 1] = 0;
        output[i + 2] = 0;
        break;
      case 'green':
        bitValue = (carrierData[i + 1] & bitMask) !== 0 ? 255 : 0;
        output[i] = 0;
        output[i + 1] = bitValue;
        output[i + 2] = 0;
        break;
      case 'blue':
        bitValue = (carrierData[i + 2] & bitMask) !== 0 ? 255 : 0;
        output[i] = 0;
        output[i + 1] = 0;
        output[i + 2] = bitValue;
        break;
      case 'grayscale':
      default: {
        // Average or luminance of bits across R, G, B
        const rb = (carrierData[i] & bitMask) !== 0 ? 1 : 0;
        const gb = (carrierData[i + 1] & bitMask) !== 0 ? 1 : 0;
        const bb = (carrierData[i + 2] & bitMask) !== 0 ? 1 : 0;
        const lum = Math.round(((rb + gb + bb) / 3) * 255);
        output[i] = lum;
        output[i + 1] = lum;
        output[i + 2] = lum;
        break;
      }
    }

    output[i + 3] = 255; // Alpha fully opaque
  }

  return output;
};
