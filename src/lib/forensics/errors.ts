/**
 * Custom error hierarchy for forensic analysis operations.
 */
export class ForensicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForensicError';
  }
}
