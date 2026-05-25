import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MediMind AI — Intelligent Health Assistant",
  description: "AI-powered health assistant for smart health decisions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}