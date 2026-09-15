import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Free Programs Pro Store — Curated, verified, free software",
  description:
    "Browse and download free, verified software for Windows, Linux/Ubuntu, Android, and Chrome. SHA-256 checksums, scan status, and licenses for every app.",
  keywords: [
    "free software",
    "Windows apps",
    "Linux apps",
    "Ubuntu apps",
    "Android apps",
    "Chrome extensions",
    "app store",
  ],
  authors: [{ name: "Free Programs Pro" }],
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Free Programs Pro Store",
    description: "Curated, verified, free software across desktop, mobile, and browser.",
    siteName: "Free Programs Pro Store",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Programs Pro Store",
    description: "Curated, verified, free software across desktop, mobile, and browser.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
