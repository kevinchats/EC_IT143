import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rental Cash Flow",
  description: "Track money in and money out for student accommodation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <main className="mx-auto max-w-6xl px-4 py-8">
          <Nav />
          {children}
        </main>
      </body>
    </html>
  );
}
