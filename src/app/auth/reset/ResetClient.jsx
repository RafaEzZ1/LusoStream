"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function ResetClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ Email de recuperação enviado! Verifica a tua caixa de correio (e spam).");
      setEmail("");
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError("Não existe conta com esse email.");
      } else {
        setError("Erro ao enviar email. Tenta novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
      <div className="w-full max-w-md bg-[#121212] border border-white/10 p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center mb-2">Recuperar Password</h1>
        <p className="text-gray-400 text-center mb-8 text-sm">
          Insere o teu email para receberes um link de reposição.
        </p>

        {message && <div className="bg-green-500/10 text-green-400 p-3 rounded mb-4 text-sm text-center border border-green-500/20">{message}</div>}
        {error && <div className="bg-red-500/10 text-red-400 p-3 rounded mb-4 text-sm text-center border border-red-500/20">{error}</div>}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <input
              type="email"
              required
              placeholder="O teu email"
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-purple-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? "A enviar..." : "Enviar Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth" className="text-gray-500 hover:text-white text-sm transition">
            ← Voltar ao Login
          </Link>
        </div>
      </div>
    </div>
  );
}