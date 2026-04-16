import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My First Web / MyFirstOffice",
  description: "Tailwind alapra epitett modularis webes es office rendszer scaffold.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}
