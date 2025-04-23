
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
 * Hides a message in an image using LSB steganography
 * @param imageData The image data
 * @param message The message to hide
 * @returns The modified image data with the hidden message
 */
export const hideMessage = (
  imageData: Uint8ClampedArray, 
  message: string
): Uint8ClampedArray => {
  // Convert message to binary with message length prefix
  const messageLengthBinary = message.length.toString(2).padStart(24, '0');
  const messageBinary = textToBinary(message);
  const fullBinary = messageLengthBinary + messageBinary;
  
  // Create a copy of the imageData to modify
  const data = new Uint8ClampedArray(imageData);
  
  // Only use RGB channels (skip alpha)
  let binaryIndex = 0;
  
  // Check if the image can hold the message
  if (fullBinary.length > (data.length * 3) / 4) {
    throw new Error('Message is too large for this image');
  }
  
  // Hide each bit of the binary message in the LSB of image data
  for (let i = 0; i < data.length; i += 4) {
    // Only modify if we still have bits to hide
    if (binaryIndex < fullBinary.length) {
      // Modify R channel
      data[i] = (data[i] & 0xFE) | parseInt(fullBinary[binaryIndex], 2);
      binaryIndex++;
    }
    
    if (binaryIndex < fullBinary.length) {
      // Modify G channel
      data[i + 1] = (data[i + 1] & 0xFE) | parseInt(fullBinary[binaryIndex], 2);
      binaryIndex++;
    }
    
    if (binaryIndex < fullBinary.length) {
      // Modify B channel
      data[i + 2] = (data[i + 2] & 0xFE) | parseInt(fullBinary[binaryIndex], 2);
      binaryIndex++;
    }
    
    // Skip alpha channel (i+3)
    
    // If we've hidden all bits, break out
    if (binaryIndex >= fullBinary.length) {
      break;
    }
  }
  
  return data;
};

/**
 * Retrieves a hidden message from an image
 * @param imageData The image data with hidden message
 * @returns The hidden message
 */
export const retrieveMessage = (imageData: Uint8ClampedArray): string => {
  let binary = '';
  
  // Extract LSBs from RGB channels (skip alpha)
  for (let i = 0; i < imageData.length; i += 4) {
    // Extract from R channel
    binary += (imageData[i] & 0x01).toString();
    
    // Extract from G channel
    binary += (imageData[i + 1] & 0x01).toString();
    
    // Extract from B channel
    binary += (imageData[i + 2] & 0x01).toString();
    
    // Once we have the first 24 bits, we can determine message length
    if (binary.length === 24) {
      const messageLength = parseInt(binary, 2);
      
      // Verify that the message length is reasonable
      if (messageLength <= 0 || messageLength > 10000) {
        console.log("Invalid message length detected:", messageLength);
        return ''; // Return empty if message length is invalid
      }
      
      // Calculate how many more bits we need to extract
      const totalBitsNeeded = 24 + (messageLength * 8);
      
      // Continue extracting until we have all the bits
      if (binary.length < totalBitsNeeded) {
        continue;
      }
    }
    
    // If we have enough bits to extract the complete message
    if (binary.length >= 24) {
      const messageLength = parseInt(binary.substring(0, 24), 2);
      
      // Verify that the message length is reasonable
      if (messageLength <= 0 || messageLength > 10000) {
        console.log("Invalid message length detected:", messageLength);
        return ''; // Return empty if message length is invalid
      }
      
      const totalBits = 24 + (messageLength * 8);
      
      // If we have all bits needed, extract and return the message
      if (binary.length >= totalBits) {
        const messageBinary = binary.substring(24, totalBits);
        return binaryToText(messageBinary);
      }
    }
  }
  
  console.log("Could not find a valid message in the image");
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
