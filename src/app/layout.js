// src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
// 👇 1. Importar o Provider
import { AuthModalProvider } from "@/context/AuthModalContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LusoStream",
  description: "A tua plataforma de filmes e séries",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        {/* 👇 2. Envolver tudo aqui dentro */}
        <AuthModalProvider>
          {children}
          <Footer />
        </AuthModalProvider>
      </body>
    </html>
  );
}