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

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => { 
    setMsg(null); 
    setCaptchaToken(null); 
    if(captchaRef.current) captchaRef.current.resetCaptcha(); 
  }, [isLogin]);

  async function handleAuth(e) {
    e.preventDefault();
    setMsg(null);

    if (!email || !password) return setMsg({ type: "error", text: "Preenche todos os campos." });
    if (!isLogin && !captchaToken) return setMsg({ type: "error", text: "Por favor resolve o Captcha." });

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
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
      setMsg({ type: "error", text: err.message.includes("Invalid login") ? "Dados incorretos." : "Erro ao processar." });
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-black font-sans">
      {/* Background Animado */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/c38a2d52-138e-48a3-ab68-36787ece46b3/eeb03fc9-99bf-440d-a630-1e97e70d7bd2/PT-pt-20240101-popsignuptwoweeks-perspective_alpha_website_large.jpg')] bg-cover bg-center animate-pulse-slow opacity-40 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
      </div>

      {/* Cartão de Login */}
      <div className="relative z-10 w-full max-w-md p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 drop-shadow-lg">
            {isLogin ? "Bem-vindo" : "Criar Conta"}
          </h1>
          <p className="text-gray-400 text-sm">O teu portal para o entretenimento.</p>
        </div>

        {msg && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-medium border animate-in zoom-in duration-300 ${msg.type === "error" ? "bg-red-500/10 text-red-200 border-red-500/20" : "bg-green-500/10 text-green-200 border-green-500/20"}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
            <div className="group">
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:border-red-600 focus:bg-gray-900 focus:ring-1 focus:ring-red-600/50 outline-none transition-all duration-300"
              />
            </div>
            <div className="group">
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:border-red-600 focus:bg-gray-900 focus:ring-1 focus:ring-red-600/50 outline-none transition-all duration-300"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="flex justify-center bg-white/5 p-2 rounded-lg border border-white/5">
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
            className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/30"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"/> A processar...
              </span>
            ) : (isLogin ? "Entrar na Conta" : "Registar Gratuitamente")}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-gray-400 hover:text-white text-sm font-medium transition-colors hover:underline"
          >
            {isLogin ? "Ainda não tens conta? Cria uma agora." : "Já tens conta? Faz login."}
          </button>
        </div>
      </div>
    </div>
  );
}