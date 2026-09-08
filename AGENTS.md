# 🤖 AI Agent Engineering Guidelines

1. **Zero Server Transmission:** Never add network fetch or analytics calls transmitting raw or stego image data. Everything must remain client-side.
2. **Lossless Encoders Only:** Always export processed images as PNG or lossless WebP. Lossy JPEG compression destroys LSB payloads.
3. **Responsive UI:** Web Workers must be used for pixel iterations over 1 megapixel to prevent UI thread freezing.
