import { createCipheriv, createHmac, pbkdf2, randomBytes } from "crypto";
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
 * Formats encrypted data into Ansible Vault format with proper line wrapping
 */
function formatVaultData(hexData: string): string {
  const header = `${VAULT_HEADER};${VAULT_VERSION};${VAULT_CIPHER}`;
  const lineLength = 80;
  const lines = [header];

  // Split hex data into 80-character lines
  for (let i = 0; i < hexData.length; i += lineLength) {
    lines.push(hexData.slice(i, i + lineLength));
  }

  return lines.join("\n");
}

/**
 * Encrypts plain text using Ansible vault format ($ANSIBLE_VAULT;1.1;AES256).
 * Uses AES-256-CTR encryption with PBKDF2 key derivation and HMAC authentication.
 * Errors are sanitized to avoid leaking sensitive data.
 */
export async function encryptVaultString(
  plainText: string,
  password: string,
): Promise<string> {
  try {
    // Validate inputs
    if (!plainText || typeof plainText !== "string") {
      throw new Error("Plain text must be a non-empty string");
    }
    if (!password || typeof password !== "string") {
      throw new Error("Password must be a non-empty string");
    }

    // Generate random salt
    const salt = randomBytes(SALT_LENGTH);

    // Derive encryption keys from password
    const { encryptionKey, hmacKey, iv } = await deriveKeys(password, salt);

    // Encrypt plaintext using AES-256-CTR
    const cipher = createCipheriv("aes-256-ctr", encryptionKey, iv);
    const ciphertext = Buffer.concat([
      cipher.update(plainText, "utf8"),
      cipher.final(),
    ]);

    // Create HMAC for authentication (salt + ciphertext)
    const hmac = createHmac("sha256", hmacKey);
    hmac.update(salt);
    hmac.update(ciphertext);
    const hmacDigest = hmac.digest();

    // Combine: salt + hmac + ciphertext
    const vaultData = Buffer.concat([salt, hmacDigest, ciphertext]);

    // Convert to hex and format with proper line wrapping
    const hexData = vaultData.toString("hex");
    const formattedVault = formatVaultData(hexData);

    return formattedVault;
  } catch (error) {
    // Sanitize error to prevent leaking sensitive data
    if (error instanceof Error && error.message.includes("string")) {
      throw error; // Re-throw validation errors
    }
    throw new Error("Unable to encrypt content. Please verify input and try again.", {
      cause: error,
    });
  }
}

