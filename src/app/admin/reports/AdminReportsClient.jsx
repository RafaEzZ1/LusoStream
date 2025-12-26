"use client";
import { useEffect, useState } from "react";
import AdminClient from "../AdminClient";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import toast from "react-hot-toast";
import { FaCheck, FaTrash, FaExclamationTriangle, FaFilm } from "react-icons/fa";

export default function AdminReportsClient() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setReports(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) { console.error(error); } finally { setLoading(false); }
    }
    fetchReports();
  }, []);

  const handleResolve = async (report) => {
    try {
      // 1. Marcar como resolvido
      await updateDoc(doc(db, "reports", report.id), { status: "resolved" });

      // 2. ENVIAR NOTIFICAÇÃO AO UTILIZADOR
      await addDoc(collection(db, "notifications"), {
        userId: report.userId,
        title: "Erro Resolvido! 🛠️",
        message: `O problema que reportaste em "${report.movieTitle}" foi resolvido. A nossa equipa agradece o teu apoio!`,
        type: "report_resolved",
        createdAt: serverTimestamp(),
        read: false
      });

      setReports(reports.map(r => r.id === report.id ? { ...r, status: "resolved" } : r));
      toast.success("Report resolvido e utilizador notificado!");
    } catch (error) { toast.error("Erro ao processar"); }
  };

  const handleDelete = async (id) => {
    if(!confirm("Apagar este registo?")) return;
    try {
      await deleteDoc(doc(db, "reports", id));
      setReports(reports.filter(r => r.id !== id));
      toast.success("Removido com sucesso");
    } catch (error) { toast.error("Erro ao apagar"); }
  };

  return (
    <AdminClient>
      <div className="space-y-8">
        <h1 className="text-3xl font-black italic tracking-tighter">REPORTE DE ERROS</h1>
        
        <div className="grid gap-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2rem] flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-purple-500 font-bold text-xs uppercase">
                  <FaFilm /> {report.movieTitle}
                </div>
                <p className="text-white text-sm italic">"{report.reason}"</p>
                <p className="text-[10px] text-zinc-500 font-mono">{report.userEmail}</p>
              </div>

              <div className="flex gap-2">
                {report.status !== "resolved" && (
                  <button onClick={() => handleResolve(report)} className="bg-green-600/20 text-green-500 px-4 py-2 rounded-xl text-xs font-black hover:bg-green-600/40 transition">
                    RESOLVIDO
                  </button>
                )}
                <button onClick={() => handleDelete(report.id)} className="bg-zinc-800 text-zinc-400 p-3 rounded-xl hover:text-red-500 transition">
                  <FaTrash size={12}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminClient>
  );
}