import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { LanguageProvider } from "@/components/LanguageProvider";
import "./lumasign.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "LumaSign Europe | Custom Leuchtlogos, Neon & 3D Letters",
  description:
    "Maßgefertigte Leuchtlogos, LED Neon, 3D Buchstaben und Leuchtkästen für Deutschland. Angebot, Produktion, Transport und Montage aus einer Hand.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className="h-full antialiased"
    >
      <body className="min-h-full">
        <LanguageProvider>
          <Header />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
