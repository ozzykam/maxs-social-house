import type { ReactNode } from "react";

export const metadata = {
  title: "Max's Social House",
  description: "Upscale restaurant, event space, and live music venue.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
