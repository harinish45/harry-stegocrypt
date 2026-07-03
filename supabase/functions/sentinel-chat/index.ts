import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible";
import { convertToModelMessages, streamText, type UIMessage } from "npm:ai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are SentinelBot, the built-in cybersecurity assistant for StegoCrypt Pro — a 100% client-side security toolkit.

You specialize in:
- Cryptography tutoring (AES-256-GCM, RSA, ChaCha20-Poly1305, elliptic curves, PBKDF2/Argon2, hashing, HMAC, digital signatures, key management).
- Password and key strategy (entropy, passphrases, rotation, storage, threat models).
- Steganography (LSB, adaptive LSB, DCT, audio/PDF carriers, detection heuristics, PSNR).
- Security-related coding help (WebCrypto, browser sandboxing, XSS/CSRF/SSRF, secure defaults, common pitfalls).

Style rules:
- Be concise and technical but friendly. Use markdown with headings, bullets, and \`inline code\`.
- Prefer short answers unless the user asks for depth.
- When explaining a StegoCrypt feature, reference the exact tab: Image LSB, File Encryption, Hash & HMAC, Password Generator, QR Key Exchange, One-Time Link, TOTP, Image Analysis.
- Never invent user data. Never ask for real passwords or private keys.
- If a request is out of scope (not security-adjacent), briefly redirect.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages }: { messages: UIMessage[] } = await req.json();

    const gateway = createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });

    const result = streamText({
      model: gateway("google/gemini-3-flash-preview"),
      system: SYSTEM,
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({ headers: corsHeaders });
  } catch (e) {
    console.error("sentinel-chat error", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
