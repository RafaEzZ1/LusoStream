// src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthModalProvider } from "@/context/AuthModalContext";
import { AuthProvider } from "@/components/AuthProvider";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL('https://streamy11.vercel.app'),
  title: {
    default: "LusoStream | Filmes e Séries Grátis",
    template: "%s | LusoStream"
  },
  description: "O melhor site de streaming em Portugal. Filmes e séries HD grátis.",
  openGraph: {
    title: "LusoStream | Filmes e Séries Grátis",
    description: "O melhor site de streaming em Portugal. Filmes e séries HD grátis.",
    url: 'https://streamy11.vercel.app',
    siteName: 'LusoStream',
    locale: 'pt_PT',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        {/* AuthProvider gere a sessão globalmente para não "piscar" */}
        <AuthProvider>
          <AuthModalProvider>
            
            <Navbar />
            
            <main className="min-h-screen">
              {children}
            </main>

            <Footer />

          </AuthModalProvider>
        </AuthProvider>

        <Analytics />
      </body>
    </html>
  );
}