"use client";
import { useState } from "react";
import { useAuthModal } from "@/context/AuthModalContext";
import { auth, googleProvider, signInWithPopup, createUserProfile } from "@/lib/firebase";
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
        // Login Normal
        result = await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Registo
        result = await createUserWithEmailAndPassword(auth, email, password);
        // Cria o perfil na BD logo após registo
        await createUserProfile(result.user);
      }
      closeModal();
      router.refresh();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') setError("Email ou password errados.");
      else if (err.code === 'auth/email-already-in-use') setError("Este email já está registado.");
      else if (err.code === 'auth/weak-password') setError("A password deve ter pelo menos 6 caracteres.");
      else setError("Ocorreu um erro. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserProfile(result.user);
      closeModal();
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Erro ao entrar com Google.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md p-8 relative shadow-2xl">
        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          {isLogin ? "Bem-vindo de volta" : "Criar Conta Gratuita"}
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

        <div className="my-6 flex items-center gap-4">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-gray-500 text-sm">OU</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <button 
          onClick={handleGoogle}
          className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-lg hover:bg-white/10 transition flex items-center justify-center gap-2"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
          Continuar com Google
        </button>

        <p className="mt-6 text-center text-gray-400 text-sm">
          {isLogin ? "Ainda não tens conta?" : "Já tens conta?"}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-white font-semibold hover:underline"
          >
            {isLogin ? "Regista-te" : "Faz Login"}
          </button>
        </p>
      </div>
    </div>
  );
}