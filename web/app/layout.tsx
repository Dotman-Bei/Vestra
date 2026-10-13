import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/shell/Providers";
import { DemoBanner } from "@/components/shell/DemoBanner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Vestra", template: "%s | Vestra" },
  description:
    "Vestra gives real-world equipment a verifiable passport on BOT Chain: registration, service history, inspections and custodian handovers.",
};

export const viewport: Viewport = {
  themeColor: "#f3f4f6",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:rounded-[6px] focus:bg-surface focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <Providers>
          <DemoBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
