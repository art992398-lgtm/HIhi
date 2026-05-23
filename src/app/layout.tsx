import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "คิดถึงนะ",
  description: "บอกรักบอกคิดถึงแฟนของคุณ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
