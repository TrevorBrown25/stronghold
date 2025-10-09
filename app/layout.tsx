import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stronghold Steward",
  description: "Manage your D&D stronghold turns with ease"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-parchment text-ink">
        {children}
      </body>
    </html>
  );
}
