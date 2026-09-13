import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EchoTip: On-chain thank-you notes for ENS names",
  description:
    "Type in anyone's ENS name, see their resolved profile, and leave them a public on-chain tip + message.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0a1420] text-zinc-100">
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="bg-grid absolute inset-0" />
          <div className="absolute top-0 left-1/2 h-[36rem] w-[50rem] -translate-x-1/2 rounded-full bg-gold/5 blur-[140px]" />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
