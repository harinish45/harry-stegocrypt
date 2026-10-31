/**
 * Custom error hierarchy for steganography operations.
 */
export class StegoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StegoError';
  }
}

export class CapacityExceededError extends StegoError {
  public readonly requiredBytes: number;
  public readonly maxCapacityBytes: number;

  constructor(requiredBytes: number, maxCapacityBytes: number) {
    super(`Payload requires ${requiredBytes} bytes, but carrier only has capacity for ${maxCapacityBytes} bytes`);
    this.name = 'CapacityExceededError';
    this.requiredBytes = requiredBytes;
    this.maxCapacityBytes = maxCapacityBytes;
  }
}

export class InvalidMagicError extends StegoError {
  constructor(message = 'No valid steganographic header detected in carrier image') {
    super(message);
    this.name = 'InvalidMagicError';
  }
}

export class CorruptedCarrierError extends StegoError {
  constructor(message = 'Carrier image data is corrupted or invalid') {
    super(message);
    this.name = 'CorruptedCarrierError';
  }
}

export class InvalidPayloadError extends StegoError {
  constructor(message = 'Invalid steganographic payload provided') {
    super(message);
    this.name = 'InvalidPayloadError';
  }
}
