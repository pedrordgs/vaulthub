import { encrypt, decrypt, encryptMultiple, decryptMultiple } from '../vault';
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

describe('encryptMultiple action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validEntries = [
    { id: '1', label: 'first', plainText: 'secret one' },
    { id: '2', label: 'second', plainText: 'secret two' },
  ];

  it('should encrypt multiple entries successfully', async () => {
    mockEncryptVaultString
      .mockResolvedValueOnce('$ANSIBLE_VAULT;1.1;AES256\naaa')
      .mockResolvedValueOnce('$ANSIBLE_VAULT;1.1;AES256\nbbb');

    const result = await encryptMultiple(validEntries, 'test-password');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.results).toHaveLength(2);
      expect(result.results[0]).toEqual({
        id: '1',
        label: 'first',
        success: true,
        result: '$ANSIBLE_VAULT;1.1;AES256\naaa',
      });
      expect(result.results[1]).toEqual({
        id: '2',
        label: 'second',
        success: true,
        result: '$ANSIBLE_VAULT;1.1;AES256\nbbb',
      });
    }
    expect(mockEncryptVaultString).toHaveBeenCalledTimes(2);
    expect(mockEncryptVaultString).toHaveBeenCalledWith('secret one', 'test-password');
    expect(mockEncryptVaultString).toHaveBeenCalledWith('secret two', 'test-password');
  });

  it('should encrypt a single entry successfully', async () => {
    mockEncryptVaultString.mockResolvedValue('$ANSIBLE_VAULT;1.1;AES256\nabc123');

    const result = await encryptMultiple(
      [{ id: '1', label: '', plainText: 'single secret' }],
      'test-password',
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toMatchObject({ id: '1', success: true });
    }
  });

  it('should trim whitespace from entries and password', async () => {
    mockEncryptVaultString.mockResolvedValue('$ANSIBLE_VAULT;1.1;AES256\nabc123');

    await encryptMultiple(
      [{ id: '1', label: '', plainText: '  secret  ' }],
      '  my-password  ',
    );

    expect(mockEncryptVaultString).toHaveBeenCalledWith('secret', 'my-password');
  });

  it('should return partial results when one entry fails', async () => {
    mockEncryptVaultString
      .mockResolvedValueOnce('$ANSIBLE_VAULT;1.1;AES256\naaa')
      .mockRejectedValueOnce(new Error('crypto error'));

    const result = await encryptMultiple(validEntries, 'test-password');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.results[0]).toMatchObject({ id: '1', success: true });
      expect(result.results[1]).toMatchObject({
        id: '2',
        success: false,
        error: 'Encryption failed. Please verify the password and try again.',
      });
    }
  });

  it('should return top-level error for empty password', async () => {
    const result = await encryptMultiple(validEntries, '');

    expect(result).toEqual({ success: false, error: 'Password is required' });
    expect(mockEncryptVaultString).not.toHaveBeenCalled();
  });

  it('should return top-level error for whitespace-only password', async () => {
    const result = await encryptMultiple(validEntries, '   ');

    expect(result).toEqual({ success: false, error: 'Password is required' });
    expect(mockEncryptVaultString).not.toHaveBeenCalled();
  });

  it('should return top-level error for empty entries array', async () => {
    const result = await encryptMultiple([], 'test-password');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
    expect(mockEncryptVaultString).not.toHaveBeenCalled();
  });

  it('should return top-level error when an entry has empty plainText', async () => {
    const entries = [
      { id: '1', label: '', plainText: '' },
      { id: '2', label: '', plainText: 'valid text' },
    ];

    const result = await encryptMultiple(entries, 'test-password');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Text is required');
    }
    expect(mockEncryptVaultString).not.toHaveBeenCalled();
  });

  it('should preserve entry labels in results', async () => {
    mockEncryptVaultString.mockResolvedValue('$ANSIBLE_VAULT;1.1;AES256\nabc');

    const result = await encryptMultiple(
      [{ id: 'abc', label: 'my_api_key', plainText: 'supersecret' }],
      'password',
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.results[0]).toMatchObject({ id: 'abc', label: 'my_api_key', success: true });
    }
  });
});

