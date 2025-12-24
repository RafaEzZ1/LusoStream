"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client"; // <--- NOVO
import HCaptcha from "@hcaptcha/react-hcaptcha"; // <--- NOVO

export default function AuthClient() {
  const router = useRouter();
  const supabase = createClient(); // Instância
  const captchaRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);

  // Limpar msg ao trocar de modo
  useEffect(() => { setMsg(null); setCaptchaToken(null); if(captchaRef.current) captchaRef.current.resetCaptcha(); }, [isLogin]);

  async function handleAuth(e) {
    e.preventDefault();
    setMsg(null);

    // Validações básicas
    if (!email || !password) return setMsg({ type: "error", text: "Preenche todos os campos." });
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
          options: { captchaToken } // Envia o token do HCaptcha
        });
        if (error) throw error;
        setMsg({ type: "success", text: "Conta criada! Verifica o teu email." });
        if(captchaRef.current) captchaRef.current.resetCaptcha();
      }
    } catch (err) {
      setMsg({ type: "error", text: err.message === "Invalid login credentials" ? "Email ou password errados." : err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Fundo dinâmico */}
      <div className="absolute inset-0 opacity-30 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/PT-pt-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-black/80"></div>

      <div className="relative z-10 w-full max-w-md bg-black/75 p-8 rounded-xl border border-gray-800 backdrop-blur-sm shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-8">{isLogin ? "Entrar" : "Criar Conta"}</h1>

        {msg && (
          <div className={`p-3 rounded mb-6 text-sm font-medium ${msg.type === "error" ? "bg-red-900/50 text-red-200 border border-red-900" : "bg-green-900/50 text-green-200 border border-green-900"}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-400 focus:border-red-600 focus:bg-gray-700 outline-none transition"
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-400 focus:border-red-600 focus:bg-gray-700 outline-none transition"
            />
          </div>

          {!isLogin && (
            <div className="flex justify-center">
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
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "A carregar..." : (isLogin ? "Entrar" : "Registar")}
          </button>
        </form>

        <div className="mt-6 text-gray-400 text-sm flex gap-2">
          <span>{isLogin ? "Novo por aqui?" : "Já tens conta?"}</span>
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-white hover:underline font-medium"
          >
            {isLogin ? "Regista-te agora." : "Faz login."}
          </button>
        </div>
      </div>
    </div>
  );
}