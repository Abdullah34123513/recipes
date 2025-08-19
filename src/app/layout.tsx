import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recipe Hub - Share & Discover Amazing Recipes",
  description: "A community-driven recipe website where users can submit, share, and discover delicious recipes. Join our culinary community today!",
  keywords: ["recipes", "cooking", "food", "culinary", "meal ideas", "recipe sharing"],
  authors: [{ name: "Recipe Hub Team" }],
  openGraph: {
    title: "Recipe Hub - Share & Discover Amazing Recipes",
    description: "A community-driven recipe website where users can submit, share, and discover delicious recipes.",
    url: "https://recipehub.com",
    siteName: "Recipe Hub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recipe Hub - Share & Discover Amazing Recipes",
    description: "A community-driven recipe website where users can submit, share, and discover delicious recipes.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
