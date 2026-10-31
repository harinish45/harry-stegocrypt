import {
  CapacityExceededError,
  CorruptedCarrierError,
  InvalidMagicError,
  InvalidPayloadError,
  StegoError,
} from './errors';
import {
  HEADER_MAGIC_BYTES,
  HEADER_BYTE_LENGTH,
  calculateCapacity,
} from './capacity';

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

export interface LsbOptions {
  readonly bitsPerChannel?: number; // Default 1
}

/**
 * Normalizes carrier input from ImageData or raw Uint8ClampedArray.
 */
const getCarrierBuffer = (carrier: ImageData | Uint8ClampedArray): Uint8ClampedArray => {
  if (!carrier) {
    throw new CorruptedCarrierError('Carrier image data must not be null or undefined');
  }
  const data: Uint8ClampedArray = 'data' in carrier ? carrier.data : carrier;
  if (data.length === 0 || data.length % 4 !== 0) {
    throw new CorruptedCarrierError('Carrier buffer length must be a non-zero multiple of 4 (RGBA)');
  }
  return data;
};

/**
 * Serializes payload with header (magic bytes + 32-bit length).
 */
const serializePayloadWithHeader = (payloadBytes: Uint8Array): Uint8Array => {
  const totalLength: number = HEADER_BYTE_LENGTH + payloadBytes.length;
  const serialized = new Uint8Array(totalLength);
  
  // Set 4-byte magic: 'HSTG'
  serialized.set(HEADER_MAGIC_BYTES, 0);

  // Set 4-byte payload length (Big Endian uint32)
  const view: DataView = new DataView(serialized.buffer, serialized.byteOffset, serialized.byteLength);
  view.setUint32(4, payloadBytes.length, false);

  // Set payload bytes
  serialized.set(payloadBytes, HEADER_BYTE_LENGTH);
  return serialized;
};

/**
 * Embeds a payload into an image carrier using LSB steganography on RGB channels.
 */
export const embedLsb = (
  carrier: ImageData | Uint8ClampedArray,
  payload: Uint8Array | string | ArrayBuffer,
  options?: LsbOptions
): Uint8ClampedArray => {
  const carrierData: Uint8ClampedArray = getCarrierBuffer(carrier);
  const payloadBytes: Uint8Array = typeof payload === 'string'
    ? TEXT_ENCODER.encode(payload)
    : payload instanceof ArrayBuffer
      ? new Uint8Array(payload)
      : payload;

  if (payloadBytes.length === 0) {
    throw new InvalidPayloadError('Payload must not be empty');
  }

  const serializedData: Uint8Array = serializePayloadWithHeader(payloadBytes);
  const totalBitsNeeded: number = serializedData.length * 8;
  const totalPixels: number = carrierData.length / 4;
  const maxAvailableBits: number = totalPixels * 3; // 3 channels (R, G, B)

  if (totalBitsNeeded > maxAvailableBits) {
    const maxCapacityBytes: number = Math.max(0, Math.floor(maxAvailableBits / 8) - HEADER_BYTE_LENGTH);
    throw new CapacityExceededError(payloadBytes.length, maxCapacityBytes);
  }

  const modifiedData = new Uint8ClampedArray(carrierData);
  let bitIndex = 0;

  for (let i = 0; i < modifiedData.length && bitIndex < totalBitsNeeded; i += 4) {
    // Process R, G, B channels; skip Alpha (i + 3)
    for (let c = 0; c < 3 && bitIndex < totalBitsNeeded; c++) {
      const channelIndex: number = i + c;
      const byteIndex: number = Math.floor(bitIndex / 8);
      const bitOffset: number = 7 - (bitIndex % 8); // Read MSB-first
      const bit: number = (serializedData[byteIndex] >> bitOffset) & 1;

      // Replace LSB
      modifiedData[channelIndex] = (modifiedData[channelIndex] & 0xfe) | bit;
      bitIndex++;
    }
  }

  return modifiedData;
};

/**
 * Extracts raw bits from carrier up to byteCount.
 */
const extractRawBytes = (
  carrierData: Uint8ClampedArray,
  startBitOffset: number,
  byteCount: number
): Uint8Array => {
  const result = new Uint8Array(byteCount);
  let currentBit: number = startBitOffset;

  for (let b = 0; b < byteCount; b++) {
    let byteVal = 0;
    for (let bit = 7; bit >= 0; bit--) {
      const pixelIndex: number = Math.floor(currentBit / 3);
      const channelOffset: number = currentBit % 3;
      const bufferIndex: number = pixelIndex * 4 + channelOffset;

      if (bufferIndex >= carrierData.length) {
        throw new CorruptedCarrierError('Unexpected end of carrier data while extracting');
      }

      const lsb: number = carrierData[bufferIndex] & 1;
      byteVal |= (lsb << bit);
      currentBit++;
    }
    result[b] = byteVal;
  }

  return result;
};

/**
 * Checks if carrier contains valid magic header.
 */
export const hasLsbPayload = (carrier: ImageData | Uint8ClampedArray): boolean => {
  try {
    const carrierData: Uint8ClampedArray = getCarrierBuffer(carrier);
    if (carrierData.length < (HEADER_BYTE_LENGTH * 8 / 3) * 4) {
      return false;
    }
    const magic: Uint8Array = extractRawBytes(carrierData, 0, HEADER_MAGIC_BYTES.length);
    return magic.every((val, idx) => val === HEADER_MAGIC_BYTES[idx]);
  } catch {
    return false;
  }
};

/**
 * Extracts payload embedded with embedLsb.
 */
export const extractLsb = (
  carrier: ImageData | Uint8ClampedArray,
  options?: LsbOptions
): Uint8Array => {
  const carrierData: Uint8ClampedArray = getCarrierBuffer(carrier);
  const totalPixels: number = carrierData.length / 4;
  const maxAvailableRawBytes: number = Math.floor((totalPixels * 3) / 8);

  if (maxAvailableRawBytes < HEADER_BYTE_LENGTH) {
    throw new CorruptedCarrierError('Carrier image is too small to contain a stego header');
  }

  // Extract header (8 bytes)
  const headerBytes: Uint8Array = extractRawBytes(carrierData, 0, HEADER_BYTE_LENGTH);
  
  // Verify magic
  for (let i = 0; i < HEADER_MAGIC_BYTES.length; i++) {
    if (headerBytes[i] !== HEADER_MAGIC_BYTES[i]) {
      throw new InvalidMagicError('No valid steganographic header detected in carrier image');
    }
  }

  // Read payload length (uint32 big-endian at offset 4)
  const view: DataView = new DataView(headerBytes.buffer, headerBytes.byteOffset, headerBytes.byteLength);
  const payloadLength: number = view.getUint32(4, false);

  if (payloadLength === 0) {
    return new Uint8Array(0);
  }

  if (HEADER_BYTE_LENGTH + payloadLength > maxAvailableRawBytes) {
    throw new CorruptedCarrierError(
      `Declared payload length (${payloadLength} bytes) exceeds carrier capacity (${maxAvailableRawBytes - HEADER_BYTE_LENGTH} bytes)`
    );
  }

  // Extract payload bytes
  return extractRawBytes(carrierData, HEADER_BYTE_LENGTH * 8, payloadLength);
};

/**
 * Extracts payload and decodes as UTF-8 string.
 */
export const extractLsbText = (
  carrier: ImageData | Uint8ClampedArray,
  options?: LsbOptions
): string => {
  const bytes: Uint8Array = extractLsb(carrier, options);
  return TEXT_DECODER.decode(bytes);
};
