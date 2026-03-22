import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "eelienX Protocol | Tu Agente Crypto Personal",
  description: "Simplifica tus operaciones crypto. Compra, vende y transfiere con un solo mensaje. El agente hace todo, tú solo autorizas.",
  keywords: ["crypto", "bitcoin", "agente", "bitso", "binance", "mexico", "trading"],
  authors: [{ name: "eeelien" }],
  openGraph: {
    title: "eelienX Protocol",
    description: "Tu agente crypto personal. Simplifica tus operaciones.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
