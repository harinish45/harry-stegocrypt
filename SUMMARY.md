# 🛡️ HarryStegoCrypt Implementation Summary

## 📌 Overview
HarryStegoCrypt is a zero-trust, client-side cryptographic steganography and cyber-forensic analysis workbench built with React, Vite, TypeScript, and WebCrypto.

---

## 🚀 Key Modules Implemented

### 1. Cryptographic Engine (`src/lib/crypto/`)
- **`aes.ts`**:
  - `encryptAesGcm`: Encrypts arbitrary strings or `Uint8Array` payloads using AES-256-GCM. Generates a cryptographically random 16-byte salt and 12-byte IV using `crypto.getRandomValues`.
  - Key Derivation: PBKDF2 with SHA-256 and configurable iterations (default: 100,000 iterations).
  - Output formats: Both JSON Base64 bundle (`AesGcmBundle`) and packed binary payload (`binaryPacket`: `[Salt 16B][IV 12B][Iterations 4B][Ciphertext + 16B GCM Tag]`).
  - `decryptAesGcm` / `decryptAesGcmText`: Authenticated decryption that verifies the GCM authentication tag, throwing specific `AuthenticationError` if key is incorrect or ciphertext is tampered with.
- **`errors.ts`**:
  - `CryptoError`, `AuthenticationError`, `InvalidKeyError`, `InvalidInputError`.

### 2. Steganography Engine (`src/lib/steganography/`)
- **`lsb.ts`**:
  - LSB embedding & extraction for HTML Canvas / `ImageData` / `Uint8ClampedArray`.
  - Magic Header: 4-byte magic signature `HSTG` (`0x48, 0x53, 0x54, 0x47`) followed by 4-byte Big-Endian unsigned 32-bit payload length.
  - Channels: Encodes sequentially across Red, Green, and Blue channels while keeping Alpha strictly preserved at 255 (preventing PNG transparency distortion).
  - Detection: `hasLsbPayload` verifies magic bytes before extraction.
  - Extraction: `extractLsb` / `extractLsbText` extracts validated payload.
- **`capacity.ts`**:
  - `calculateCapacity`: Computes total pixels, usable bits, total raw capacity, header overhead (8 bytes), and maximum payload bytes for any given image dimensions.
  - `calculateUtilizationPercent`: Calculates percentage utilization of carrier image.
  - `fitsInCapacity`: Validates if payload will fit in carrier before starting encoding.
- **`errors.ts`**:
  - `StegoError`, `CapacityExceededError`, `InvalidMagicError`, `CorruptedCarrierError`, `InvalidPayloadError`.

### 3. Forensic Steganalysis Engine (`src/lib/forensics/`)
- **`entropy.ts`**:
  - `calculateChannelEntropy`: Computes Shannon entropy $H = -\sum p_i \log_2(p_i)$ for Red, Green, Blue, Alpha channels, and overall image.
  - `calculateBlockEntropy`: Divides carrier into spatial blocks (e.g. 16x16), computing block-level entropy, min, max, average, standard deviation, and pinpointing suspicious high-entropy blocks indicative of localized stego.
- **`chisquare.ts`**:
  - `calculateChiSquare`: Pairs of Values (PoVs) statistical attack (Westfeld & Pfitzmann). Measures deviation between observed even/odd pixel value pairs and expected equalized distribution.
  - Wilson-Hilferty transformation calculates p-value and estimated probability of stego tampering, categorized into `clean`, `suspicious`, and `likely_stego` risk levels.
- **`bitplane.ts`**:
  - `extractBitPlane`: Isolates bit-planes 0 through 7 (plane 0 is LSB) for visual inspection across R, G, B, and Grayscale channels onto an HTML canvas.
- **`visualDiff.ts`**:
  - `computeVisualDiff`: Compares original carrier and stego image. Computes Mean Squared Error (MSE), Peak Signal-to-Noise Ratio (PSNR), changed pixel count and area percentage, and renders an amplified difference visualization canvas.

### 4. UI Integrations
- **`ForensicsPage.tsx`**: Upgraded with a comprehensive tabbed interface for statistical steganalysis (Shannon entropy + Chi-square), Bit-Plane visualizer (interactive plane 0-7 slider and channel selectors), and Visual Difference comparison.
- **`CapacityIndicator.tsx`**: Wired to `calculateCapacity` and `calculateUtilizationPercent` for real-time capacity and progress feedback.
- **`src/utils/steganography.ts`**: Updated to use `embedLsb` and `extractLsbText` with backwards-compatibility fallback.

---

## 🧪 Test Suite (`tests/`)
- **`tests/crypto.test.ts`**: 9 tests covering AES-256-GCM encryption/decryption roundtrips, binary packets, large payloads, corrupted ciphertexts, invalid keys, and random byte generation.
- **`tests/steganography.test.ts`**: 11 tests covering LSB hide/reveal roundtrips, binary payloads, alpha preservation, capacity overflow, corrupted headers, and end-to-end crypto + stego pipelines.
- **`tests/forensics.test.ts`**: 10 tests covering Shannon entropy, Chi-square steganalysis, bit-plane extraction, visual diff, and PSNR calculations.
- **Total**: 30 passing unit tests with Vitest.

---

## 🔒 Security Fixes
- Untracked `.env` from repository history (`git rm --cached .env`).
- Created `.env.example` with template keys.
- Added `.env` and `.env*.local` to `.gitignore`.
