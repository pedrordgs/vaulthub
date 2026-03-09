import yaml from "js-yaml";

// Custom YAML type to handle Ansible Vault's !vault tag (treated as a plain scalar)
const vaultType = new yaml.Type("!vault", {
  kind: "scalar",
  construct: (data: unknown) => data,
});

const VAULT_SCHEMA = yaml.DEFAULT_SCHEMA.extend([vaultType]);

export type VaultYamlEntry = {
  label: string;
  encryptedText: string;
};

/**
 * Parses an Ansible Vault YAML file and returns an array of labeled vault entries.
 *
 * Supports the `!vault` custom tag used in Ansible Vault files:
 * ```yaml
 * my_secret: !vault |
 *     $ANSIBLE_VAULT;1.1;AES256
 *     ...
 * ```
 */
export function parseVaultYaml(content: string): VaultYamlEntry[] {
  let parsed: unknown;
  try {
    parsed = yaml.load(content, { schema: VAULT_SCHEMA });
  } catch (err) {
    throw new Error(
      `Invalid YAML: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (parsed === null || parsed === undefined) {
    return [];
  }

  if (typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Invalid vault YAML: expected a key-value mapping");
  }

  const entries: VaultYamlEntry[] = [];

  for (const [label, value] of Object.entries(
    parsed as Record<string, unknown>,
  )) {
    if (typeof value !== "string") {
      throw new Error(
        `Invalid vault YAML: value for "${label}" must be a vault-tagged string`,
      );
    }
    const encryptedText = value.trim();
    if (!encryptedText) {
      throw new Error(`Invalid vault YAML: value for "${label}" is empty`);
    }
    entries.push({ label, encryptedText });
  }

  return entries;
}

/**
 * Converts a label string to a safe YAML key (snake_case-like identifier).
 * Falls back to `secret_<N>` for empty labels.
 */
function toSafeYamlKey(label: string, index: number): string {
  const trimmed = label.trim();
  if (!trimmed) return `secret_${index + 1}`;
  // Replace runs of non-alphanumeric characters with a single underscore
  const sanitized = trimmed
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  if (!sanitized) return `secret_${index + 1}`;
  // Ensure the key doesn't start with a digit
  return /^\d/.test(sanitized) ? `_${sanitized}` : sanitized;
}

/**
 * Generates Ansible Vault YAML file content from an array of labeled encrypted entries.
 *
 * Each entry is formatted as:
 * ```yaml
 * key_name: !vault |
 *     $ANSIBLE_VAULT;1.1;AES256
 *     ...
 * ```
 */
export function generateVaultYaml(entries: VaultYamlEntry[]): string {
  const blocks = entries.map(({ label, encryptedText }, index) => {
    const key = toSafeYamlKey(label, index);
    const indented = encryptedText
      .split("\n")
      .map((line) => `    ${line}`)
      .join("\n");
    return `${key}: !vault |\n${indented}`;
  });
  return blocks.join("\n\n") + "\n";
}
