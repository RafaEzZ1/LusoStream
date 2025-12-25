"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider"; // Usa o nosso novo AuthProvider
import { auth, googleProvider, signInWithPopup, createUserProfile } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import Logo from "@/components/Logo";

export default function AuthClient() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Se já estiver logado, manda para a home
  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

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
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Erro de autenticação. Verifica os dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserProfile(result.user);
      router.push("/");
    } catch (err) {
      setError("Erro ao entrar com Google.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
        {/* Mantém o teu design visual aqui, só mudei a lógica acima */}
        <div className="z-10 w-full max-w-md p-8 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
            <div className="flex justify-center mb-8"><Logo /></div>
            <h1 className="text-3xl font-bold text-center mb-2 text-white">{isLogin ? "Bem-vindo" : "Criar Conta"}</h1>
            <p className="text-gray-400 text-center mb-8 text-sm">O melhor do cinema português está aqui.</p>
            
            {error && <div className="bg-red-500/20 text-red-500 p-3 rounded mb-4 text-center text-sm">{error}</div>}

            <form onSubmit={handleAuth} className="space-y-4">
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required 
                    className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white focus:border-white/30 outline-none transition" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required 
                    className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white focus:border-white/30 outline-none transition" />
                <button disabled={loading} className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition">
                    {loading ? "Aguarde..." : (isLogin ? "Entrar" : "Criar Conta")}
                </button>
            </form>

            <div className="mt-4">
                <button onClick={handleGoogle} className="w-full bg-[#1a1a1a] text-white py-3 rounded-lg border border-white/10 hover:bg-white/5 transition flex justify-center items-center gap-2">
                   <span>G</span> Entrar com Google
                </button>
            </div>

            <p className="mt-8 text-center text-gray-500 text-sm">
                {isLogin ? "Novo por aqui?" : "Já tens conta?"} 
                <button onClick={() => setIsLogin(!isLogin)} className="text-white ml-2 hover:underline font-medium">
                    {isLogin ? "Criar conta" : "Entrar"}
                </button>
            </p>
        </div>
    </div>
  );
}