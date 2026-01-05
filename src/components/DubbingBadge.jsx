"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaMicrophoneAlt } from "react-icons/fa";

export default function DubbingBadge({ tmdbId, type = "detail" }) {
  // type: 'card' (Selo Simples) ou 'detail' (Info Completa)
  const [data, setData] = useState(null);

  useEffect(() => {
    async function checkDubbing() {
      if (!tmdbId) return;
      try {
        // Procura no Firebase se existe info de dobragem para este ID
        const q = query(collection(db, "content"), where("tmdbId", "==", tmdbId.toString()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setData(snap.docs[0].data());
        }
      } catch (e) { console.error("Erro badge:", e); }
    }
    checkDubbing();
  }, [tmdbId]);

  // Se não estiver marcado como dobrado, não mostra nada
  if (!data?.isDubbed) return null;

  // MODO CAPA (Selo Simples)
  if (type === "card") {
    return (
      <div className="absolute top-2 right-2 z-20">
        <div className="bg-green-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-md shadow-black/50 tracking-wide uppercase">
          PT-PT
        </div>
      </div>
    );
  }

  // MODO DETALHES (Info Completa)
  return (
    <div className="flex items-center gap-2 bg-green-600/20 border border-green-500/30 px-3 py-1 rounded-lg text-green-400 text-xs md:text-sm font-bold animate-in fade-in select-none">
      <FaMicrophoneAlt />
      <span>PT-PT</span>
      {data.dubbedInfo && (
        <span className="text-white/70 border-l border-white/10 pl-2 ml-1 font-medium">
          {data.dubbedInfo}
        </span>
      )}
    </div>
  );
}