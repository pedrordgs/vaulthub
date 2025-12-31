"use client";

import { decrypt } from "@/app/actions/vault";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check, Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";

export function DecryptForm() {
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = useCallback((formData: FormData) => {
    startTransition(async () => {
      const response = await decrypt(formData);
      if (response.success) {
        setResult(response.result);
        setError(null);
        setShowResult(true);
        toast.success("Decrypted successfully");
      } else {
        setResult("");
        setShowResult(false);
        setError(response.error);
        toast.error(response.error);
      }
    });
  }, []);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const handleReset = useCallback(() => {
    setResult("");
    setError(null);
    setCopied(false);
    setShowResult(false);
  }, []);

  return (
    <div className="space-y-6">
      <form action={handleSubmit} className="space-y-5" onReset={handleReset}>
        {/* Encrypted text input */}
        <div className="space-y-2">
          <Label htmlFor="encryptedText" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Encrypted vault text
          </Label>
          <Textarea
            id="encryptedText"
            name="encryptedText"
            required
            placeholder="$ANSIBLE_VAULT;1.1;AES256..."
            className="min-h-[160px] resize-none bg-background font-mono text-sm scrollbar-vault"
            disabled={isPending}
          />
        </div>

        {/* Password input */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Vault password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password used to encrypt"
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

        {/* Error message */}
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
                Decrypting
              </>
            ) : (
              "Decrypt"
            )}
          </Button>
          <Button type="reset" variant="outline" disabled={isPending}>
            Clear
          </Button>
        </div>
      </form>

      {/* Result */}
      {showResult && (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Result
            </Label>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!result}
              className={cn(
                "flex items-center gap-1.5 text-xs text-muted-foreground transition-colors",
                result ? "hover:text-foreground" : "cursor-not-allowed opacity-40"
              )}
            >
              {copied ? (
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
          <div className="relative">
            <pre
              className={cn(
                "min-h-[120px] max-h-[240px] overflow-auto rounded-md border bg-muted/30 p-4 text-xs leading-relaxed scrollbar-vault text-foreground"
              )}
            >
              {result}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
