"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";

export default function AuthClient() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Dados do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Preenche todos os campos!");
    if (!isLogin && !username) return toast.error("Precisas de um nome de utilizador!");

    setLoading(true);
    try {
      if (isLogin) {
        // LOGIN
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Bem-vindo de volta!");
      } else {
        // REGISTO (CRIAR CONTA)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Atualizar perfil básico
        await updateProfile(user, { displayName: username });

        // Criar documento na base de dados
        await setDoc(doc(db, "users", user.uid), {
          username: username,
          email: email,
          role: "user", // Default role
          createdAt: serverTimestamp(),
          photoURL: null,
          watchlist: []
        });

        toast.success("Conta criada com sucesso!");
      }
      router.push("/");
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error("Este email já está a ser usado.");
      } else if (error.code === 'auth/wrong-password') {
        toast.error("Password incorreta.");
      } else if (error.code === 'auth/user-not-found') {
        toast.error("Conta não encontrada.");
      } else if (error.code === 'auth/weak-password') {
        toast.error("A password é muito fraca (mínimo 6 caracteres).");
      } else {
        toast.error("Erro ao autenticar. Tenta novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) return toast.error("Escreve o teu email primeiro!");
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Email de recuperação enviado!");
    } catch (error) {
      toast.error("Erro ao enviar email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 relative overflow-hidden">
      
      {/* Imagem de Fundo (Blur) */}
      <div className="absolute inset-0 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f85718e1-fc6d-4954-bca0-f5eaf78e0842/ea44b42b-ba19-4f35-ad27-45090e34a897/PT-en-20230918-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-cover bg-center opacity-20 blur-sm pointer-events-none" />
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-black/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter italic uppercase">
            {isLogin ? "Bem-vindo" : "Criar Conta"}
          </h1>
          <p className="text-zinc-400 text-sm">
            {isLogin ? "Entra para continuar a assistir." : "Junta-te à comunidade LusoStream."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative group">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Nome de Utilizador" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-purple-600 focus:bg-zinc-900 outline-none transition-all"
              />
            </div>
          )}

          <div className="relative group">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500 transition-colors" />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-purple-600 focus:bg-zinc-900 outline-none transition-all"
            />
          </div>

          <div className="relative group">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500 transition-colors" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white focus:border-purple-600 focus:bg-zinc-900 outline-none transition-all"
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
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-purple-900/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "A processar..." : (isLogin ? "ENTRAR" : "REGISTAR")}
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          {isLogin && (
            <button 
              onClick={handleResetPassword}
              className="text-xs text-zinc-500 hover:text-white transition-colors"
            >
              Esqueceste-te da password?
            </button>
          )}

          <div className="pt-4 border-t border-white/5">
            <p className="text-zinc-400 text-sm">
              {isLogin ? "Ainda não tens conta?" : "Já tens conta?"}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="ml-2 text-purple-500 font-bold hover:underline"
              >
                {isLogin ? "Criar agora" : "Entrar"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}