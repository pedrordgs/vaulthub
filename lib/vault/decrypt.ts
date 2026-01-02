import { createDecipheriv, createHmac, timingSafeEqual } from "crypto";
import { VAULT_HEADER, VAULT_VERSION, VAULT_CIPHER, SALT_LENGTH, HMAC_LENGTH } from "./constants";
import { deriveKeys } from "./utils";

/**
 * Parses Ansible Vault formatted string and extracts salt, hmac, and ciphertext.
 * 
 * Ansible-vault format:
 * 1. Header line: $ANSIBLE_VAULT;1.1;AES256
 * 2. Body: hexlify(salt_hex + "\n" + hmac_hex + "\n" + ciphertext_hex)
 *    - The body is hex-decoded to get: "salt_hex\nhmac_hex\nciphertext_hex"
 *    - Each component (salt, hmac, ciphertext) is then hex-decoded separately
 */
function parseVaultData(encryptedText: string): { salt: Buffer; hmac: Buffer; ciphertext: Buffer } {
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

  // First hex-decode to get the inner payload (which contains newline-separated hex strings)
  const innerPayload = Buffer.from(hexData, "hex").toString("utf8");
  
  // Split by newlines to get salt_hex, hmac_hex, ciphertext_hex
  const parts = innerPayload.split("\n");
  
  // Ansible vault format requires exactly 3 parts: salt, hmac, and ciphertext
  if (parts.length !== 3) {
    throw new Error("Invalid vault format: expected exactly salt, hmac, and ciphertext separated by newlines");
  }

  const saltHex = parts[0];
  const hmacHex = parts[1];
  const ciphertextHex = parts[2];

  // Validate each hex component
  if (!/^[0-9a-fA-F]*$/.test(saltHex) || !/^[0-9a-fA-F]*$/.test(hmacHex) || !/^[0-9a-fA-F]*$/.test(ciphertextHex)) {
    throw new Error("Invalid vault format: components contain non-hexadecimal characters");
  }

  const salt = Buffer.from(saltHex, "hex");
  const hmac = Buffer.from(hmacHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");

  // Validate sizes
  if (salt.length !== SALT_LENGTH) {
    throw new Error(`Invalid vault format: salt should be ${SALT_LENGTH} bytes, got ${salt.length}`);
  }
  if (hmac.length !== HMAC_LENGTH) {
    throw new Error(`Invalid vault format: HMAC should be ${HMAC_LENGTH} bytes, got ${hmac.length}`);
  }
  if (ciphertext.length === 0) {
    throw new Error("Invalid vault format: ciphertext is empty");
  }

  return { salt, hmac, ciphertext };
}

/**
 * Verifies HMAC in constant time to prevent timing attacks
 */
function verifyHmac(expectedHmac: Buffer, actualHmac: Buffer): boolean {
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
 * Removes PKCS#7 padding from decrypted buffer.
 * Throws if padding is invalid.
 */
function pkcs7Unpad(buf: Buffer): Buffer {
  if (buf.length === 0) {
    throw new Error("Invalid padding: empty buffer");
  }
  
  const padLen = buf[buf.length - 1]!;
  
  if (padLen < 1 || padLen > 16) {
    throw new Error("Invalid padding: pad byte out of range");
  }
  
  if (buf.length < padLen) {
    throw new Error("Invalid padding: buffer too short");
  }
  
  // Verify all padding bytes have the correct value
  for (let i = buf.length - padLen; i < buf.length; i++) {
    if (buf[i] !== padLen) {
      throw new Error("Invalid padding: incorrect padding bytes");
    }
  }
  
  return buf.subarray(0, buf.length - padLen);
}

/**
 * Decrypts an Ansible vault string back to plain text.
 * 
 * Uses AES-256-CTR decryption with PKCS7 unpadding, PBKDF2 key derivation,
 * and HMAC-SHA256 verification over ciphertext only.
 * 
 * This implementation is 100% compatible with ansible-vault decrypt.
 * 
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
    const { salt, hmac: storedHmac, ciphertext } = parseVaultData(encryptedText);

    // Derive keys from password
    const { encryptionKey, hmacKey, iv } = await deriveKeys(password, salt);

    // Verify HMAC before decryption (authenticate-then-decrypt)
    // Ansible-vault uses HMAC over ciphertext only
    const computedHmac = createHmac("sha256", hmacKey)
      .update(ciphertext)
      .digest();

    if (!verifyHmac(storedHmac, computedHmac)) {
      throw new Error("HMAC verification failed: incorrect password or corrupted data");
    }

    // Decrypt using AES-256-CTR
    const decipher = createDecipheriv("aes-256-ctr", encryptionKey, iv);
    const paddedPlaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    // Remove PKCS7 padding
    const plaintext = pkcs7Unpad(paddedPlaintext);

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
      if (error.message.includes("Invalid padding")) {
        throw new Error("Unable to decrypt content. Please check the password and format.");
      }
    }

    throw new Error("Unable to decrypt content. Please check the password and format.", {
      cause: error,
    });
  }
}
