import type { Metadata } from "next";
import { GlobalOrderSound } from "@/components/admin/GlobalOrderSound";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema Cardápio",
  description: "Cardápio digital e pedidos pelo WhatsApp",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}<GlobalOrderSound /></body>
    </html>
  );
}
