import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rafiki — your companion for Abu Dhabi",
  description:
    "Talk to Rafiki on WhatsApp. Every tip the community shares builds a living map of Abu Dhabi — real rents, scams, trusted landlords, and nearby services.",
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
