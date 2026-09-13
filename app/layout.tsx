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
  title: "EchoTip — On-chain thank-you notes for ENS names",
  description:
    "Type in anyone's ENS name, see their resolved profile, and leave them a public on-chain tip + message.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-[100px] [animation:blob-drift_14s_ease-in-out_infinite]" />
          <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-[110px] [animation:blob-drift_18s_ease-in-out_infinite_reverse]" />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
