"use client";

import { encryptMultiple } from "@/app/actions/vault";
import type { EntryOutput } from "@/app/actions/vault";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { generateVaultYaml } from "@/lib/vault/yaml";
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

type Entry = {
  id: string;
  label: string;
  text: string;
};

function createEntry(): Entry {
  return { id: crypto.randomUUID(), label: "", text: "" };
}

export function EncryptForm() {
  const [entries, setEntries] = useState<Entry[]>(() => [createEntry()]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [results, setResults] = useState<EntryOutput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showResult, setShowResult] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showResult && results.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showResult, results]);

  const isMultiple = entries.length > 1;

  const addEntry = useCallback(() => {
    setEntries((prev) => [...prev, createEntry()]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateEntry = useCallback(
    (id: string, field: "label" | "text", value: string) => {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
      );
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      startTransition(async () => {
        const response = await encryptMultiple(
          entries.map(({ id, label, text }) => ({
            id,
            label,
            plainText: text,
          })),
          password,
        );

        if (!response.success) {
          setResults([]);
          setShowResult(false);
          setError(response.error);
          toast.error(response.error);
          return;
        }

        const failedCount = response.results.filter((r) => !r.success).length;
        const successCount = response.results.filter((r) => r.success).length;

        setResults(response.results);
        setError(null);
        setShowResult(true);

        if (failedCount === 0) {
          toast.success(
            isMultiple
              ? `Encrypted ${successCount} entries successfully`
              : "Encrypted successfully",
          );
        } else if (successCount === 0) {
          toast.error("All entries failed to encrypt");
        } else {
          toast.warning(
            `${successCount} encrypted, ${failedCount} failed`,
          );
        }
      });
    },
    [entries, password, isMultiple],
  );

  const handleCopy = useCallback(
    async (id: string, text: string) => {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
    },
    [],
  );

  const handleReset = useCallback(() => {
    setEntries([createEntry()]);
    setPassword("");
    setResults([]);
    setError(null);
    setCopiedId(null);
    setShowResult(false);
  }, []);

  const handleDownloadYaml = useCallback(() => {
    const successResults = results.filter(
      (r): r is EntryOutput & { success: true } => r.success,
    );
    if (successResults.length === 0) return;

    const yamlContent = generateVaultYaml(
      successResults.map((r) => ({ label: r.label, encryptedText: r.result })),
    );

    const blob = new Blob([yamlContent], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vault.yml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [results]);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Entry list */}
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <div key={entry.id} className="space-y-2">
              {/* Label + remove row (only in multi-entry mode) */}
              {isMultiple && (
                <div className="flex items-center gap-2">
                  <Input
                    value={entry.label}
                    onChange={(e) =>
                      updateEntry(entry.id, "label", e.target.value)
                    }
                    placeholder={`Entry ${index + 1} label (optional)`}
                    className="h-7 bg-background font-mono text-xs"
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    disabled={isPending}
                    aria-label={`Remove entry ${index + 1}`}
                    className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-destructive disabled:pointer-events-none"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Textarea */}
              {!isMultiple && (
                <Label
                  htmlFor={`plainText-${entry.id}`}
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Plain text
                </Label>
              )}
              <Textarea
                id={`plainText-${entry.id}`}
                value={entry.text}
                onChange={(e) => updateEntry(entry.id, "text", e.target.value)}
                required
                placeholder="Enter text to encrypt..."
                className={cn(
                  "resize-none bg-background font-mono text-sm scrollbar-vault",
                  isMultiple ? "min-h-[100px]" : "min-h-[160px]",
                )}
                disabled={isPending}
              />
            </div>
          ))}
        </div>

        {/* Add entry button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addEntry}
          disabled={isPending}
          className="w-full border-dashed text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add entry
        </Button>

        {/* Separator between entries and password */}
        {isMultiple && <Separator />}

        {/* Password input */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Vault password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a strong password"
              className="bg-background pr-10 font-mono"
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={isPending}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Top-level error message */}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isPending} className="min-w-[100px]">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Encrypting
              </>
            ) : isMultiple ? (
              "Encrypt All"
            ) : (
              "Encrypt"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={handleReset}
          >
            Clear
          </Button>
        </div>
      </form>

      {/* Results */}
      {showResult && results.length > 0 && (
        <div ref={resultsRef} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Results header row with download button */}
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {isMultiple ? "Results" : "Result"}
            </Label>
            {results.some((r) => r.success) && (
              <button
                type="button"
                onClick={handleDownloadYaml}
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download vault.yml</span>
              </button>
            )}
          </div>
          {results.map((entry, index) => (
            <div key={entry.id} className="space-y-2">
              {/* Per-entry header */}
              {isMultiple && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {entry.label || `Entry ${index + 1}`}
                  </span>
                  {entry.success && (
                    <button
                      type="button"
                      onClick={() => handleCopy(entry.id, entry.result)}
                      className={cn(
                        "flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
                      )}
                    >
                      {copiedId === entry.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-green-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Single-entry copy button */}
              {!isMultiple && entry.success && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleCopy(entry.id, entry.result)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {copiedId === entry.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-green-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Result output or per-entry error */}
              {entry.success ? (
                <div className="relative">
                  <pre
                    className={cn(
                      "min-h-[120px] max-h-[240px] overflow-auto rounded-md border bg-muted/30 p-4 text-xs leading-relaxed scrollbar-vault text-foreground",
                    )}
                  >
                    {entry.result}
                  </pre>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {entry.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
