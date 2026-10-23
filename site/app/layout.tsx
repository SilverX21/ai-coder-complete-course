import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_NAME ?? "Portfolio"} · Backend Engineer`,
  description: `${process.env.NEXT_PUBLIC_NAME ?? "A"} backend engineer in ${process.env.NEXT_PUBLIC_LOCATION ?? "Europe"}, building .NET and AWS systems for IoT, banking and insurance.`,
};

export const viewport: Viewport = {
  themeColor: "#0F1B2D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body>{children}</body>
    </html>
  );
}
