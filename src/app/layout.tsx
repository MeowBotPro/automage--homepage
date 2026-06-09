import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import FlowNavigation from "@/components/svg/FlowNavigation";
import PageParticles from "@/components/svg/PageParticles";
import LenisProvider from "@/components/ui/LenisProvider";
import CommandHeader from "@/components/ui/CommandHeader";
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
        <LenisProvider>
          <div
            className="main-content-wrapper"
            style={{
              position: 'relative',
              zIndex: 1,
              background: 'var(--color-surface-page)',
            }}
          >
            <CommandHeader />
            <PageParticles />
            <FlowNavigation />
            {children}
          </div>
        </LenisProvider>
      </body>
    </html>
  );
}
