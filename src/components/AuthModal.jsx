"use client";
import { useState } from "react";
import { useAuthModal } from "@/context/AuthModalContext";
import { auth, createUserProfile } from "@/lib/firebase"; // Removemos googleProvider e signInWithPopup
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Logo from "./Logo";

export default function AuthModal() {
  const { isOpen, closeModal } = useAuthModal();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signInWithEmailAndPassword(auth, email, password);
      } else {
        result = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(result.user);
      }
      closeModal();
      router.refresh();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') setError("Dados incorretos.");
      else if (err.code === 'auth/email-already-in-use') setError("Email já registado.");
      else if (err.code === 'auth/weak-password') setError("Password muito fraca.");
      else setError("Ocorreu um erro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md p-8 relative shadow-2xl">
        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        
        <div className="flex justify-center mb-6"><Logo /></div>

        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          {isLogin ? "Bem-vindo" : "Criar Conta Anónima"}
        </h2>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? "A processar..." : (isLogin ? "Entrar" : "Criar Conta")}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          {isLogin ? "Não tens conta?" : "Já tens conta?"}
          <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-white font-semibold hover:underline">
            {isLogin ? "Regista-te" : "Faz Login"}
          </button>
        </p>
      </div>
    </div>
  );
}