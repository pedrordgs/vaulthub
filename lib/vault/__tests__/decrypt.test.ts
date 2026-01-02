import { decryptVaultString } from '../decrypt';
import { encryptVaultString } from '../encrypt';
import { VAULT_HEADER, VAULT_VERSION, VAULT_CIPHER } from '../constants';

describe('decryptVaultString', () => {
  it('should decrypt encrypted text successfully', async () => {
    const plainText = 'test secret';
    const password = 'test-password';

    const encrypted = await encryptVaultString(plainText, password);
    const decrypted = await decryptVaultString(encrypted, password);

    expect(decrypted).toBe(plainText);
  });

  it('should fail with incorrect password', async () => {
    const plainText = 'test secret';
    const password = 'correct-password';
    const wrongPassword = 'wrong-password';

    const encrypted = await encryptVaultString(plainText, password);

    await expect(
      decryptVaultString(encrypted, wrongPassword),
    ).rejects.toThrow('Unable to decrypt content');
  });

  it('should handle empty string encrypted text', async () => {
    const encrypted = '';
    const password = 'test-password';

    await expect(decryptVaultString(encrypted, password)).rejects.toThrow(
      'Encrypted text must be a non-empty string',
    );
  });

  it('should handle empty string password', async () => {
    const plainText = 'test secret';
    const password = 'test-password';
    const encrypted = await encryptVaultString(plainText, password);

    await expect(decryptVaultString(encrypted, '')).rejects.toThrow(
      'Password must be a non-empty string',
    );
  });

  it('should handle non-string encrypted text', async () => {
    const encrypted = null as unknown as string;
    const password = 'test-password';

    await expect(decryptVaultString(encrypted, password)).rejects.toThrow();
  });

  it('should handle non-string password', async () => {
    const plainText = 'test secret';
    const password = 'test-password';
    const encrypted = await encryptVaultString(plainText, password);

    await expect(
      decryptVaultString(encrypted, null as unknown as string),
    ).rejects.toThrow();
  });

  it('should reject invalid vault format - missing header', async () => {
    const invalidVault = 'invalid format';
    const password = 'test-password';

    await expect(decryptVaultString(invalidVault, password)).rejects.toThrow(
      'Invalid vault format',
    );
  });

  it('should reject invalid vault format - wrong header', async () => {
    const invalidVault = '$INVALID_HEADER;1.1;AES256\nabc123';
    const password = 'test-password';

    await expect(decryptVaultString(invalidVault, password)).rejects.toThrow(
      'Invalid vault format',
    );
  });

  it('should reject invalid vault format - non-hex characters', async () => {
    const invalidVault = `${VAULT_HEADER};${VAULT_VERSION};${VAULT_CIPHER}\nxyz123`;
    const password = 'test-password';

    await expect(decryptVaultString(invalidVault, password)).rejects.toThrow(
      'Invalid vault format',
    );
  });

  it('should reject invalid vault format - too short', async () => {
    const invalidVault = `${VAULT_HEADER};${VAULT_VERSION};${VAULT_CIPHER}`;
    const password = 'test-password';

    await expect(decryptVaultString(invalidVault, password)).rejects.toThrow(
      'Invalid vault format',
    );
  });

  it('should handle long plain text', async () => {
    const plainText = 'a'.repeat(1000);
    const password = 'test-password';

    const encrypted = await encryptVaultString(plainText, password);
    const decrypted = await decryptVaultString(encrypted, password);

    expect(decrypted).toBe(plainText);
  });

  it('should handle special characters', async () => {
    const plainText = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const password = 'test-password';

    const encrypted = await encryptVaultString(plainText, password);
    const decrypted = await decryptVaultString(encrypted, password);

    expect(decrypted).toBe(plainText);
  });

  it('should handle unicode characters', async () => {
    const plainText = 'Hello 世界 🌍';
    const password = 'test-password';

    const encrypted = await encryptVaultString(plainText, password);
    const decrypted = await decryptVaultString(encrypted, password);

    expect(decrypted).toBe(plainText);
  });

  it('should handle multiline plain text', async () => {
    const plainText = 'line1\nline2\nline3';
    const password = 'test-password';

    const encrypted = await encryptVaultString(plainText, password);
    const decrypted = await decryptVaultString(encrypted, password);

    expect(decrypted).toBe(plainText);
  });

  it('should handle whitespace in encrypted text', async () => {
    const plainText = 'test secret';
    const password = 'test-password';

    const encrypted = await encryptVaultString(plainText, password);
    // Add whitespace
    const encryptedWithWhitespace = `  ${encrypted}  `;

    const decrypted = await decryptVaultString(
      encryptedWithWhitespace,
      password,
    );

    expect(decrypted).toBe(plainText);
  });

  it('should handle Windows line endings', async () => {
    const plainText = 'test secret';
    const password = 'test-password';

    const encrypted = await encryptVaultString(plainText, password);
    const encryptedWithCRLF = encrypted.replace(/\n/g, '\r\n');

    const decrypted = await decryptVaultString(encryptedWithCRLF, password);

    expect(decrypted).toBe(plainText);
  });

  it('should round-trip encrypt and decrypt multiple times', async () => {
    const plainText = 'test secret';
    const password = 'test-password';

    let encrypted = await encryptVaultString(plainText, password);
    let decrypted = await decryptVaultString(encrypted, password);
    expect(decrypted).toBe(plainText);

    // Encrypt again
    encrypted = await encryptVaultString(plainText, password);
    decrypted = await decryptVaultString(encrypted, password);
    expect(decrypted).toBe(plainText);
  });

  it('should reject invalid vault format - wrong number of parts', async () => {
    // Create a vault string with wrong number of parts
    const invalidVault = `${VAULT_HEADER};${VAULT_VERSION};${VAULT_CIPHER}\n${Buffer.from('salt\nhmac', 'utf8').toString('hex')}`;
    const password = 'test-password';

    await expect(decryptVaultString(invalidVault, password)).rejects.toThrow(
      'Invalid vault format: expected exactly salt, hmac, and ciphertext',
    );
  });

  it('should reject invalid vault format - non-hex in salt', async () => {
    // Create invalid vault with non-hex characters in salt
    const invalidParts = 'xyz\n' + 'a'.repeat(64) + '\n' + 'b'.repeat(64);
    const invalidVault = `${VAULT_HEADER};${VAULT_VERSION};${VAULT_CIPHER}\n${Buffer.from(invalidParts, 'utf8').toString('hex')}`;
    const password = 'test-password';

    await expect(decryptVaultString(invalidVault, password)).rejects.toThrow(
      'Invalid vault format: components contain non-hexadecimal characters',
    );
  });

  it('should reject invalid vault format - wrong salt length', async () => {
    // Create a vault with wrong salt length
    const shortSalt = 'a'.repeat(30); // Should be 32 bytes (64 hex chars)
    const hmac = 'b'.repeat(64);
    const ciphertext = 'c'.repeat(64);
    const invalidParts = `${shortSalt}\n${hmac}\n${ciphertext}`;
    const invalidVault = `${VAULT_HEADER};${VAULT_VERSION};${VAULT_CIPHER}\n${Buffer.from(invalidParts, 'utf8').toString('hex')}`;
    const password = 'test-password';

    await expect(decryptVaultString(invalidVault, password)).rejects.toThrow(
      'Invalid vault format: salt should be',
    );
  });

  it('should reject invalid vault format - wrong HMAC length', async () => {
    // Create a vault with wrong HMAC length
    const salt = 'a'.repeat(64);
    const shortHmac = 'b'.repeat(30); // Should be 32 bytes (64 hex chars)
    const ciphertext = 'c'.repeat(64);
    const invalidParts = `${salt}\n${shortHmac}\n${ciphertext}`;
    const invalidVault = `${VAULT_HEADER};${VAULT_VERSION};${VAULT_CIPHER}\n${Buffer.from(invalidParts, 'utf8').toString('hex')}`;
    const password = 'test-password';

    await expect(decryptVaultString(invalidVault, password)).rejects.toThrow(
      'Invalid vault format: HMAC should be',
    );
  });

  it('should reject invalid vault format - empty ciphertext', async () => {
    // Create a vault with empty ciphertext
    const salt = 'a'.repeat(64);
    const hmac = 'b'.repeat(64);
    const emptyCiphertext = '';
    const invalidParts = `${salt}\n${hmac}\n${emptyCiphertext}`;
    const invalidVault = `${VAULT_HEADER};${VAULT_VERSION};${VAULT_CIPHER}\n${Buffer.from(invalidParts, 'utf8').toString('hex')}`;
    const password = 'test-password';

    await expect(decryptVaultString(invalidVault, password)).rejects.toThrow(
      'Invalid vault format: ciphertext is empty',
    );
  });

});

