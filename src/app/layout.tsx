// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppNav from "@/components/navigation/AppNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MoneyFlow — Personal Finance Manager",
  description: "Track UPI spending and manage monthly budgets manually with speed.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppNav />
        {children}
      </body>
    </html>
  );
}