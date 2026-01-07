import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VaultHub - Ansible Vault Encryption & Decryption",
  description: "A modern, secure web application for encrypting and decrypting Ansible vault strings. Free, open-source, and stateless - no data is ever stored.",
  keywords: ["ansible", "vault", "encryption", "decryption", "ansible-vault", "security", "devops"],
  authors: [{ name: "Pedro Rodrigues" }],
  creator: "Pedro Rodrigues",
  publisher: "VaultHub",
  metadataBase: new URL("https://vaulthub-app.vercel.app"),
  openGraph: {
    title: "VaultHub - Ansible Vault Encryption & Decryption",
    description: "A modern, secure web application for encrypting and decrypting Ansible vault strings.",
    url: "https://vaulthub-app.vercel.app",
    siteName: "VaultHub",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} font-sans bg-background text-foreground antialiased`}
      >
        <ThemeProvider>
          <div className="noise-overlay" aria-hidden="true" />
          {children}
          <Toaster richColors position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
