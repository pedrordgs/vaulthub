import { pbkdf2 } from "crypto";
import { promisify } from "util";
import { PBKDF2_ITERATIONS, KEY_LENGTH, HMAC_LENGTH, IV_LENGTH } from "./constants";

const pbkdf2Async = promisify(pbkdf2);

/**
 * Derives cryptographic keys from password using PBKDF2-HMAC-SHA256
 */
export async function deriveKeys(password: string, salt: Buffer): Promise<{
  encryptionKey: Buffer;
  hmacKey: Buffer;
  iv: Buffer;
}> {
  // Derive 80 bytes total: 32 for encryption key + 32 for HMAC key + 16 for IV
  const derivedKey = await pbkdf2Async(
    password,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH + HMAC_LENGTH + IV_LENGTH,
    "sha256"
  );

  return {
    encryptionKey: derivedKey.subarray(0, KEY_LENGTH),
    hmacKey: derivedKey.subarray(KEY_LENGTH, KEY_LENGTH + HMAC_LENGTH),
    iv: derivedKey.subarray(KEY_LENGTH + HMAC_LENGTH, KEY_LENGTH + HMAC_LENGTH + IV_LENGTH),
  };
}
