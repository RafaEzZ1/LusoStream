import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// 👇 IMPORTA ISTO
import { AuthModalProvider } from "@/context/AuthModalContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL('https://streamy11.vercel.app'),
  title: {
    default: "LusoStream | Filmes e Séries Grátis",
    template: "%s | LusoStream"
  },
  description: "O melhor site de streaming em Portugal. Filmes e séries HD grátis.",
  // ... resto dos teus metadados ...
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        {/* 👇 ENVOLVE TUDO COM O PROVIDER AQUI */}
        <AuthModalProvider>
          
          <Navbar />
          
          <div className="min-h-screen">
            {children}
          </div>

          <Footer />

        </AuthModalProvider>
        {/* 👆 FIM DO PROVIDER */}
      </body>
    </html>
  );
};

import { Analytics } from "@vercel/analytics/react"; // 1. Adiciona o import

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>
        {children}
        <Analytics /> {/* 2. Adiciona o componente antes do fecho do body */}
      </body>
    </html>
  );
}