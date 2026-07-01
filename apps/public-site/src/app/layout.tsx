import type { ReactNode } from "react";
import Link from "next/link";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Max's Social House",
  description: "Upscale restaurant, event space, and live music venue.",
};

const NAV_LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/specials", label: "Specials" },
  { href: "/events", label: "Events" },
  { href: "/private-events", label: "Private Events" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-neutral-950 text-neutral-100 antialiased min-h-screen font-sans">
        <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/90 backdrop-blur-sm border-b border-white/10">
          <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-serif text-lg font-bold tracking-wide text-white">
              Max&apos;s Social House
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className="hover:text-white transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        <div className="pt-16">{children}</div>
        <footer className="border-t border-white/10 py-10 text-center text-sm text-neutral-600 mt-16">
          <p className="font-serif text-white/30 mb-1">Max&apos;s Social House</p>
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
