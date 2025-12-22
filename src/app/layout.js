// src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
// 👇 Importar Footer
import Footer from "@/components/Footer"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LusoStream",
  description: "A tua plataforma de filmes e séries",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        {children}
        {/* 👇 Adicionar Footer aqui no fim */}
        <Footer />
      </body>
    </html>
  );
}