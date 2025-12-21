// src/app/search/page.js
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import DynamicTitle from "@/components/DynamicTitle";
import SearchClient from "./SearchClient"; // ← tem de existir exatamente com este nome e extensão

// Evita pre-render estático para esta rota
export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <main className="pt-24 px-6">
        <DynamicTitle pageTitle="Pesquisa - LusoStream" />
        <Suspense fallback={<p className="text-gray-400">A carregar…</p>}>
          <SearchClient />
        </Suspense>
      </main>
    </div>
  );
}
