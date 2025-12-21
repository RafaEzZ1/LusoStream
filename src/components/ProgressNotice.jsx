"use client";

import { useState, useEffect } from "react";

export default function ProgressNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem("lusoStream_seenProgressNotice");
      if (!seen) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  function handleClose() {
    try {
      localStorage.setItem("lusoStream_seenProgressNotice", "true");
    } catch {}
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 p-6 rounded-lg max-w-lg mx-4 text-white animate-fadeIn shadow-lg">
        <h2 className="text-2xl font-bold mb-3">Guardar Progresso — Aviso</h2>
        <p className="text-gray-300 mb-3">
          O progresso (onde paraste nos episódios) é guardado localmente **neste navegador**. Se limpares dados do navegador ou usares outro dispositivo, o progresso será perdido.
        </p>
        <p className="text-gray-300 mb-4">
          Futuramente poderás criar uma conta para sincronizar o progresso entre dispositivos.
        </p>

        <div className="flex justify-end gap-3">
          <button onClick={handleClose} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold">
            OK, entendi
          </button>
        </div>
      </div>
    </div>
  );
}
