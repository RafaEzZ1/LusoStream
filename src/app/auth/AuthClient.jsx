"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import HCaptcha from "@hcaptcha/react-hcaptcha";

// --- CONFIGURAÇÃO ---
// TUA SITE KEY REAL (Pública)
const HCAPTCHA_SITE_KEY = "da08ffe6-ce28-4748-9e2a-1684612cf2c6"; 

export default function AuthClient() {
  const router = useRouter();
  const supabase = createClient();
  const captchaRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  // Dados do Formulário
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Evita erros de hidratação (renderização servidor vs cliente)
  useEffect(() => { setMounted(true); }, []);
  
  // Limpa campos e captcha ao mudar entre Login e Registo
  useEffect(() => { 
    setMsg(null); 
    setCaptchaToken(null); 
    if(captchaRef.current) {
      try { captchaRef.current.resetCaptcha(); } catch(e) {}
    }
  }, [isLogin]);

  async function handleAuth(e) {
    e.preventDefault();
    setMsg(null);

    // Validações básicas
    if (!email || !password) return setMsg({ type: "error", text: "Preenche o email e a password." });
    
    // Validação específica de Registo
    if (!isLogin && !username) return setMsg({ type: "error", text: "Escolhe um nome de utilizador." });
    
    // Valida Captcha
    if (!captchaToken) return setMsg({ type: "error", text: "Tens de resolver o Captcha." });

    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password,
          options: { captchaToken }
        });
        if (error) throw error;
        router.push("/"); 
        router.refresh();
      } else {
        // --- REGISTO ---
        const { error } = await supabase.auth.signUp({ 
          email, 
          password, 
          options: { 
            captchaToken, 
            data: { 
              username: username, // AQUI GARANTIMOS QUE USAMOS 'username' E NÃO 'displayName'
              full_name: username 
            }
          } 
        });
        
        if (error) throw error;
        
        setMsg({ type: "success", text: "Conta criada! Verifica o teu email para confirmar." });
        if(captchaRef.current) captchaRef.current.resetCaptcha();
      }
    } catch (err) {
      console.error(err);
      let errorMsg = "Ocorreu um erro. Tenta novamente.";
      
      // Mensagens de erro amigáveis
      if (err.message?.includes("Invalid login")) errorMsg = "Email ou password errados.";
      if (err.message?.includes("User already registered")) errorMsg = "Este email já está registado.";
      if (err.message?.includes("captcha")) errorMsg = "Erro ao validar o Captcha. Tenta recarregar.";
      if (err.message?.includes("rate limit")) errorMsg = "Muitas tentativas. Aguarda um pouco.";
      
      setMsg({ type: "error", text: errorMsg });
      
      if(captchaRef.current) captchaRef.current.resetCaptcha();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-[#050505] overflow-hidden font-sans">
      
      {/* --- FUNDO CINEMÁTICO (CSS PURO - Sem erros de imagem) --- */}
      <div className="absolute inset-0 z-0">
        {/* Gradiente de fundo escuro e elegante */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-[#1a0505]" />
        
        {/* Efeitos de Luz (Blur) */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-900/20 blur-[120px] rounded-full opacity-50 animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full opacity-50" />
        
        {/* Grid subtil para textura */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-[420px] px-6">
        
        {/* Área do Logo */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
            LUSO<span className="text-red-600">STREAM</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">
            Entretenimento sem limites
          </p>
        </div>

        {/* Cartão de Vidro (Glassmorphism) */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
          
          {/* Brilho no topo do cartão */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

          {/* Abas Entrar / Registar */}
          <div className="flex bg-black/40 p-1 rounded-xl mb-8 relative border border-white/5">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all relative z-10 ${isLogin ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              Entrar
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all relative z-10 ${!isLogin ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              Registar
            </button>
            {/* Animação do fundo do botão */}
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-red-600/90 rounded-lg transition-transform duration-300 ease-out shadow-lg shadow-red-900/20 ${isLogin ? "translate-x-0" : "translate-x-full left-1"}`} />
          </div>

          {msg && (
            <div className={`text-center mb-6 text-sm font-bold animate-pulse p-2 rounded bg-black/30 border ${msg.type === "error" ? "text-red-400 border-red-500/20" : "text-green-400 border-green-500/20"}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            
            {/* Campo Nome de Utilizador (Só aparece no Registo) */}
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <FloatingLabelInput type="text" label="Nome de Utilizador" value={username} onChange={e => setUsername(e.target.value)} />
              </div>
            )}

            <FloatingLabelInput type="email" label="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <FloatingLabelInput type="password" label="Password" value={password} onChange={e => setPassword(e.target.value)} />

            {/* Captcha */}
            <div className="flex justify-center py-2 scale-90 origin-center min-h-[78px]">
              <HCaptcha 
                sitekey={HCAPTCHA_SITE_KEY}
                onVerify={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
                onError={(err) => {
                  console.error("hCaptcha Error:", err);
                  setCaptchaToken(null);
                }}
                ref={captchaRef} 
                theme="dark" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all duration-300 transform active:scale-[0.98] shadow-lg shadow-red-900/30 mt-2 border border-red-500/20"
            >
              {loading ? <span className="animate-pulse">A processar...</span> : (isLogin ? "ENTRAR" : "CRIAR CONTA")}
            </button>
          </form>

        </div>
        
        <div className="text-center mt-8">
            <p className="text-gray-500 text-xs opacity-60">LusoStream © 2025 • Protegido por reCAPTCHA</p>
        </div>
      </div>
    </div>
  );
}

// Componente de Input Moderno (Sem displayName issues)
function FloatingLabelInput({ type, label, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative group">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="block px-4 pb-3 pt-6 w-full text-sm text-white bg-black/40 border border-white/10 rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500 peer transition-all placeholder-transparent shadow-inner"
        placeholder=" "
      />
      <label className={`absolute text-sm text-gray-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-red-400 cursor-text pointer-events-none font-medium tracking-wide`}>
        {label}
      </label>
    </div>
  );
}