import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Homepage UI",
  description: "Visual editor for gethomepage/homepage configuration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
