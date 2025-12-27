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
import { FaArrowRight, FaSpinner } from "react-icons/fa";
import Link from "next/link";
// Certifica-te que tens este componente ou remove o import se não tiveres
import Logo from "@/components/Logo"; 

export default function AuthClient() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Bem-vindo de volta!");
      } else {
        if (!username || username.length < 3) throw new Error("O nome de utilizador é muito curto.");
        const exists = await checkUsernameExists(username);
        if (exists) throw new Error("Esse nome já está em uso.");

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: username });
        await createUserProfile(user, username);
        toast.success("Conta criada!");
      }
      router.push("/");
    } catch (error) {
      console.error(error);
      let msg = "Erro na autenticação.";
      if (error.code === 'auth/email-already-in-use') msg = "Email já registado.";
      if (error.code === 'auth/wrong-password') msg = "Password incorreta.";
      if (error.code === 'auth/user-not-found') msg = "Conta não encontrada.";
      if (error.message) msg = error.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      
      {/* LADO ESQUERDO (Visual - Apenas Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-900 items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f85718e1-fc6d-4954-bca0-f5eaf78e0842/ea44b42b-ba19-4f35-ad27-45090e34a897/PT-en-20230918-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black"></div>
        
        <div className="relative z-10 p-12 max-w-lg">
          <div className="mb-6 scale-125 origin-left">
             <Logo />
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-6 leading-tight">
            Todo o cinema português e internacional.
          </h1>
          <p className="text-xl text-zinc-400 font-light">
            O LusoStream é a tua nova casa para filmes, séries e entretenimento sem limites.
          </p>
        </div>
      </div>

      {/* LADO DIREITO (Formulário) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        {/* Mobile Background (Subtil) */}
        <div className="lg:hidden absolute inset-0 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f85718e1-fc6d-4954-bca0-f5eaf78e0842/ea44b42b-ba19-4f35-ad27-45090e34a897/PT-en-20230918-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="lg:hidden absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

        <div className="w-full max-w-md relative z-10">
          
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12 flex justify-center">
            <Logo />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">{isLogin ? "Entrar" : "Criar Conta"}</h2>
            <p className="text-zinc-500 text-sm">
              {isLogin ? "Bem-vindo de volta!" : "Preenche os dados para começar."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="Como te devemos chamar?"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Email</label>
              <input
                type="email"
                required
                placeholder="exemplo@email.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold text-lg py-4 rounded-xl hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
            >
              {loading ? <FaSpinner className="animate-spin" /> : (isLogin ? "Entrar" : "Começar Agora")} 
              {!loading && <FaArrowRight size={14} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-sm">
              {isLogin ? "Novo no LusoStream?" : "Já tens conta?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-white font-bold hover:underline transition-all"
              >
                {isLogin ? "Regista-te agora." : "Entrar."}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}