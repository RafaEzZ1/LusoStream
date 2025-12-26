"use client";
import { useEffect, useState } from "react";
import AdminClient from "./AdminClient";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { FaUsers, FaFilm, FaExclamationTriangle, FaLightbulb } from "react-icons/fa";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, content: 0, reports: 0, suggestions: 0 });
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    async function fetchStats() {
      const usersSnap = await getDocs(collection(db, "users"));
      const contentSnap = await getDocs(collection(db, "embeds"));
      const reportsSnap = await getDocs(collection(db, "reports"));
      const suggestsSnap = await getDocs(collection(db, "suggestions"));
      
      setStats({
        users: usersSnap.size,
        content: contentSnap.size,
        reports: reportsSnap.size,
        suggestions: suggestsSnap.size
      });

      // Buscar os últimos 5 reports
      const q = query(collection(db, "reports"), orderBy("timestamp", "desc"), limit(5));
      const qSnap = await getDocs(q);
      setRecentReports(qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchStats();
  }, []);

  return (
    <AdminClient>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-white">Dashboard Geral</h1>

        {/* CARDS DE ESTATÍSTICAS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<FaUsers/>} label="Utilizadores" value={stats.users} color="bg-blue-600" />
          <StatCard icon={<FaFilm/>} label="Links Totais" value={stats.content} color="bg-purple-600" />
          <StatCard icon={<FaExclamationTriangle/>} label="Reports" value={stats.reports} color="bg-red-600" />
          <StatCard icon={<FaLightbulb/>} label="Sugestões" value={stats.suggestions} color="bg-yellow-600" />
        </div>

        {/* ÚLTIMOS REPORTS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Reports Recentes</h2>
          <div className="space-y-3">
            {recentReports.length > 0 ? recentReports.map(report => (
              <div key={report.id} className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/5">
                <div>
                  <p className="text-white font-medium">{report.mediaTitle}</p>
                  <p className="text-xs text-zinc-500">Por: {report.userName || 'Anónimo'}</p>
                </div>
                <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">Erro</span>
              </div>
            )) : <p className="text-zinc-500">Sem reports pendentes.</p>}
          </div>
        </div>
      </div>
    </AdminClient>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4">
      <div className={`${color} p-4 rounded-xl text-white text-2xl shadow-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-zinc-400 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}