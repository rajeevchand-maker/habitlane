import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habitlane",
  description: "Recurring work operating system for homes and small teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
