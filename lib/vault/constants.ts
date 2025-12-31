// Ansible Vault 1.1 constants
export const VAULT_HEADER = "$ANSIBLE_VAULT";
export const VAULT_VERSION = "1.1";
export const VAULT_CIPHER = "AES256";
export const PBKDF2_ITERATIONS = 10000;
export const KEY_LENGTH = 32; // 256 bits for AES256
export const IV_LENGTH = 16; // 128 bits for AES CTR mode
export const SALT_LENGTH = 32; // 256 bits
export const HMAC_LENGTH = 32; // 256 bits (SHA256)
