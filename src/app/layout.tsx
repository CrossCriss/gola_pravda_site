import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { cn } from "@/lib/utils";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
  variable: "--font-unbounded",
});

export const metadata: Metadata = {
  title: {
    default: "Gola Pravda",
    template: "%s | Gola Pravda",
  },
  description: "Інтернет-магазин спідньої білизни",
};

// mobile-first: трафік з Instagram/Google — 90%+ мобільний (ТЗ §3)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" className={cn(manrope.variable, unbounded.variable)}>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
