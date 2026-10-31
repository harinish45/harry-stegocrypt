/**
 * Custom error hierarchy for cryptographic operations.
 */
export class CryptoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CryptoError';
  }
}

export class AuthenticationError extends CryptoError {
  constructor(message = 'Authentication failed: corrupted data or incorrect key') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class InvalidKeyError extends CryptoError {
  constructor(message = 'Invalid cryptographic key or password provided') {
    super(message);
    this.name = 'InvalidKeyError';
  }
}

export class InvalidInputError extends CryptoError {
  constructor(message = 'Invalid cryptographic input or format') {
    super(message);
    this.name = 'InvalidInputError';
  }
}
