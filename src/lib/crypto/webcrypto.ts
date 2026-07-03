// WebCrypto-based primitives. All operations are client-side.

const enc = new TextEncoder();
const dec = new TextDecoder();

export const toB64 = (buf: ArrayBuffer | Uint8Array): string => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
};

export const fromB64 = (b64: string): Uint8Array => {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

export const toHex = (buf: ArrayBuffer | Uint8Array): string => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const randomBytes = (len: number): Uint8Array =>
  crypto.getRandomValues(new Uint8Array(len));

// ---------- Hashing ----------
export type HashAlgo = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export const digest = async (algo: HashAlgo, data: string | ArrayBuffer): Promise<string> => {
  const buf = typeof data === 'string' ? enc.encode(data) : data;
  const h = await crypto.subtle.digest(algo, buf);
  return toHex(h);
};

export const hmac = async (algo: HashAlgo, key: string, message: string): Promise<string> => {
  const k = await crypto.subtle.importKey(
    'raw', enc.encode(key), { name: 'HMAC', hash: algo }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', k, enc.encode(message));
  return toHex(sig);
};

// ---------- KDF ----------
export const deriveAesKey = async (
  password: string,
  salt: Uint8Array,
  iterations = 250_000
): Promise<CryptoKey> => {
  const material = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// ---------- AES-GCM ----------
export interface AesBundle {
  v: 1;
  alg: 'AES-GCM-256';
  salt: string; // b64
  iv: string;   // b64
  ct: string;   // b64
  iter: number;
}

export const aesEncrypt = async (plaintext: string | ArrayBuffer, password: string): Promise<AesBundle> => {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const iter = 250_000;
  const key = await deriveAesKey(password, salt, iter);
  const data = typeof plaintext === 'string' ? enc.encode(plaintext) : new Uint8Array(plaintext);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, data as BufferSource);
  return { v: 1, alg: 'AES-GCM-256', salt: toB64(salt), iv: toB64(iv), ct: toB64(ct), iter };
};

export const aesDecrypt = async (bundle: AesBundle, password: string): Promise<Uint8Array> => {
  const salt = fromB64(bundle.salt);
  const iv = fromB64(bundle.iv);
  const key = await deriveAesKey(password, salt, bundle.iter ?? 250_000);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, fromB64(bundle.ct) as BufferSource);
  return new Uint8Array(pt);
};

export const aesDecryptText = async (bundle: AesBundle, password: string): Promise<string> => {
  const buf = await aesDecrypt(bundle, password);
  return dec.decode(buf);
};

// ---------- Password generator ----------
export interface PwdOptions {
  length: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
}

export const generatePassword = (opts: PwdOptions): string => {
  const pools: string[] = [];
  if (opts.upper) pools.push('ABCDEFGHJKLMNPQRSTUVWXYZ');
  if (opts.lower) pools.push('abcdefghijkmnpqrstuvwxyz');
  if (opts.digits) pools.push('23456789');
  if (opts.symbols) pools.push('!@#$%^&*()-_=+[]{};:,.?/');
  if (pools.length === 0) return '';
  const all = pools.join('');
  const out: string[] = [];
  // Guarantee one from each pool
  const rand = randomBytes(opts.length * 2);
  let r = 0;
  for (const pool of pools) {
    out.push(pool[rand[r++] % pool.length]);
  }
  for (let i = out.length; i < opts.length; i++) {
    out.push(all[rand[r++] % all.length]);
  }
  // Fisher-Yates shuffle
  for (let i = out.length - 1; i > 0; i--) {
    const j = rand[r++ % rand.length] % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join('');
};

export const estimateEntropy = (pwd: string): number => {
  let pool = 0;
  if (/[a-z]/.test(pwd)) pool += 26;
  if (/[A-Z]/.test(pwd)) pool += 26;
  if (/[0-9]/.test(pwd)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pwd)) pool += 32;
  return pwd.length * Math.log2(pool || 1);
};
