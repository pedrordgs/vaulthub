import { createCipheriv, createHmac, randomBytes } from "crypto";
import { VAULT_HEADER, VAULT_VERSION, VAULT_CIPHER, SALT_LENGTH } from "./constants";
import { deriveKeys } from "./utils";

/**
 * Applies PKCS7 padding to plaintext buffer
 * Pads to AES block size (16 bytes)
 */
function pkcs7Pad(data: Buffer): Buffer {
  const blockSize = 16;
  const padLength = blockSize - (data.length % blockSize);
  const padding = Buffer.alloc(padLength, padLength);
  return Buffer.concat([data, padding]);
}

/**
 * Formats encrypted data into Ansible Vault format with proper line wrapping.
 * 
 * Ansible-vault format:
 * 1. Header line: $ANSIBLE_VAULT;1.1;AES256
 * 2. Body: hexlify(salt_hex + "\n" + hmac_hex + "\n" + ciphertext_hex)
 *    - salt, hmac, ciphertext are each hex-encoded
 *    - joined by newlines
 *    - the whole string is then hex-encoded again
 * 3. The final hex string is split into 80-character lines
 */
function formatVaultData(salt: Buffer, hmac: Buffer, ciphertext: Buffer): string {
  const header = `${VAULT_HEADER};${VAULT_VERSION};${VAULT_CIPHER}`;
  const lineLength = 80;

  // Ansible format: hex-encode each component, join with newlines, then hex-encode the whole thing
  const saltHex = salt.toString("hex");
  const hmacHex = hmac.toString("hex");
  const ciphertextHex = ciphertext.toString("hex");

  // Join with newlines as UTF-8 bytes
  const innerPayload = `${saltHex}\n${hmacHex}\n${ciphertextHex}`;
  
  // Hex-encode the entire payload (including the newline characters)
  const hexData = Buffer.from(innerPayload, "utf8").toString("hex");

  const lines = [header];

  // Split hex data into 80-character lines
  for (let i = 0; i < hexData.length; i += lineLength) {
    lines.push(hexData.slice(i, i + lineLength));
  }

  return lines.join("\n");
}

/**
 * Encrypts plain text using Ansible vault format ($ANSIBLE_VAULT;1.1;AES256).
 * 
 * Uses AES-256-CTR encryption with PKCS7 padding, PBKDF2 key derivation,
 * and HMAC-SHA256 authentication over ciphertext only.
 * 
 * This implementation is 100% compatible with ansible-vault encrypt_string.
 * 
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

    // Apply PKCS7 padding to plaintext (ansible-vault pads before CTR encryption)
    const paddedPlaintext = pkcs7Pad(Buffer.from(plainText, "utf8"));

    // Encrypt plaintext using AES-256-CTR
    const cipher = createCipheriv("aes-256-ctr", encryptionKey, iv);
    const ciphertext = Buffer.concat([
      cipher.update(paddedPlaintext),
      cipher.final(),
    ]);

    // Create HMAC for authentication (ciphertext only - ansible-vault format)
    const hmac = createHmac("sha256", hmacKey);
    hmac.update(ciphertext);
    const hmacDigest = hmac.digest();

    // Format into ansible-vault format
    const formattedVault = formatVaultData(salt, hmacDigest, ciphertext);

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
