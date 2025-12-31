import { createDecipheriv, createHmac, pbkdf2, timingSafeEqual } from "crypto";
import { promisify } from "util";

const pbkdf2Async = promisify(pbkdf2);

// Ansible Vault 1.1 constants
const VAULT_HEADER = "$ANSIBLE_VAULT";
const VAULT_VERSION = "1.1";
const VAULT_CIPHER = "AES256";
const PBKDF2_ITERATIONS = 10000;
const KEY_LENGTH = 32; // 256 bits for AES256
const IV_LENGTH = 16; // 128 bits for AES CTR mode
const SALT_LENGTH = 32; // 256 bits
const HMAC_LENGTH = 32; // 256 bits (SHA256)

/**
 * Derives cryptographic keys from password using PBKDF2-HMAC-SHA256
 */
async function deriveKeys(password: string, salt: Buffer): Promise<{
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

/**
 * Parses Ansible Vault formatted string and extracts hex data
 */
function parseVaultData(encryptedText: string): Buffer {
  const trimmed = encryptedText.trim();
  const lines = trimmed.split("\n");

  // Validate header
  if (lines.length < 2) {
    throw new Error("Invalid vault format: too short");
  }

  const header = lines[0];
  const expectedHeader = `${VAULT_HEADER};${VAULT_VERSION};${VAULT_CIPHER}`;

  const normalizedHeader = header.replace(/\r/g, "").trim();

  if (normalizedHeader !== expectedHeader) {
    throw new Error(`Invalid vault format: expected "${expectedHeader}", got "${header}"`);
  }

  // Combine all data lines (everything after header)
  const hexData = lines.slice(1).join("").replace(/\s+/g, "");

  // Validate hex string
  if (!/^[0-9a-fA-F]+$/.test(hexData)) {
    throw new Error("Invalid vault format: contains non-hexadecimal characters");
  }

  const vaultData = Buffer.from(hexData, "hex");

  // Validate minimum length (salt + hmac + at least 1 byte ciphertext)
  const minLength = SALT_LENGTH + HMAC_LENGTH + 1;
  if (vaultData.length < minLength) {
    throw new Error(`Invalid vault format: data too short (minimum ${minLength} bytes required)`);
  }

  return vaultData;
}

/**
 * Verifies HMAC in constant time to prevent timing attacks
 */
function verifyHmac(
  expectedHmac: Buffer,
  actualHmac: Buffer,
): boolean {
  if (expectedHmac.length !== actualHmac.length) {
    return false;
  }

  try {
    return timingSafeEqual(expectedHmac, actualHmac);
  } catch {
    return false;
  }
}

/**
 * Decrypts an Ansible vault string back to plain text.
 * Uses AES-256-CTR decryption with PBKDF2 key derivation and HMAC verification.
 * Errors are sanitized to avoid leaking sensitive data.
 */
export async function decryptVaultString(
  encryptedText: string,
  password: string,
): Promise<string> {
  try {
    // Validate inputs
    if (!encryptedText || typeof encryptedText !== "string") {
      throw new Error("Encrypted text must be a non-empty string");
    }
    if (!password || typeof password !== "string") {
      throw new Error("Password must be a non-empty string");
    }

    // Parse and validate vault format
    const vaultData = parseVaultData(encryptedText);

    // Extract components
    const salt = vaultData.subarray(0, SALT_LENGTH);
    const storedHmac = vaultData.subarray(SALT_LENGTH, SALT_LENGTH + HMAC_LENGTH);
    const ciphertext = vaultData.subarray(SALT_LENGTH + HMAC_LENGTH);

    // Derive keys from password
    const { encryptionKey, hmacKey, iv } = await deriveKeys(password, salt);

    // Verify HMAC before decryption (authenticate-then-decrypt)
    const hmac = createHmac("sha256", hmacKey);
    hmac.update(salt);
    hmac.update(ciphertext);
    const computedHmac = hmac.digest();

    if (!verifyHmac(storedHmac, computedHmac)) {
      throw new Error("HMAC verification failed: incorrect password or corrupted data");
    }

    // Decrypt ciphertext using AES-256-CTR
    const decipher = createDecipheriv("aes-256-ctr", encryptionKey, iv);
    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return plaintext.toString("utf8");
  } catch (error) {
    // Sanitize error messages
    if (error instanceof Error) {
      if (error.message.includes("HMAC verification failed")) {
        throw new Error("Unable to decrypt content. Please check the password and format.");
      }
      if (error.message.includes("Invalid vault format")) {
        throw error; // Re-throw format validation errors
      }
      if (error.message.includes("string")) {
        throw error; // Re-throw input validation errors
      }
    }

    throw new Error("Unable to decrypt content. Please check the password and format.", {
      cause: error,
    });
  }
}

