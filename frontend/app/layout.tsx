import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import { MovableAIChatbot } from "@/components/simulation/MovableAIChatbot";

export const metadata: Metadata = {
  title: "Dream2Sim — AI-Powered Urban Simulation Platform",
  description: "Next-generation multimodal urban traffic and multi-agent simulation platform powered by Meta AI models and real-time collaboration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:ital,wght@1,300;1,400;1,600&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=Italianno&family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[var(--surface-container-lowest)] text-[var(--on-surface)] antialiased selection:bg-[#B13BFF] selection:text-white"
      >
        <ThemeProvider>
          {children}
          <MovableAIChatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}
