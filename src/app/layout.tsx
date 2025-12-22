import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flexi ID - Employee Card Generator",
  description: "Generate professional employee ID cards with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
