import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "AutoMage",
  description: "AI-Powered Business Automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <body>
          <div
            className="main-content-wrapper"
            style={{
              position: 'relative',
              zIndex: 1,
              background: 'var(--color-surface-page)',
            }}
          >
            {children}
          </div>
      </body>
    </html>
  );
}
