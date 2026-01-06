"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaMicrophoneAlt } from "react-icons/fa";

export default function DubbingBadge({ tmdbId, type = "detail" }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function checkDubbing() {
      if (!tmdbId) return;
      try {
        const q = query(collection(db, "content"), where("tmdbId", "==", tmdbId.toString()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setData(snap.docs[0].data());
        }
      } catch (e) { console.error(e); }
    }
    checkDubbing();
  }, [tmdbId]);

  if (!data?.isDubbed) return null;

  // MODO CAPA (Selo no topo esquerdo para não tapar a estrela à direita)
  if (type === "card") {
    return (
      <div className="absolute top-2 left-2 z-20">
        <div className="bg-green-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-md shadow-black/80 uppercase tracking-wider border border-green-400/50">
          PT-PT
        </div>
      </div>
    );
  }

  // MODO DETALHES (Info completa)
  return (
    <div className="flex items-center gap-2 bg-green-900/40 border border-green-500/50 px-3 py-1.5 rounded-lg text-green-400 text-xs md:text-sm font-bold animate-in fade-in select-none h-fit">
      <FaMicrophoneAlt />
      <span>PT-PT</span>
      {data.dubbedInfo && (
        <span className="text-white/70 border-l border-white/20 pl-2 ml-1 font-medium">
          {data.dubbedInfo}
        </span>
      )}
    </div>
  );
}