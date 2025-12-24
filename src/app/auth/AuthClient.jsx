"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function AuthClient() {
  const router = useRouter();
  const supabase = createClient();
  const captchaRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);

  // Garante que o componente só renderiza o Captcha no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Limpar msg ao trocar de modo
  useEffect(() => { 
    setMsg(null); 
    setCaptchaToken(null); 
    if(captchaRef.current) captchaRef.current.resetCaptcha(); 
  }, [isLogin]);

  async function handleAuth(e) {
    e.preventDefault();
    setMsg(null);

    if (!email || !password) return setMsg({ type: "error", text: "Preenche todos os campos." });
    
    // Validação Captcha apenas no Registo
    if (!isLogin && !captchaToken) return setMsg({ type: "error", text: "Por favor resolve o Captcha." });

    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        // REGISTO
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { captchaToken }
        });
        if (error) throw error;
        setMsg({ type: "success", text: "Conta criada! Verifica o teu email." });
        if(captchaRef.current) captchaRef.current.resetCaptcha();
      }
    } catch (err) {
      setMsg({ type: "error", text: err.message.includes("Invalid login") ? "Email ou password errados." : "Ocorreu um erro. Tenta novamente." });
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null; // Evita erros de hidratação

  return (
    <div className="w-full max-w-md bg-black/80 p-8 rounded-xl border border-white/10 backdrop-blur-md shadow-2xl animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{isLogin ? "Bem-vindo de volta" : "Junta-te ao LusoStream"}</h1>
        <p className="text-gray-400 text-sm">O melhor do entretenimento num só lugar.</p>
      </div>

      {msg && (
        <div className={`p-3 rounded mb-6 text-sm font-medium border ${msg.type === "error" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-green-500/10 text-green-400 border-green-500/20"}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-5">
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-red-600 focus:bg-gray-900 outline-none transition-all"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-red-600 focus:bg-gray-900 outline-none transition-all"
          />
        </div>

        {!isLogin && (
          <div className="flex justify-center py-2 bg-white/5 rounded-lg">
            <HCaptcha 
              sitekey="1d1e6720-d38e-4a87-94b1-8854a8528913" 
              onVerify={(token) => setCaptchaToken(token)}
              ref={captchaRef}
              theme="dark"
            />
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/30"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"/> A processar...
            </span>
          ) : (isLogin ? "Entrar" : "Criar Conta")}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-400 text-sm">
        <span>{isLogin ? "Novo no LusoStream?" : "Já tens conta?"}</span>
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="ml-2 text-white hover:text-red-500 font-semibold transition-colors"
        >
          {isLogin ? "Regista-te agora." : "Faz login aqui."}
        </button>
      </div>
    </div>
  );
}