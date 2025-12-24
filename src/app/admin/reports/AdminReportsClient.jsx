// src/app/admin/reports/AdminReportsClient.jsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // <--- NOVO IMPORT

export default function AdminReportsClient() {
  const supabase = createClient();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchReports() {
    setLoading(true);
    const { data } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    setReports(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchReports();
  }, []);

  async function updateStatus(id, newStatus) {
    await supabase.from("reports").update({ status: newStatus }).eq("id", id);
    fetchReports();
  }

  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-6 text-red-600">Reportes de Erros</h1>
      
      {loading ? (
        <p>A carregar...</p>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row justify-between gap-4">
               <div>
                  <div className="font-bold text-lg text-red-400">{report.type}</div>
                  <p className="text-gray-300 mt-1">{report.description}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    Item ID: {report.item_id} | Tipo: {report.item_type}
                  </div>
               </div>
               <div className="flex items-center gap-2">
                 <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${report.status === 'pending' ? 'bg-yellow-900 text-yellow-200' : 'bg-green-900 text-green-200'}`}>
                    {report.status}
                 </span>
                 {report.status === 'pending' && (
                   <button onClick={() => updateStatus(report.id, 'resolved')} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs font-bold">
                     Resolver
                   </button>
                 )}
               </div>
            </div>
          ))}
          {reports.length === 0 && <p className="text-gray-500">Sem reportes pendentes.</p>}
        </div>
      )}
    </div>
  );
}