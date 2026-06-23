import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Business Expense Tracker",
  description: "Track business cash flow from Standard Bank notifications",
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
