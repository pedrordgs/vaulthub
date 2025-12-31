"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// Hydration-safe mounted check (same pattern as `components/theme/theme-toggle.tsx`)
const emptySubscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

function useMounted() {
  return useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot)
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const mounted = useMounted()

  // Avoid SSR/client hydration mismatches caused by theme resolving differently
  // between server render ("system") and client ("light"/"dark").
  if (!mounted) return null

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
