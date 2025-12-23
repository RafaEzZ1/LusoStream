import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

// METADADOS (Isto só funciona se NÃO tiveres "use client" no topo deste ficheiro)
export const metadata = {
  metadataBase: new URL('https://streamy11.vercel.app'),
  title: {
    default: "LusoStream | Filmes e Séries Grátis",
    template: "%s | LusoStream"
  },
  description: "O melhor site de streaming em Portugal. Filmes e séries HD grátis.",
  
  openGraph: {
    title: "LusoStream | Cinema em Casa",
    description: "Vê os teus filmes favoritos sem pagar nada.",
    url: "https://streamy11.vercel.app",
    siteName: "LusoStream",
    locale: "pt_PT",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <Navbar />
        <div className="min-h-screen">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}