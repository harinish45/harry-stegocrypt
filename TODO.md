# 📋 TODO & Master Plan — harry-stegocrypt

> **Project**: HarryStegoСrypt — Cyber Forensic & Cryptographic Steganography Engine
> **Stack**: TypeScript, React, Vite, Supabase
> **Status**: 🟡 In Progress (~60%)
> **Last Updated**: 2026-10-30

## 🏗️ Architecture
\\\
harry-stegocrypt/
├── src/
│   ├── components/    # React UI components
│   ├── lib/           # Core steganography logic
│   ├── hooks/         # React custom hooks
│   └── pages/         # App pages/routes
├── public/            # Static assets
├── supabase/          # DB migrations & functions
├── index.html         # Entry point
└── package.json
\\\

## ✅ Completed
- [x] Vite + React + TypeScript setup
- [x] Tailwind CSS + shadcn/ui components
- [x] Supabase project integration
- [x] PRD + AGENTS.md
- [x] LICENSE

## 🔧 In Progress
- [ ] Core AES-256 encryption module
- [ ] LSB steganography (image carrier)
- [ ] File upload UI

## 🚀 Roadmap

### Phase 1 — Core Crypto Engine (Nov 2026)
- [ ] AES-256-GCM encryption/decryption
- [ ] Key derivation (PBKDF2 / Argon2)
- [ ] LSB pixel steganography (PNG)
- [ ] JPEG DCT coefficient steganography
- [ ] Payload size calculator

### Phase 2 — Forensic Tools (Nov–Dec 2026)
- [ ] High-entropy region detector
- [ ] Chi-square statistical analysis
- [ ] Visual attack (image difference viewer)
- [ ] Histogram analysis
- [ ] File format anomaly detector

### Phase 3 — Advanced Stego (Jan 2027)
- [ ] Audio WAV steganography (phase coding)
- [ ] PDF steganography (whitespace encoding)
- [ ] Multi-layer nested stego
- [ ] Plausible deniability (decoy payload)

### Phase 4 — Forensic Platform (Feb 2027)
- [ ] Batch file scanning
- [ ] Case management (Supabase)
- [ ] Report generation (PDF export)
- [ ] Chain-of-custody audit log
- [ ] API endpoints for DFIR teams

## 🐛 Known Issues
- [ ] .env file committed (should be .gitignore'd)
- [ ] No test suite
- [ ] Missing CI/CD pipeline