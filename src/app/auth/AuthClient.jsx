"use client";
import { useState } from "react";
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  createUserProfile,
  checkUsernameExists 
} from "@/lib/firebase";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast'; // Usa o toast para erros bonitos

export default function AuthClient() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Novo estado para o nome
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN ---
        await signInWithEmailAndPassword(auth, email, password);
        // O AuthProvider trata do resto
      } else {
        // --- REGISTO ---
        if (!username || username.length < 3) {
          throw new Error("O nome de utilizador deve ter pelo menos 3 letras.");
        }

        // 1. Verificar se o nome já existe
        const exists = await checkUsernameExists(username);
        if (exists) {
          throw new Error("Este nome de utilizador já está a ser usado. Escolhe outro.");
        }

        // 2. Criar conta no Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 3. Atualizar o perfil do Auth com o nome
        await updateProfile(user, { displayName: username });

        // 4. Criar o documento na Base de Dados com o nome escolhido
        await createUserProfile(user, username);
      }

      toast.success(isLogin ? "Bem-vindo de volta!" : "Conta criada com sucesso!");
      router.push("/");
      
    } catch (error) {
      console.error(error);
      // Tratamento de erros em Português
      let msg = "Ocorreu um erro.";
      if (error.code === 'auth/email-already-in-use') msg = "Este email já está registado.";
      if (error.code === 'auth/invalid-email') msg = "Email inválido.";
      if (error.code === 'auth/weak-password') msg = "A palavra-passe é muito fraca (mínimo 6 caracteres).";
      if (error.code === 'auth/wrong-password') msg = "Palavra-passe incorreta.";
      if (error.code === 'auth/user-not-found') msg = "Utilizador não encontrado.";
      if (error.message) msg = error.message; // Usa a nossa mensagem customizada do nome

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserProfile(result.user); // Usa o nome do Google por defeito
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao entrar com Google.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/login-bg.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/70" />
      
      <div className="relative z-10 w-full max-w-md bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          {isLogin ? "Entrar" : "Criar Conta"}
        </h1>
        <p className="text-gray-400 text-center mb-6">
          {isLogin ? "Bem-vindo de volta ao LusoStream" : "Junta-te à comunidade"}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* CAMPO DE NOME (Só aparece no Registo) */}
          {!isLogin && (
            <div>
              <label className="text-xs text-gray-400 font-bold ml-1 uppercase">Nome de Utilizador</label>
              <input
                type="text"
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition"
                placeholder="Ex: Pedro123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 font-bold ml-1 uppercase">Email</label>
            <input
              type="email"
              required
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition"
              placeholder="teu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-bold ml-1 uppercase">Palavra-passe</label>
            <input
              type="password"
              required
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition transform active:scale-95 disabled:opacity-50"
          >
            {loading ? "A processar..." : (isLogin ? "Entrar" : "Criar Conta")}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-black text-gray-500">Ou continua com</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            type="button"
            className="mt-4 w-full bg-white text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"/></svg>
            Google
          </button>
        </div>

        <p className="mt-6 text-center text-gray-400">
          {isLogin ? "Ainda não tens conta?" : "Já tens conta?"}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="ml-2 text-purple-400 hover:text-white font-bold underline"
          >
            {isLogin ? "Regista-te" : "Faz Login"}
          </button>
        </p>
      </div>
    </div>
  );
}