/**
 * Field-level encryption for PHI (Protected Health Information).
 *
 * Standard: AES-256-GCM (authenticated encryption with associated data).
 * This exceeds the HIPAA Security Rule encryption requirement (45 CFR §164.312(a)(2)(iv))
 * and aligns with NIST SP 800-111 and FIPS 140-2 guidelines for sensitive data at rest.
 *
 * How it works:
 *  1. A random 12-byte IV (nonce) is generated for every encryption operation.
 *  2. AES-256-GCM encrypts the plaintext and produces a 16-byte authentication tag.
 *  3. The stored value is: base64(iv) + ':' + base64(ciphertext+tag)
 *  4. Decryption verifies the tag before returning plaintext — any tampering is detected.
 *
 * Key management:
 *  - Set FIELD_ENCRYPTION_KEY to a 64-character hex string (32 bytes / 256 bits).
 *  - Generate with: openssl rand -hex 32
 *  - Rotate by re-encrypting all affected rows with the new key.
 *  - Never commit the key to source control.
 *
 * Usage:
 *  import { encryptField, decryptField, isEncrypted } from '@/lib/crypto'
 *
 *  // Encrypt before writing to DB:
 *  const encrypted = await encryptField(sensitiveValue)
 *
 *  // Decrypt after reading from DB:
 *  const plaintext = await decryptField(encrypted)
 *
 *  // Check if a value is already encrypted (safe to call repeatedly):
 *  if (!isEncrypted(value)) { ... }
 */

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256 // bits
const IV_LENGTH = 12  // bytes — recommended for GCM
const TAG_LENGTH = 128 // bits — GCM authentication tag

/** Sentinel prefix so we can detect encrypted values without attempting decryption */
const ENCRYPTED_PREFIX = 'enc:'

/**
 * Derive a CryptoKey from the hex-encoded FIELD_ENCRYPTION_KEY env var.
 * Cached after first call.
 */
let _cachedKey: CryptoKey | null = null

async function getEncryptionKey(): Promise<CryptoKey> {
  if (_cachedKey) return _cachedKey

  const hexKey = process.env.FIELD_ENCRYPTION_KEY
  if (!hexKey || hexKey.length !== 64) {
    throw new Error(
      '[crypto] FIELD_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
      'Generate with: openssl rand -hex 32'
    )
  }

  // Decode hex → Uint8Array
  const keyBytes = new Uint8Array(
    hexKey.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
  )

  _cachedKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,   // not extractable
    ['encrypt', 'decrypt']
  )

  return _cachedKey
}

/**
 * Encrypt a UTF-8 string using AES-256-GCM.
 * Returns a string safe to store in the database.
 */
export async function encryptField(plaintext: string): Promise<string> {
  if (!plaintext) return plaintext

  const key = await getEncryptionKey()
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encoded = new TextEncoder().encode(plaintext)

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
    key,
    encoded
  )

  const ivB64 = Buffer.from(iv).toString('base64')
  const cipherB64 = Buffer.from(cipherBuffer).toString('base64')

  return `${ENCRYPTED_PREFIX}${ivB64}:${cipherB64}`
}

/**
 * Decrypt a value encrypted by encryptField.
 * If the value is not encrypted (no sentinel prefix), returns it unchanged —
 * this handles legacy plaintext rows during a migration.
 */
export async function decryptField(stored: string): Promise<string> {
  if (!stored || !stored.startsWith(ENCRYPTED_PREFIX)) return stored

  const payload = stored.slice(ENCRYPTED_PREFIX.length)
  const colonIdx = payload.indexOf(':')
  if (colonIdx === -1) throw new Error('[crypto] Malformed encrypted field — missing IV separator')

  const iv = Buffer.from(payload.slice(0, colonIdx), 'base64')
  const cipherBuffer = Buffer.from(payload.slice(colonIdx + 1), 'base64')

  const key = await getEncryptionKey()

  let plainBuffer: ArrayBuffer
  try {
    plainBuffer = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
      key,
      cipherBuffer
    )
  } catch {
    throw new Error('[crypto] Decryption failed — data may be corrupted or key is incorrect')
  }

  return new TextDecoder().decode(plainBuffer)
}

/**
 * Returns true if the stored value was encrypted by encryptField.
 * Use this to avoid double-encrypting values.
 */
export function isEncrypted(value: string): boolean {
  return typeof value === 'string' && value.startsWith(ENCRYPTED_PREFIX)
}

/**
 * Encrypt only if not already encrypted.
 * Idempotent — safe to call on values that may or may not be encrypted.
 */
export async function encryptIfNeeded(value: string): Promise<string> {
  if (!value || isEncrypted(value)) return value
  return encryptField(value)
}
