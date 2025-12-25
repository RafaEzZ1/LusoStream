"use client";
import { useEffect, useState } from "react";
import AdminClient from "../AdminClient";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default function AdminReportsClient() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar Reports
  useEffect(() => {
    async function fetchReports() {
      try {
        const querySnapshot = await getDocs(collection(db, "reports"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReports(data);
      } catch (error) {
        console.error("Erro ao buscar reports:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  // Apagar Report (Resolvido)
  const handleResolve = async (id) => {
    if(!confirm("Marcar como resolvido e apagar?")) return;
    try {
      await deleteDoc(doc(db, "reports", id));
      setReports(reports.filter(r => r.id !== id));
    } catch (error) {
      alert("Erro ao apagar");
    }
  };

  return (
    <AdminClient>
      <h1 className="text-3xl font-bold text-white mb-8">Reports de Utilizadores</h1>
      
      {loading ? (
        <p className="text-white">A carregar...</p>
      ) : reports.length === 0 ? (
        <div className="p-12 bg-white/5 rounded-xl border border-white/10 text-center text-gray-400">
          Nenhum report pendente. Bom trabalho! 🌟
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-black/40 border border-white/10 p-6 rounded-xl flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold">{report.mediaTitle || "Conteúdo Desconhecido"}</h3>
                <p className="text-gray-400 text-sm mt-1">Motivo: <span className="text-white">{report.reason}</span></p>
                <p className="text-gray-500 text-xs mt-2">Reportado por: {report.userEmail || "Anónimo"}</p>
              </div>
              <button 
                onClick={() => handleResolve(report.id)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
              >
                Resolver
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminClient>
  );
}