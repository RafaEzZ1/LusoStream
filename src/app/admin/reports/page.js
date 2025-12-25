"use client";
import { useEffect, useState } from "react";
import AdminClient from "./AdminClient";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer } from "firebase/firestore";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    movies: 0,
    reports: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // Contar documentos nas coleções
        const usersSnap = await getCountFromServer(collection(db, "users"));
        const moviesSnap = await getCountFromServer(collection(db, "catalog")); // Usamos 'catalog' para contar filmes adicionados
        const reportsSnap = await getCountFromServer(collection(db, "reports"));

        setStats({
          users: usersSnap.data().count,
          movies: moviesSnap.data().count,
          reports: reportsSnap.data().count
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas", error);
      }
    }
    fetchStats();
  }, []);

  return (
    <AdminClient>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Utilizadores */}
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-600/10 border border-blue-500/20 p-6 rounded-2xl">
          <h3 className="text-blue-400 font-medium mb-2">Utilizadores Totais</h3>
          <p className="text-4xl font-bold text-white">{stats.users}</p>
        </div>

        {/* Card Filmes */}
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-600/10 border border-purple-500/20 p-6 rounded-2xl">
          <h3 className="text-purple-400 font-medium mb-2">Filmes/Séries Adicionados</h3>
          <p className="text-4xl font-bold text-white">{stats.movies}</p>
        </div>

        {/* Card Reports */}
        <div className="bg-gradient-to-br from-red-900/40 to-red-600/10 border border-red-500/20 p-6 rounded-2xl">
          <h3 className="text-red-400 font-medium mb-2">Reports Pendentes</h3>
          <p className="text-4xl font-bold text-white">{stats.reports}</p>
        </div>
      </div>

      <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Bem-vindo ao Painel Firebase</h2>
        <p className="text-gray-400">
          O sistema está a rodar em modo seguro e rápido. Usa o menu lateral para gerir o conteúdo.
        </p>
      </div>
    </AdminClient>
  );
}