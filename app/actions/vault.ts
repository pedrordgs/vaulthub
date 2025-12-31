"use server";

import { decryptVaultString } from "@/lib/vault/decrypt";
import { encryptVaultString } from "@/lib/vault/encrypt";
import { z } from "zod";

type ActionResult =
  | { success: true; result: string }
  | { success: false; error: string };

const encryptSchema = z.object({
  plainText: z.string().min(1, "Text is required"),
  password: z.string().min(1, "Password is required"),
});

const decryptSchema = z.object({
  encryptedText: z.string().min(1, "Encrypted text is required"),
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


