import { generateVaultYaml, parseVaultYaml } from "../yaml";

// Vault strings from example.yml
const VAULT_STRING_1 = `$ANSIBLE_VAULT;1.1;AES256
30613233633461343837653833666333643061636561303338373661313838333565653635353162
3263363434623733343538653462613064333634333464660a663633623939393439316636633863
61636237636537333938306331383339353265363239643939666639386530626330633337633833
6664656334373166630a363736393262666465663432613932613036303963343263623137386239
6330`;

const VAULT_STRING_2 = `$ANSIBLE_VAULT;1.1;AES256
30613233633461343837653833666333643061636561303338373661313838333565653635353162
3263363434623733343538653462613064333634333464660a663633623939393439316636633863
61636237636537333938306331383339353265363239643939666639386530626330633337633833
6664656334373166630a363736393262666465663432613932613036303963343263623137386239
6330`;

const EXAMPLE_YML = `one_secret: !vault |
    $ANSIBLE_VAULT;1.1;AES256
    30613233633461343837653833666333643061636561303338373661313838333565653635353162
    3263363434623733343538653462613064333634333464660a663633623939393439316636633863
    61636237636537333938306331383339353265363239643939666639386530626330633337633833
    6664656334373166630a363736393262666465663432613932613036303963343263623137386239
    6330

another_secret: !vault |
    $ANSIBLE_VAULT;1.1;AES256
    30613233633461343837653833666333643061636561303338373661313838333565653635353162
    3263363434623733343538653462613064333634333464660a663633623939393439316636633863
    61636237636537333938306331383339353265363239643939666639386530626330633337633833
    6664656334373166630a363736393262666465663432613932613036303963343263623137386239
    6330`;

describe("parseVaultYaml", () => {
  it("parses a two-entry vault YAML file", () => {
    const result = parseVaultYaml(EXAMPLE_YML);
    expect(result).toHaveLength(2);
    expect(result[0].label).toBe("one_secret");
    expect(result[0].encryptedText).toBe(VAULT_STRING_1);
    expect(result[1].label).toBe("another_secret");
    expect(result[1].encryptedText).toBe(VAULT_STRING_2);
  });

  it("returns empty array for empty/null YAML", () => {
    expect(parseVaultYaml("")).toEqual([]);
    expect(parseVaultYaml("---")).toEqual([]);
  });

  it("trims trailing newlines from vault values", () => {
    const yaml = `my_secret: !vault |\n    $ANSIBLE_VAULT;1.1;AES256\n    abc123\n`;
    const result = parseVaultYaml(yaml);
    expect(result[0].encryptedText).toBe("$ANSIBLE_VAULT;1.1;AES256\nabc123");
  });

  it("throws on non-mapping YAML", () => {
    expect(() => parseVaultYaml("- item1\n- item2")).toThrow(
      "expected a key-value mapping",
    );
  });

  it("throws when a value is not vault-tagged string", () => {
    expect(() => parseVaultYaml("my_key: 42")).toThrow(
      'value for "my_key" must be a vault-tagged string',
    );
  });

  it("throws on invalid YAML syntax", () => {
    expect(() => parseVaultYaml("{ invalid: [yaml")).toThrow("Invalid YAML");
  });
});

describe("generateVaultYaml", () => {
  it("generates a single-entry vault YAML", () => {
    const output = generateVaultYaml([
      { label: "my_secret", encryptedText: VAULT_STRING_1 },
    ]);
    expect(output).toContain("my_secret: !vault |");
    expect(output).toContain("    $ANSIBLE_VAULT;1.1;AES256");
    // All vault lines should be indented
    const lines = output.split("\n");
    const vaultLines = lines.filter((l) =>
      l.match(/^\s+[0-9a-fA-F$]/),
    );
    expect(vaultLines.length).toBeGreaterThan(0);
    vaultLines.forEach((line) => {
      expect(line.startsWith("    ")).toBe(true);
    });
  });

  it("generates a multi-entry vault YAML with blank line separators", () => {
    const output = generateVaultYaml([
      { label: "one_secret", encryptedText: VAULT_STRING_1 },
      { label: "another_secret", encryptedText: VAULT_STRING_2 },
    ]);
    expect(output).toContain("one_secret: !vault |");
    expect(output).toContain("another_secret: !vault |");
    // Entries separated by a blank line
    expect(output).toContain("\n\n");
  });

  it("uses secret_N fallback for empty labels", () => {
    const output = generateVaultYaml([
      { label: "", encryptedText: VAULT_STRING_1 },
      { label: "   ", encryptedText: VAULT_STRING_2 },
    ]);
    expect(output).toContain("secret_1: !vault |");
    expect(output).toContain("secret_2: !vault |");
  });

  it("sanitizes special characters in labels", () => {
    const output = generateVaultYaml([
      { label: "my secret!", encryptedText: VAULT_STRING_1 },
      { label: "foo-bar.baz", encryptedText: VAULT_STRING_2 },
    ]);
    expect(output).toContain("my_secret: !vault |");
    expect(output).toContain("foo_bar_baz: !vault |");
  });

  it("prefixes digit-leading keys with underscore", () => {
    const output = generateVaultYaml([
      { label: "1secret", encryptedText: VAULT_STRING_1 },
    ]);
    expect(output).toContain("_1secret: !vault |");
  });

  it("produces output that round-trips through parseVaultYaml", () => {
    const entries = [
      { label: "db_password", encryptedText: VAULT_STRING_1 },
      { label: "api_key", encryptedText: VAULT_STRING_2 },
    ];
    const yaml = generateVaultYaml(entries);
    const parsed = parseVaultYaml(yaml);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].label).toBe("db_password");
    expect(parsed[0].encryptedText).toBe(VAULT_STRING_1);
    expect(parsed[1].label).toBe("api_key");
    expect(parsed[1].encryptedText).toBe(VAULT_STRING_2);
  });
});
