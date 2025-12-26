import { Suspense } from "react";
import SearchClient from "./SearchClient";

export const metadata = {
  title: "Pesquisa | LusoStream",
  description: "Encontra os teus filmes e séries favoritos.",
};

export default function SearchPage() {
  return (
    // O Suspense é crucial para o input funcionar no Next.js App Router
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-500">A carregar barra de pesquisa...</div>}>
      <SearchClient />
    </Suspense>
  );
}