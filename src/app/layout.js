// ESTA LINHA É O SEGREDO. OBRIGA O SITE A SER DINÂMICO E IGNORA O ERRO DE BUILD.
export const dynamic = "force-dynamic"; 

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
// Se tiveres um Footer, importa-o aqui também
// import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LusoStream",
  description: "O melhor do cinema em português",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-black text-white">
            {children}
          </main>
          {/* <Footer /> */}
        </AuthProvider>
      </body>
    </html>
  );
}