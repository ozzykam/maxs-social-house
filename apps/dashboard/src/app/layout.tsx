import type { ReactNode } from "react";
import "./globals.css";
import { AuthGuard } from "@/components/AuthGuard";

export const metadata = {
  title: "Max's Social House — Dashboard",
  description: "Internal operations dashboard",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
