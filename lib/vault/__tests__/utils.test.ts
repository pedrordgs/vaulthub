import { deriveKeys } from '../utils';
import { KEY_LENGTH, HMAC_LENGTH, IV_LENGTH } from '../constants';
import { randomBytes } from 'crypto';

describe('deriveKeys', () => {
  it('should derive keys with correct lengths', async () => {
    const password = 'test-password';
    const salt = randomBytes(32);

    const keys = await deriveKeys(password, salt);

    expect(keys.encryptionKey).toBeDefined();
    expect(keys.hmacKey).toBeDefined();
    expect(keys.iv).toBeDefined();

    expect(keys.encryptionKey.length).toBe(KEY_LENGTH);
    expect(keys.hmacKey.length).toBe(HMAC_LENGTH);
    expect(keys.iv.length).toBe(IV_LENGTH);
  });

  it('should produce same keys for same password and salt', async () => {
    const password = 'test-password';
    const salt = randomBytes(32);

    const keys1 = await deriveKeys(password, salt);
    const keys2 = await deriveKeys(password, salt);

    expect(keys1.encryptionKey).toEqual(keys2.encryptionKey);
    expect(keys1.hmacKey).toEqual(keys2.hmacKey);
    expect(keys1.iv).toEqual(keys2.iv);
  });

  it('should produce different keys for different passwords', async () => {
    const password1 = 'password1';
    const password2 = 'password2';
    const salt = randomBytes(32);

    const keys1 = await deriveKeys(password1, salt);
    const keys2 = await deriveKeys(password2, salt);

    expect(keys1.encryptionKey).not.toEqual(keys2.encryptionKey);
    expect(keys1.hmacKey).not.toEqual(keys2.hmacKey);
    expect(keys1.iv).not.toEqual(keys2.iv);
  });

  it('should produce different keys for different salts', async () => {
    const password = 'test-password';
    const salt1 = randomBytes(32);
    const salt2 = randomBytes(32);

    const keys1 = await deriveKeys(password, salt1);
    const keys2 = await deriveKeys(password, salt2);

    expect(keys1.encryptionKey).not.toEqual(keys2.encryptionKey);
    expect(keys1.hmacKey).not.toEqual(keys2.hmacKey);
    expect(keys1.iv).not.toEqual(keys2.iv);
  });

  it('should handle empty password', async () => {
    const password = '';
    const salt = randomBytes(32);

    const keys = await deriveKeys(password, salt);

    expect(keys.encryptionKey.length).toBe(KEY_LENGTH);
    expect(keys.hmacKey.length).toBe(HMAC_LENGTH);
    expect(keys.iv.length).toBe(IV_LENGTH);
  });

  it('should handle long password', async () => {
    const password = 'a'.repeat(1000);
    const salt = randomBytes(32);

    const keys = await deriveKeys(password, salt);

    expect(keys.encryptionKey.length).toBe(KEY_LENGTH);
    expect(keys.hmacKey.length).toBe(HMAC_LENGTH);
    expect(keys.iv.length).toBe(IV_LENGTH);
  });

  it('should handle special characters in password', async () => {
    const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const salt = randomBytes(32);

    const keys = await deriveKeys(password, salt);

    expect(keys.encryptionKey.length).toBe(KEY_LENGTH);
    expect(keys.hmacKey.length).toBe(HMAC_LENGTH);
    expect(keys.iv.length).toBe(IV_LENGTH);
  });

  it('should handle unicode characters in password', async () => {
    const password = 'Hello 世界 🌍';
    const salt = randomBytes(32);

    const keys = await deriveKeys(password, salt);

    expect(keys.encryptionKey.length).toBe(KEY_LENGTH);
    expect(keys.hmacKey.length).toBe(HMAC_LENGTH);
    expect(keys.iv.length).toBe(IV_LENGTH);
  });

  it('should produce deterministic output', async () => {
    const password = 'test-password';
    const salt = Buffer.from('a'.repeat(32), 'utf8');

    const keys1 = await deriveKeys(password, salt);
    const keys2 = await deriveKeys(password, salt);
    const keys3 = await deriveKeys(password, salt);

    expect(keys1).toEqual(keys2);
    expect(keys2).toEqual(keys3);
  });

  it('should produce keys that are buffers', async () => {
    const password = 'test-password';
    const salt = randomBytes(32);

    const keys = await deriveKeys(password, salt);

    expect(Buffer.isBuffer(keys.encryptionKey)).toBe(true);
    expect(Buffer.isBuffer(keys.hmacKey)).toBe(true);
    expect(Buffer.isBuffer(keys.iv)).toBe(true);
  });
});

