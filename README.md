<div align="center">

# 🔐 HarryStegoСrypt

**Cyber Forensic & Cryptographic Steganography Suite**

[![CI](https://github.com/harinish45/harry-stegocrypt/actions/workflows/ci.yml/badge.svg)](https://github.com/harinish45/harry-stegocrypt/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?logo=vite&logoColor=white)](https://vite.dev)

> *Next-gen browser-based steganography engine with AES-256 encryption, pixel-level payload embedding, and forensic detection tools*

[📋 TODO](TODO.md) · [📄 PRD](PRD.md) · [🔍 Live Demo](#)

</div>

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph UI["🖥️ React Frontend (Vite + TypeScript)"]
        EncryptUI["🔐 Encrypt & Hide\nPayload UI"]
        DecryptUI["🔓 Extract & Decrypt\nUI"]
        ForensicUI["🔬 Forensic Analysis\nDashboard"]
    end

    subgraph Core["⚙️ Core Engine (TypeScript)"]
        CryptoEngine["🔑 AES-256-GCM\nEncryption Engine"]
        StegoEngine["🖼️ Steganography\nEngine"]
        ForensicEngine["🔍 Forensic\nDetection Engine"]
    end

    subgraph Stego["📸 Stego Channels"]
        LSB["LSB Pixel\nEmbedding (PNG)"]
        DCT["DCT Coefficient\nEmbedding (JPEG)"]
        Audio["Phase Coding\n(WAV Audio)"]
    end

    subgraph Forensic["🔬 Forensic Tools"]
        Entropy["High-Entropy\nDetector"]
        ChiSq["Chi-Square\nAnalysis"]
        Visual["Visual Attack\n(Diff Viewer)"]
        Histogram["Histogram\nAnalysis"]
    end

    subgraph Backend["☁️ Supabase"]
        Auth["Authentication"]
        Cases["Case Management"]
        AuditLog["Audit Log"]
    end

    EncryptUI --> CryptoEngine
    EncryptUI --> StegoEngine
    DecryptUI --> StegoEngine
    DecryptUI --> CryptoEngine
    ForensicUI --> ForensicEngine
    StegoEngine --> LSB
    StegoEngine --> DCT
    StegoEngine --> Audio
    ForensicEngine --> Entropy
    ForensicEngine --> ChiSq
    ForensicEngine --> Visual
    ForensicEngine --> Histogram
    UI --> Backend
```

---

## 🔐 Encryption + Embedding Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Crypto Engine
    participant S as Stego Engine
    participant I as Image File

    U->>C: Plaintext payload + password
    C->>C: Derive key (PBKDF2/Argon2)
    C->>C: AES-256-GCM encrypt
    C-->>S: Encrypted ciphertext
    U->>S: Carrier image (PNG/JPEG)
    S->>I: Read pixel data
    S->>I: Embed ciphertext via LSB
    S-->>U: Stego image (visually identical)
```

---

## 🚀 Quick Start

```bash
git clone https://github.com/harinish45/harry-stegocrypt.git
cd harry-stegocrypt
npm install
npm run dev    # → http://localhost:5173
```

---

## 📁 Structure

```
harry-stegocrypt/
├── 🖥️  src/
│   ├── components/    # React UI components
│   ├── lib/           # Core crypto + stego logic
│   ├── hooks/         # React hooks
│   └── pages/         # App routes
├── ☁️  supabase/      # DB migrations
└── 🌐  public/        # Static assets
```

---

<div align="center">
⚠️ For authorized digital forensics use only · <a href="LICENSE">MIT License</a>
</div>