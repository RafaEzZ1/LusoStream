// src/app/suggestions/page.jsx
import Navbar from "@/components/Navbar";
import SuggestionsClient from "./SuggestionsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pedidos e Sugestões | LusoStream",
  description: "Pede filmes, reporta erros ou sugere melhorias para o LusoStream.",
};

export default function SuggestionsPage() {
  return (
    <div className="bg-black min-h-screen text-white font-sans">
      <Navbar />
      
      {/* Fundo com gradiente subtil */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black pointer-events-none" />
      
      <main className="relative pt-24 px-4 md:px-6 max-w-4xl mx-auto pb-20">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Central de Pedidos</h1>
          <p className="text-gray-400">Ajuda-nos a melhorar o LusoStream. O que tens em mente?</p>
        </div>
        
        <SuggestionsClient />
      </main>
    </div>
  );
}