import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CROA",
  description: "Central de Registro de Operador de Airsoft.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/code-airsoft-logo.jpg",
    apple: "/code-airsoft-logo.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CROA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
