import { ThemeToggle } from "@/components/theme/theme-toggle";
import { DecryptForm } from "@/components/vault/decrypt-form";
import { EncryptForm } from "@/components/vault/encrypt-form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Lock, Unlock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Subtle grid pattern */}
      <div 
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:py-20">
        {/* Header */}
        <header className="mb-12 flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                <Lock className="h-5 w-5 text-primary" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                VaultHub
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Ansible vault encryption & decryption
            </p>
          </div>
          <ThemeToggle />
        </header>

        {/* Main Content */}
        <Tabs defaultValue="encrypt" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted/60 p-1">
            <TabsTrigger 
              value="encrypt" 
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Lock className="h-4 w-4" />
              Encrypt
            </TabsTrigger>
            <TabsTrigger 
              value="decrypt"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Unlock className="h-4 w-4" />
              Decrypt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encrypt" className="mt-6">
            <EncryptForm />
          </TabsContent>
          <TabsContent value="decrypt" className="mt-6">
            <DecryptForm />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-16 space-y-4 text-center text-xs text-muted-foreground">
          <p>AES-256 · Compatible with Ansible Vault · Stateless & Secure</p>
          <p>
            <a 
              href="https://github.com/pedrordgs/vaulthub" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline underline-offset-4"
            >
              Open Source
            </a>
            {" · "}
            <a 
              href="https://github.com/pedrordgs/vaulthub/blob/main/LICENSE" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline underline-offset-4"
            >
              MIT License
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
