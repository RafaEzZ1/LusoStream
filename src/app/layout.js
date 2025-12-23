import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

// --- CONFIGURAÇÃO DE SEO E METADADOS ---
export const metadata = {
  metadataBase: new URL('https://streamy11.vercel.app'), // O teu domínio real
  title: {
    default: "LusoStream | Filmes e Séries Grátis",
    template: "%s | LusoStream" // Ex: "Deadpool | LusoStream"
  },
  description: "Assiste aos melhores filmes e séries online com qualidade HD. O teu catálogo de streaming favorito em Portugal, atualizado diariamente.",
  
  keywords: ["filmes", "séries", "streaming", "portugal", "grátis", "hd", "cinema", "online"],
  
  // Como aparece no Facebook, Discord, WhatsApp
  openGraph: {
    title: "LusoStream | O Melhor do Cinema em Casa",
    description: "Milhares de filmes e séries à distância de um clique. Sem registo obrigatório.",
    url: "https://streamy11.vercel.app",
    siteName: "LusoStream",
    locale: "pt_PT",
    type: "website",
    images: [
      {
        url: "/og-image.jpg", // Cria esta imagem e mete na pasta 'public'
        width: 1200,
        height: 630,
        alt: "LusoStream Preview",
      },
    ],
  },
  
  // Como aparece no Twitter/X
  twitter: {
    card: "summary_large_image",
    title: "LusoStream - Streaming Gratuito",
    description: "Vem ver as novidades do cinema e TV.",
    images: ["/og-image.jpg"],
  },
  
  icons: {
    icon: "/favicon.ico", // Garante que tens um favicon na pasta 'public'
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className={`${inter.className} bg-black text-white antialiased selection:bg-red-600 selection:text-white`}>
        {/* Navbar Global (aparece em todo o lado) */}
        <Navbar />
        
        {/* O conteúdo das tuas páginas (Home, Filmes, Detalhes) entra aqui */}
        <div className="min-h-screen">
          {children}
        </div>

        {/* Footer Global (aparece em todo o lado) */}
        <Footer />
      </body>
    </html>
  );
}