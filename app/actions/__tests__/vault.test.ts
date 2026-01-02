import { encrypt, decrypt } from '../vault';
import { encryptVaultString } from '@/lib/vault/encrypt';
import { decryptVaultString } from '@/lib/vault/decrypt';

// Mock the vault functions
jest.mock('@/lib/vault/encrypt', () => ({
  encryptVaultString: jest.fn(),
}));

jest.mock('@/lib/vault/decrypt', () => ({
  decryptVaultString: jest.fn(),
}));

const mockEncryptVaultString = encryptVaultString as jest.MockedFunction<
  typeof encryptVaultString
>;
const mockDecryptVaultString = decryptVaultString as jest.MockedFunction<
  typeof decryptVaultString
>;

describe('encrypt action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should encrypt successfully with valid input', async () => {
    const formData = new FormData();
    formData.append('plainText', 'test secret');
    formData.append('password', 'test-password');

    mockEncryptVaultString.mockResolvedValue('$ANSIBLE_VAULT;1.1;AES256\nabc123');

    const result = await encrypt(formData);

    expect(result).toEqual({
      success: true,
      result: '$ANSIBLE_VAULT;1.1;AES256\nabc123',
    });
    expect(mockEncryptVaultString).toHaveBeenCalledWith(
      'test secret',
      'test-password',
    );
  });

  it('should trim whitespace from inputs', async () => {
    const formData = new FormData();
    formData.append('plainText', '  test secret  ');
    formData.append('password', '  test-password  ');

    mockEncryptVaultString.mockResolvedValue('$ANSIBLE_VAULT;1.1;AES256\nabc123');

    const result = await encrypt(formData);

    expect(result.success).toBe(true);
    expect(mockEncryptVaultString).toHaveBeenCalledWith(
      'test secret',
      'test-password',
    );
  });

  it('should return error for empty plain text', async () => {
    const formData = new FormData();
    formData.append('plainText', '');
    formData.append('password', 'test-password');

    const result = await encrypt(formData);

    expect(result).toEqual({
      success: false,
      error: 'Text is required',
    });
    expect(mockEncryptVaultString).not.toHaveBeenCalled();
  });

  it('should return error for empty password', async () => {
    const formData = new FormData();
    formData.append('plainText', 'test secret');
    formData.append('password', '');

    const result = await encrypt(formData);

    expect(result).toEqual({
      success: false,
      error: 'Password is required',
    });
    expect(mockEncryptVaultString).not.toHaveBeenCalled();
  });

  it('should return error for missing plain text', async () => {
    const formData = new FormData();
    formData.append('password', 'test-password');

    const result = await encrypt(formData);

    expect(result.success).toBe(false);
    expect(mockEncryptVaultString).not.toHaveBeenCalled();
  });

  it('should return error for missing password', async () => {
    const formData = new FormData();
    formData.append('plainText', 'test secret');

    const result = await encrypt(formData);

    expect(result.success).toBe(false);
    expect(mockEncryptVaultString).not.toHaveBeenCalled();
  });

  it('should handle encryption errors', async () => {
    const formData = new FormData();
    formData.append('plainText', 'test secret');
    formData.append('password', 'test-password');

    mockEncryptVaultString.mockRejectedValue(new Error('Encryption failed'));

    const result = await encrypt(formData);

    expect(result).toEqual({
      success: false,
      error: 'Encryption failed. Please verify the password and try again.',
    });
  });

  it('should handle non-string FormData values', async () => {
    const formData = new FormData();
    formData.append('plainText', 'test secret');
    formData.append('password', 'test-password');

    // Simulate File object (non-string)
    const file = new File(['content'], 'test.txt');
    formData.set('plainText', file as unknown as string);

    const result = await encrypt(formData);

    // Should handle gracefully (empty string extraction)
    expect(result.success).toBe(false);
  });

  it('should handle validation error with no message', async () => {
    // This tests the fallback message in validationError
    const formData = new FormData();
    // Create invalid data that will trigger validation
    formData.append('plainText', '');
    formData.append('password', '');

    const result = await encrypt(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});

describe('decrypt action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should decrypt successfully with valid input', async () => {
    const formData = new FormData();
    formData.append('encryptedText', '$ANSIBLE_VAULT;1.1;AES256\nabc123');
    formData.append('password', 'test-password');

    mockDecryptVaultString.mockResolvedValue('test secret');

    const result = await decrypt(formData);

    expect(result).toEqual({
      success: true,
      result: 'test secret',
    });
    expect(mockDecryptVaultString).toHaveBeenCalledWith(
      '$ANSIBLE_VAULT;1.1;AES256\nabc123',
      'test-password',
    );
  });

  it('should trim whitespace from inputs', async () => {
    const formData = new FormData();
    formData.append('encryptedText', '  $ANSIBLE_VAULT;1.1;AES256\nabc123  ');
    formData.append('password', '  test-password  ');

    mockDecryptVaultString.mockResolvedValue('test secret');

    const result = await decrypt(formData);

    expect(result.success).toBe(true);
    expect(mockDecryptVaultString).toHaveBeenCalledWith(
      '$ANSIBLE_VAULT;1.1;AES256\nabc123',
      'test-password',
    );
  });

  it('should return error for empty encrypted text', async () => {
    const formData = new FormData();
    formData.append('encryptedText', '');
    formData.append('password', 'test-password');

    const result = await decrypt(formData);

    expect(result).toEqual({
      success: false,
      error: 'Encrypted text is required',
    });
    expect(mockDecryptVaultString).not.toHaveBeenCalled();
  });

  it('should return error for empty password', async () => {
    const formData = new FormData();
    formData.append('encryptedText', '$ANSIBLE_VAULT;1.1;AES256\nabc123');
    formData.append('password', '');

    const result = await decrypt(formData);

    expect(result).toEqual({
      success: false,
      error: 'Password is required',
    });
    expect(mockDecryptVaultString).not.toHaveBeenCalled();
  });

  it('should return error for missing encrypted text', async () => {
    const formData = new FormData();
    formData.append('password', 'test-password');

    const result = await decrypt(formData);

    expect(result.success).toBe(false);
    expect(mockDecryptVaultString).not.toHaveBeenCalled();
  });

  it('should return error for missing password', async () => {
    const formData = new FormData();
    formData.append('encryptedText', '$ANSIBLE_VAULT;1.1;AES256\nabc123');

    const result = await decrypt(formData);

    expect(result.success).toBe(false);
    expect(mockDecryptVaultString).not.toHaveBeenCalled();
  });

  it('should handle decryption errors', async () => {
    const formData = new FormData();
    formData.append('encryptedText', '$ANSIBLE_VAULT;1.1;AES256\nabc123');
    formData.append('password', 'wrong-password');

    mockDecryptVaultString.mockRejectedValue(new Error('Decryption failed'));

    const result = await decrypt(formData);

    expect(result).toEqual({
      success: false,
      error:
        'Decryption failed. Please confirm the password and vault format, then try again.',
    });
  });

  it('should handle non-string FormData values', async () => {
    const formData = new FormData();
    formData.append('encryptedText', '$ANSIBLE_VAULT;1.1;AES256\nabc123');
    formData.append('password', 'test-password');

    // Simulate File object (non-string)
    const file = new File(['content'], 'test.txt');
    formData.set('encryptedText', file as unknown as string);

    const result = await decrypt(formData);

    // Should handle gracefully (empty string extraction)
    expect(result.success).toBe(false);
  });
});
