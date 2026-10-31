import { InvalidInputError } from '../crypto/errors';

export interface CapacityReport {
  readonly width: number;
  readonly height: number;
  readonly totalPixels: number;
  readonly channelsUsed: number;
  readonly bitsPerChannel: number;
  readonly totalAvailableBits: number;
  readonly totalRawBytes: number;
  readonly headerBytes: number;
  readonly maxPayloadBytes: number;
}

export const HEADER_MAGIC_BYTES: Readonly<Uint8Array> = new Uint8Array([0x48, 0x53, 0x54, 0x47]); // 'HSTG'
export const HEADER_BYTE_LENGTH: number = 8; // 4 bytes magic + 4 bytes length uint32
export const DEFAULT_CHANNELS_USED: number = 3; // R, G, B
export const DEFAULT_BITS_PER_CHANNEL: number = 1;

/**
 * Validates dimensions of an image.
 */
const validateDimensions = (width: number, height: number): void => {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new InvalidInputError(`Invalid image dimensions: ${width}x${height}`);
  }
};

/**
 * Calculates max steganographic storage capacity for an image.
 */
export const calculateCapacity = (
  width: number,
  height: number,
  bitsPerChannel: number = DEFAULT_BITS_PER_CHANNEL,
  channelsUsed: number = DEFAULT_CHANNELS_USED
): CapacityReport => {
  validateDimensions(width, height);
  if (bitsPerChannel < 1 || bitsPerChannel > 8) {
    throw new InvalidInputError('bitsPerChannel must be between 1 and 8');
  }
  if (channelsUsed < 1 || channelsUsed > 4) {
    throw new InvalidInputError('channelsUsed must be between 1 and 4');
  }

  const totalPixels: number = width * height;
  const totalAvailableBits: number = totalPixels * channelsUsed * bitsPerChannel;
  const totalRawBytes: number = Math.floor(totalAvailableBits / 8);
  const maxPayloadBytes: number = Math.max(0, totalRawBytes - HEADER_BYTE_LENGTH);

  return {
    width,
    height,
    totalPixels,
    channelsUsed,
    bitsPerChannel,
    totalAvailableBits,
    totalRawBytes,
    headerBytes: HEADER_BYTE_LENGTH,
    maxPayloadBytes,
  };
};

/**
 * Calculates percentage of available capacity consumed by payload.
 */
export const calculateUtilizationPercent = (
  payloadByteLength: number,
  maxPayloadBytes: number
): number => {
  if (maxPayloadBytes <= 0) return 100;
  if (payloadByteLength <= 0) return 0;
  const percent: number = (payloadByteLength / maxPayloadBytes) * 100;
  return Math.min(100, Math.round(percent * 100) / 100);
};

/**
 * Verifies if payload fits in carrier capacity.
 */
export const fitsInCapacity = (
  payloadByteLength: number,
  width: number,
  height: number,
  bitsPerChannel: number = DEFAULT_BITS_PER_CHANNEL
): boolean => {
  const report: CapacityReport = calculateCapacity(width, height, bitsPerChannel);
  return payloadByteLength <= report.maxPayloadBytes;
};