describe('decryptMultiple action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const vaultText = '$ANSIBLE_VAULT;1.1;AES256\nabc123';
  const validEntries = [
    { id: '1', label: 'first', encryptedText: vaultText },
    { id: '2', label: 'second', encryptedText: vaultText },
  ];

  it('should decrypt multiple entries successfully', async () => {
    mockDecryptVaultString
      .mockResolvedValueOnce('secret one')
      .mockResolvedValueOnce('secret two');

    const result = await decryptMultiple(validEntries, 'test-password');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.results).toHaveLength(2);
      expect(result.results[0]).toEqual({
        id: '1',
        label: 'first',
        success: true,
        result: 'secret one',
      });
      expect(result.results[1]).toEqual({
        id: '2',
        label: 'second',
        success: true,
        result: 'secret two',
      });
    }
    expect(mockDecryptVaultString).toHaveBeenCalledTimes(2);
    expect(mockDecryptVaultString).toHaveBeenCalledWith(vaultText, 'test-password');
  });

  it('should decrypt a single entry successfully', async () => {
    mockDecryptVaultString.mockResolvedValue('my secret');

    const result = await decryptMultiple(
      [{ id: '1', label: '', encryptedText: vaultText }],
      'test-password',
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toMatchObject({ id: '1', success: true, result: 'my secret' });
    }
  });

  it('should trim whitespace from entries and password', async () => {
    mockDecryptVaultString.mockResolvedValue('secret');

    await decryptMultiple(
      [{ id: '1', label: '', encryptedText: `  ${vaultText}  ` }],
      '  my-password  ',
    );

    expect(mockDecryptVaultString).toHaveBeenCalledWith(vaultText, 'my-password');
  });

  it('should return partial results when one entry fails', async () => {
    mockDecryptVaultString
      .mockResolvedValueOnce('secret one')
      .mockRejectedValueOnce(new Error('HMAC mismatch'));

    const result = await decryptMultiple(validEntries, 'test-password');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.results[0]).toMatchObject({ id: '1', success: true });
      expect(result.results[1]).toMatchObject({
        id: '2',
        success: false,
        error: 'Decryption failed. Please confirm the password and vault format, then try again.',
      });
    }
  });

  it('should return top-level error for empty password', async () => {
    const result = await decryptMultiple(validEntries, '');

    expect(result).toEqual({ success: false, error: 'Password is required' });
    expect(mockDecryptVaultString).not.toHaveBeenCalled();
  });

  it('should return top-level error for whitespace-only password', async () => {
    const result = await decryptMultiple(validEntries, '   ');

    expect(result).toEqual({ success: false, error: 'Password is required' });
    expect(mockDecryptVaultString).not.toHaveBeenCalled();
  });

  it('should return top-level error for empty entries array', async () => {
    const result = await decryptMultiple([], 'test-password');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
    expect(mockDecryptVaultString).not.toHaveBeenCalled();
  });

  it('should return top-level error when an entry has empty encryptedText', async () => {
    const entries = [
      { id: '1', label: '', encryptedText: '' },
      { id: '2', label: '', encryptedText: vaultText },
    ];

    const result = await decryptMultiple(entries, 'test-password');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Encrypted text is required');
    }
    expect(mockDecryptVaultString).not.toHaveBeenCalled();
  });

  it('should preserve entry labels in results', async () => {
    mockDecryptVaultString.mockResolvedValue('my secret value');

    const result = await decryptMultiple(
      [{ id: 'xyz', label: 'db_password', encryptedText: vaultText }],
      'password',
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.results[0]).toMatchObject({ id: 'xyz', label: 'db_password', success: true });
    }
  });
});
