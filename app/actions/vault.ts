"use server";

import { decryptVaultString } from "@/lib/vault/decrypt";
import { encryptVaultString } from "@/lib/vault/encrypt";
import { z } from "zod";

type ActionResult =
  | { success: true; result: string }
  | { success: false; error: string };

export type EntryInput = {
  id: string;
  label: string;
  plainText: string;
};

export type EntryOutput =
  | { id: string; label: string; success: true; result: string }
  | { id: string; label: string; success: false; error: string };

export type MultipleActionResult =
  | { success: true; results: EntryOutput[] }
  | { success: false; error: string };

export type DecryptEntryInput = {
  id: string;
  label: string;
  encryptedText: string;
};

const encryptSchema = z.object({
  plainText: z.string().min(1, "Text is required"),
  password: z.string().min(1, "Password is required"),
});

const entrySchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  plainText: z.string().min(1, "Text is required"),
});

const encryptMultipleSchema = z.object({
  entries: z.array(entrySchema).min(1, "At least one entry is required"),
  password: z.string().min(1, "Password is required"),
});

const decryptSchema = z.object({
  encryptedText: z.string().min(1, "Encrypted text is required"),
  password: z.string().min(1, "Password is required"),
});

const decryptEntrySchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  encryptedText: z.string().min(1, "Encrypted text is required"),
});

const decryptMultipleSchema = z.object({
  entries: z.array(decryptEntrySchema).min(1, "At least one entry is required"),
  password: z.string().min(1, "Password is required"),
});

function extractString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function validationError(error: z.ZodError): ActionResult {
  const issues = error.issues;
  const message =
    issues[0]?.message ??
    "Invalid input. Please check your entries.";
  return { success: false, error: message };
}

export async function encrypt(formData: FormData): Promise<ActionResult> {
  const parsed = encryptSchema.safeParse({
    plainText: extractString(formData.get("plainText")).trim(),
    password: extractString(formData.get("password")).trim(),
  });

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    const encrypted = await encryptVaultString(
      parsed.data.plainText,
      parsed.data.password,
    );
    return { success: true, result: encrypted };
  } catch {
    return {
      success: false,
      error: "Encryption failed. Please verify the password and try again.",
    };
  }
}

export async function decrypt(formData: FormData): Promise<ActionResult> {
  const parsed = decryptSchema.safeParse({
    encryptedText: extractString(formData.get("encryptedText")).trim(),
    password: extractString(formData.get("password")).trim(),
  });

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    const decrypted = await decryptVaultString(
      parsed.data.encryptedText,
      parsed.data.password,
    );
    return { success: true, result: decrypted };
  } catch {
    return {
      success: false,
      error:
        "Decryption failed. Please confirm the password and vault format, then try again.",
    };
  }
}

export async function encryptMultiple(
  entries: EntryInput[],
  password: string,
): Promise<MultipleActionResult> {
  const parsed = encryptMultipleSchema.safeParse({
    entries,
    password: password.trim(),
  });

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Invalid input. Please check your entries.";
    return { success: false, error: message };
  }

  const results: EntryOutput[] = await Promise.all(
    parsed.data.entries.map(async (entry): Promise<EntryOutput> => {
      try {
        const result = await encryptVaultString(
          entry.plainText.trim(),
          parsed.data.password,
        );
        return { id: entry.id, label: entry.label, success: true, result };
      } catch {
        return {
          id: entry.id,
          label: entry.label,
          success: false,
          error: "Encryption failed. Please verify the password and try again.",
        };
      }
    }),
  );

  return { success: true, results };
}

export async function decryptMultiple(
  entries: DecryptEntryInput[],
  password: string,
): Promise<MultipleActionResult> {
  const parsed = decryptMultipleSchema.safeParse({
    entries,
    password: password.trim(),
  });

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Invalid input. Please check your entries.";
    return { success: false, error: message };
  }

  const results: EntryOutput[] = await Promise.all(
    parsed.data.entries.map(async (entry): Promise<EntryOutput> => {
      try {
        const result = await decryptVaultString(
          entry.encryptedText.trim(),
          parsed.data.password,
        );
        return { id: entry.id, label: entry.label, success: true, result };
      } catch {
        return {
          id: entry.id,
          label: entry.label,
          success: false,
          error:
            "Decryption failed. Please confirm the password and vault format, then try again.",
        };
      }
    }),
  );

  return { success: true, results };
}

