# ✅ Autonomous Implementation Checklist (Vibe Coding Guide)

This checklist is structured for AI coding agents (Antigravity, Cursor, Claude Code, Copilot). Pick the first unchecked item `[ ]`, implement, test, and mark as `[x]`.

---

## 🎯 Phase 1: Cryptographic Pipeline
- [ ] `src/lib/crypto/webcrypto.ts`: Implement WebCrypto AES-GCM engine
  - [ ] Derive 256-bit key from password using PBKDF2 (SHA-256)
  - [ ] Encrypt payload with random 12-byte IV
  - [ ] Package payload: `[Salt (16B)][IV (12B)][Ciphertext][Tag (16B)]`

## 🎯 Phase 2: Steganography Engine Optimization
- [ ] `src/lib/stego/lsb_worker.ts`: Web Worker for high-resolution image processing
  - [ ] Offload 4K/8K pixel matrix bitwise operations from main UI thread
  - [ ] Implement progress callback percentage (0-100%)

## 🎯 Phase 3: Forensic Steganalysis Tools
- [ ] `src/components/forensics/BitPlaneViewer.tsx`: Interactive bit plane slice selector
- [ ] `src/components/forensics/HistogramDifference.tsx`: Pixel variance calculation
