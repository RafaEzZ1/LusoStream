"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/context/AuthModalContext";

export default function ReportButton({ mediaId, mediaTitle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { openModal } = useAuthModal();

  const handleReport = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setIsOpen(false);
      openModal();
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "reports"), {
        mediaId: String(mediaId),
        mediaTitle: mediaTitle || "Desconhecido",
        reason,
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        status: "pending"
      });
      alert("Obrigado! O report foi enviado e será analisado.");
      setIsOpen(false);
      setReason("");
    } catch (error) {
      console.error("Erro ao reportar:", error);
      alert("Erro ao enviar report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition border border-red-500/20 backdrop-blur-md"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>Reportar Erro</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121212] border border-white/10 p-6 rounded-xl w-full max-w-sm">
            <h3 className="text-xl font-bold text-white mb-4">Reportar Problema</h3>
            <p className="text-sm text-gray-400 mb-4">O que se passa com "{mediaTitle}"?</p>
            
            <textarea
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-red-500 mb-4 h-32 resize-none"
              placeholder="Ex: O link está offline, legendas erradas..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleReport}
                disabled={!reason.trim() || loading}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition disabled:opacity-50"
              >
                {loading ? "A enviar..." : "Enviar Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}