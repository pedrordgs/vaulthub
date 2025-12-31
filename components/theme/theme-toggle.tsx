"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

// Hydration-safe mounted check
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

function useMounted() {
  return useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4 transition-transform group-hover:rotate-12" />
        ) : (
          <Moon className="h-4 w-4 transition-transform group-hover:-rotate-12" />
        )
      ) : (
        <div className="h-4 w-4" />
      )}
    </button>
  );
}
