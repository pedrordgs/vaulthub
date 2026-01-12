"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

interface Props extends Omit<ThemeProviderProps, "nonce"> {
  nonce?: string;
}

export function ThemeProvider({ children, nonce, ...props }: Props) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      nonce={nonce}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}


