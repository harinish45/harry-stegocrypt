# 📋 TODO & Master Plan — harry-stegocrypt

> **Project**: HarryStegoСrypt — Cyber Forensic & Cryptographic Steganography Engine  
> **Stack**: TypeScript, React, Vite, Supabase  
> **Status**: 🟢 Core Engine & Forensics Complete (~85%)  
> **Last Updated**: 2026-10-31  

## 🏗️ Architecture
```
harry-stegocrypt/
├── src/
│   ├── components/    # React UI components (CapacityIndicator, Forensics, StegoCryptTabs)
│   ├── lib/           # Core cryptographic, steganographic, & forensic engines
│   │   ├── crypto/         # AES-256-GCM, PBKDF2 key derivation, error hierarchy
│   │   ├── steganography/  # LSB steganography, magic bytes header, capacity calculator
│   │   └── forensics/      # Shannon entropy, Chi-square steganalysis, visual diff, bitplanes
│   ├── hooks/         # React custom hooks
│   └── pages/         # App pages/routes (ForensicsPage, FileCryptoPage, Index)
├── tests/             # Vitest test suite (crypto, steganography, forensics)
├── public/            # Static assets
├── supabase/          # DB migrations & functions
├── index.html         # Entry point
└── package.json
```

## ✅ Completed
- [x] Vite + React + TypeScript setup
- [x] Tailwind CSS + shadcn/ui components
- [x] Supabase project integration
- [x] PRD + AGENTS.md
- [x] LICENSE
- [x] Core AES-256-GCM encryption/decryption module with PBKDF2 WebCrypto
- [x] LSB steganography engine with 'HSTG' magic header & 32-bit length prefix
- [x] Dynamic storage capacity calculator & utilization metrics
- [x] Shannon entropy analyzer (channel & block-level spatial heatmaps)
- [x] Chi-square statistical steganalysis (Pairs of Values & p-value calculation)
- [x] Visual diff detector (MSE, PSNR, amplified diff canvas)
- [x] Bit-plane visualizer (planes 0–7 across R, G, B, grayscale)
- [x] Comprehensive automated test suite (Vitest with 30 passing unit tests)
- [x] Resolved security issue: Untracked `.env` secret, created `.env.example`, updated `.gitignore`

## 🚀 Roadmap

### Phase 1 — Core Crypto Engine
- [x] AES-256-GCM authenticated encryption/decryption
- [x] Key derivation (PBKDF2 with SHA-256, configurable iterations)
- [x] LSB pixel steganography (Canvas/ImageData)
- [x] Payload size calculator
- [ ] JPEG DCT coefficient steganography

### Phase 2 — Forensic Tools
- [x] High-entropy region detector (block & channel Shannon entropy)
- [x] Chi-square statistical analysis (PoVs and p-value curve)
- [x] Visual attack (image difference viewer & heatmap)
- [x] Bit-plane extractor (0–7 bit planes visual inspection)
- [x] Histogram analysis
- [ ] File format anomaly detector

### Phase 3 — Advanced Stego (Future)
- [ ] Audio WAV steganography (phase coding)
- [ ] PDF steganography (whitespace encoding)
- [ ] Multi-layer nested stego
- [ ] Plausible deniability (decoy payload)

### Phase 4 — Forensic Platform (Future)
- [ ] Batch file scanning
- [ ] Case management (Supabase)
- [ ] Report generation (PDF export)
- [ ] Chain-of-custody audit log
- [ ] API endpoints for DFIR teams

## 🐛 Resolved Issues
- [x] `.env` file committed (resolved: removed from git index, added `.env.example` and gitignored)
- [x] No test suite (resolved: Vitest test suite configured with 30 unit tests)
