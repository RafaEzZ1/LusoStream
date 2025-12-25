"use client";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export default function AvatarUploader() {
  const { user } = useAuth();
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleUpdate = async () => {
    if (!photoURL.trim()) return;
    setLoading(true);

    try {
      // 1. Atualiza no Auth (Login)
      await updateProfile(auth.currentUser, { photoURL: photoURL });
      
      // 2. Atualiza na Base de Dados (Firestore)
      await updateDoc(doc(db, "users", user.uid), { photoURL: photoURL });
      
      alert("Foto atualizada com sucesso!");
      setIsOpen(false);
      window.location.reload(); // Refresh rápido para ver a mudança
    } catch (error) {
      console.error("Erro ao atualizar foto:", error);
      alert("Erro ao atualizar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-blue-400 hover:text-blue-300 underline mt-2"
      >
        Mudar Foto
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-[#121212] border border-white/10 p-4 rounded-xl shadow-xl z-50">
          <label className="text-xs text-gray-400 block mb-2">Cola o Link da Imagem (URL)</label>
          <input 
            type="text" 
            placeholder="https://..." 
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded p-2 text-xs text-white mb-2"
          />
          <button 
            onClick={handleUpdate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded"
          >
            {loading ? "..." : "Guardar"}
          </button>
        </div>
      )}
    </div>
  );
}