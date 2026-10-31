import {
  embedLsb,
  extractLsbText,
  hasLsbPayload,
} from '@/lib/steganography/lsb';

/**
 * Converts string to binary representation
 * @param str The string to convert
 * @returns Binary representation of the string
 */
const textToBinary = (str: string): string => {
  let binary = '';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i).toString(2).padStart(8, '0');
    binary += charCode;
  }
  return binary;
};

/**
 * Converts binary representation to string
 * @param binary The binary representation
 * @returns The decoded string
 */
const binaryToText = (binary: string): string => {
  let text = '';
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substr(i, 8);
    if (byte === '00000000') break; // Stop at null byte
    text += String.fromCharCode(parseInt(byte, 2));
  }
  return text;
};

/**
 * Hides a message in an image using LSB steganography with magic bytes header
 * @param imageData The image data
 * @param message The message to hide
 * @returns The modified image data with the hidden message
 */
export const hideMessage = (
  imageData: Uint8ClampedArray, 
  message: string
): Uint8ClampedArray => {
  if (!message || message.length === 0) {
    throw new Error('Message cannot be empty');
  }
  return embedLsb(imageData, message);
};

/**
 * Retrieves a hidden message from an image
 * Supports both modern HSTG magic-byte payloads and legacy 24-bit payloads
 * @param imageData The image data with hidden message
 * @returns The hidden message
 */
export const retrieveMessage = (imageData: Uint8ClampedArray): string => {
  // First attempt extraction via modern stego engine
  if (hasLsbPayload(imageData)) {
    try {
      return extractLsbText(imageData);
    } catch (e) {
      console.warn('HSTG magic detected but extraction failed:', e);
    }
  }

  // Fallback to legacy 24-bit prefix extraction
  let binary = '';
  
  // Extract LSBs from RGB channels (skip alpha)
  for (let i = 0; i < imageData.length; i += 4) {
    binary += (imageData[i] & 0x01).toString();
    binary += (imageData[i + 1] & 0x01).toString();
    binary += (imageData[i + 2] & 0x01).toString();
    
    // Once we have the first 24 bits, check message length
    if (binary.length >= 24) {
      const messageLength = parseInt(binary.substring(0, 24), 2);
      
      if (messageLength <= 0 || messageLength > 100000) {
        return '';
      }
      
      const totalBits = 24 + (messageLength * 8);
      if (binary.length >= totalBits) {
        const messageBinary = binary.substring(24, totalBits);
        return binaryToText(messageBinary);
      }
    }
  }
  
  return '';
};

/**
 * Converts an image to a data URL
 * @param imageData The image data
 * @param width The image width
 * @param height The image height
 * @returns Data URL of the image
 */
export const imageDataToDataURL = (
  imageData: Uint8ClampedArray,
  width: number,
  height: number
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  const imgData = ctx.createImageData(width, height);
  imgData.data.set(imageData);
  ctx.putImageData(imgData, 0, 0);
  
  return canvas.toDataURL('image/png');
};
