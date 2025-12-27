"use client";
import { useState } from "react";
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  createUserProfile,
  checkUsernameExists 
} from "@/lib/firebase";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function AuthClient() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN ---
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // --- REGISTO ---
        if (!username || username.length < 3) {
          throw new Error("O nome de utilizador deve ter pelo menos 3 letras.");
        }

        const exists = await checkUsernameExists(username);
        if (exists) throw new Error("Este nome de utilizador já está a ser usado.");

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: username });
        await createUserProfile(user, username);
      }

      toast.success(isLogin ? "Bem-vindo de volta!" : "Conta criada com sucesso!");
      router.push("/");
      
    } catch (error) {
      console.error(error);
      let msg = "Ocorreu um erro.";
      if (error.code === 'auth/email-already-in-use') msg = "Este email já está registado.";
      if (error.code === 'auth/invalid-email') msg = "Email inválido.";
      if (error.code === 'auth/weak-password') msg = "A palavra-passe é muito fraca.";
      if (error.code === 'auth/wrong-password') msg = "Palavra-passe incorreta.";
      if (error.code === 'auth/user-not-found') msg = "Utilizador não encontrado.";
      if (error.message) msg = error.message;

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      {/* Fundo abstrato */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black" />
      
      <div className="relative z-10 w-full max-w-md bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase italic">
            {isLogin ? "Bem-vindo" : "Criar Conta"}
          </h1>
          <p className="text-zinc-500 text-sm">
            {isLogin ? "Entra para continuar a assistir" : "Junta-te à comunidade LusoStream"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          
          {!isLogin && (
            <div className="relative group">
               <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500 transition-colors" />
               <input
                type="text"
                required
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-4 pl-12 text-white outline-none focus:border-purple-500 transition"
                placeholder="Nome de Utilizador"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div className="relative group">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="email"
              required
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-4 pl-12 text-white outline-none focus:border-purple-500 transition"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative group">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500 transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-4 pl-12 pr-12 text-white outline-none focus:border-purple-500 transition"
              placeholder="Palavra-passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition transform active:scale-95 disabled:opacity-50 mt-6 shadow-lg shadow-purple-900/20"
          >
            {loading ? "A processar..." : (isLogin ? "ENTRAR" : "REGISTAR")}
          </button>
        </form>

        <p className="mt-8 text-center text-zinc-500 text-sm">
          {isLogin ? "Ainda não tens conta?" : "Já tens conta?"}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="ml-2 text-purple-400 hover:text-white font-bold hover:underline transition-colors"
          >
            {isLogin ? "Criar agora" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}