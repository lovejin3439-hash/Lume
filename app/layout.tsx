import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lume",
  description: "Plan your day, brighter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
