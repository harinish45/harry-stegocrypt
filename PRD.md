# 📋 Product Requirements Document (PRD)
## Project: Harry StegoCrypt (Cyber Forensic & Cryptographic Steganography Suite)
**Version:** 1.5.0-PROD  
**Owner:** Harinish S V ([@harinish45](https://github.com/harinish45))

---

## 1. Problem Statement
Steganography tools are often either command-line only (steghide) or simple web toys that alter images visibly and store sensitive files on third-party servers. Cybersecurity researchers, digital forensic investigators, and privacy advocates require a zero-trust, client-side cryptographic steganography workbench with real-time detection analysis.

## 2. Core Functional Requirements
1. **LSB Encoding & Decoding Engine:**
   - Embed arbitrary binary files into PNG/WebP alpha and color channels.
   - Dynamic pseudo-random spread across pixel addresses using seed derived from passkey.
2. **Cryptographic Pre-Processing:**
   - PBKDF2 with 100,000 iterations for master key derivation.
   - AES-256-GCM authenticated cipher with ephemeral IV.
3. **Forensic Steganalysis Workbench:**
   - Bit plane visualizer (extract individual bit planes 0–7 for R, G, B channels).
   - Chi-Square attack detection curve to quantify risk of detection.
   - Dual-image pixel difference heat map (Original vs Stego image).
