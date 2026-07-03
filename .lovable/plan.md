# StegoCrypt Pro — Major Feature Expansion

Goal: Turn the current app into a full client-side cybersecurity toolkit. No backend, no accounts — everything runs in the browser via WebCrypto + Web Workers. Keys never leave the device.

## New top-level navigation

Replace the 3-tab layout with a left sidebar (collapsible) containing grouped modules:

```
StegoCrypt Pro
├─ Steganography
│   ├─ Image (LSB + Adaptive)
│   ├─ Audio (WAV LSB)
│   ├─ PDF (metadata carrier)
│   └─ Batch encode / decode
├─ Cryptography
│   ├─ Text encrypt / decrypt
│   ├─ File encrypt / decrypt
│   ├─ Digital signatures (RSA / Ed25519)
│   └─ Hash & HMAC toolkit
├─ Vault
│   ├─ Password vault (AES-GCM, PBKDF2 master key)
│   ├─ Secure notes
│   └─ TOTP / 2FA generator
├─ Keys & Sharing
│   ├─ RSA / Ed25519 keychain
│   ├─ QR code key exchange
│   └─ One-time decrypt links (URL-fragment based)
├─ Forensics
│   ├─ Audit log (encrypted, exportable JSON)
│   ├─ Carrier fingerprint & tamper detection
│   ├─ Image diff + histogram / LSB visualizer
│   └─ Stego detection heuristics (chi-square, RS analysis)
└─ Security Analysis (existing, expanded)
```

## Feature detail

### 1. Deeper crypto tools
- **File encryption**: drag-drop any file → AES-256-GCM / ChaCha20-Poly1305 via WebCrypto, chunked streaming through a Web Worker with progress.
- **Digital signatures**: generate RSA-PSS and Ed25519 keypairs; sign/verify text and files; show fingerprint.
- **Hash & HMAC toolkit**: SHA-256/384/512, SHA-3, BLAKE2 (via `hash-wasm`), HMAC with any of the above, file hashing with progress.
- **Password vault**: AES-GCM encrypted JSON stored in IndexedDB, unlocked by a master password (PBKDF2-SHA256, 600k iters). Entries: title, username, password, URL, notes. Password generator with entropy meter.
- **TOTP/2FA generator**: add issuer + secret (or scan QR from image), show rotating 6-digit codes with countdown ring.
- **Secure notes**: same vault, markdown-rendered read-only view.

### 2. Advanced steganography
- **Adaptive LSB**: distribute bits across high-variance regions to reduce visual artifacts; toggle vs. classic LSB.
- **Multi-bit LSB (1/2/3 bits per channel)** with live capacity + PSNR estimate.
- **Audio steganography**: WAV LSB encode/decode using Web Audio API.
- **PDF metadata carrier**: embed ciphertext in PDF `/Keywords` or a custom dictionary entry (using `pdf-lib`).
- **Batch mode**: drop N images, apply encode/decode with a shared key, download as ZIP (`jszip`).
- **Carrier preview**: before/after image, difference map, per-channel histogram, LSB plane visualization.

### 3. Audit & forensics
- **Encrypted audit log**: every action (encrypt, decrypt, embed, extract, key gen, vault unlock) appended to an AES-GCM log in IndexedDB, keyed off the master password. Export/import as `.stegolog.json`.
- **Carrier fingerprint**: SHA-256 of original + stego image stored in metadata; verify against a suspected tampered copy.
- **Tamper detection dashboard**: upload a stego image → run integrity check (fingerprint match, HMAC of ciphertext, hash of decrypted plaintext).
- **Stego detection heuristics** (analyst mode): chi-square test and simplified RS analysis to estimate whether an arbitrary image likely contains LSB payload; show confidence score.

### 4. Sharing & keys
- **Keychain manager**: create/import/export RSA and Ed25519 keys (PEM + JWK). Public keys have a short fingerprint + color-hash avatar.
- **QR key exchange**: render public key as QR (chunked if large); scan via camera (`html5-qrcode`) to import a contact's public key.
- **Hybrid encryption**: encrypt symmetric key with recipient's RSA public key; ciphertext bundle includes wrapped key + IV + algorithm tag.
- **One-time decrypt links**: bundle ciphertext + metadata into a URL fragment (`#data=...`) — data never hits any server because fragments aren't sent in HTTP requests. Optional passphrase gate.

### 5. Polish (carries over from prior rounds)
- Web Workers for all heavy ops (encryption, hashing, stego, PDF, audio) — keep UI at 60fps.
- Skeleton screens + LoadingProgress everywhere.
- i18n coverage extended to every new label/tooltip in all 6 languages.
- All 5 themes styled for new modules.
- Keyboard shortcuts: `Ctrl/⌘+E` encrypt, `Ctrl/⌘+D` decrypt, `Ctrl/⌘+K` command palette.
- Command palette (`cmdk`) for quick navigation.

## Technical details

**New dependencies**
- `hash-wasm` — SHA-3, BLAKE2, fast SHA-256/512
- `pdf-lib` — PDF carrier
- `jszip` — batch download
- `html5-qrcode` — QR scanning
- `qrcode` — QR generation
- `otpauth` — TOTP
- `idb` — typed IndexedDB wrapper
- `cmdk` — command palette (shadcn variant)

**Storage model (client-only)**
- IndexedDB DB `stegocrypt` with stores: `vault`, `keychain`, `auditLog`, `settings`.
- Every store encrypted at the record level with keys derived from the master password (PBKDF2 → AES-GCM). No plaintext at rest.
- Master password never stored; only a PBKDF2 verifier hash.

**Crypto migration**
- Replace CryptoJS-based `encryptionAdvanced.ts` with WebCrypto (`SubtleCrypto`) for AES-GCM, RSA-OAEP, RSA-PSS, ECDSA, HKDF. Keep ChaCha20-Poly1305 via `@noble/ciphers` (small, audited).
- All keys imported as non-extractable `CryptoKey` where possible.

**Architecture**
- `src/lib/crypto/` — pure crypto modules (aes.ts, rsa.ts, chacha.ts, hash.ts, kdf.ts, sign.ts).
- `src/lib/stego/` — image.ts, audio.ts, pdf.ts, analysis.ts.
- `src/lib/vault/` — vault.ts, audit.ts, storage.ts (idb wrapper).
- `src/workers/` — cryptoWorker.ts (expand), stegoWorker.ts (new), analysisWorker.ts (new).
- Layout switches to `SidebarProvider` (already in shadcn) with a top bar retaining Language • Theme • Preferences.

## Build order

1. **Foundation**: sidebar layout, command palette, WebCrypto migration, expanded worker infra.
2. **Vault + keychain + audit log** (IndexedDB, master password flow).
3. **File encryption + digital signatures + hash toolkit**.
4. **Advanced stego**: adaptive LSB, multi-bit, histogram/diff viewer, batch mode.
5. **Audio + PDF carriers + stego detection heuristics**.
6. **Sharing**: QR key exchange, hybrid encryption, one-time links, TOTP.
7. **i18n sweep, theme pass, keyboard shortcuts, polish**.

## Out of scope (this round)
- Any server, account, or cloud sync.
- Video steganography (large; future round).
- Post-quantum algorithms (future round once WebCrypto ships them).
