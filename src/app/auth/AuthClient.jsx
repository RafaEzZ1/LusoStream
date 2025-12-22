// src/app/auth/AuthClient.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const SITEKEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY;

// Ícones SVG para os inputs
const Icons = {
  Mail: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  User: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Lock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Eye: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  EyeOff: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
};

const passwordRules = [
  { test: (v) => v.length >= 8, label: "8+ caracteres" },
  { test: (v) => /[0-9]/.test(v), label: "Número" },
  { test: (v) => /[A-Z]/.test(v), label: "Maiúscula" },
];

const normalizeUsername = (v) =>
  v.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 24);

export default function AuthClient() {
  const router = useRouter();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setTimeout(async () => {
          await supabase.auth.getUser();
          router.replace("/");
        }, 50);
      }
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, [router]);

  useEffect(() => setMsg(null), [mode]);

  async function ensureProfile(user) {
    try {
      const wanted = user?.user_metadata?.username || (user?.email ? user.email.split("@")[0] : `user_${user?.id?.slice(0, 6)}`);
      await supabase.from("profiles").upsert({
        user_id: user.id,
        username: normalizeUsername(wanted),
        avatar_url: user?.user_metadata?.avatar_url || null,
      }, { onConflict: "user_id" });
    } catch {}
  }

  function resetCaptcha() {
    try { captchaRef.current?.resetCaptcha(); } catch {}
    setCaptchaToken("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    if (!captchaToken) {
      setMsg({ type: "error", text: "Por favor, completa o captcha." });
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: { captchaToken },
        });
        if (error) throw error;
        if (data?.user) ensureProfile(data.user);
        setMsg({ type: "ok", text: "Bem-vindo de volta! 🍿" });
      } else {
        const uname = normalizeUsername(username);
        if (!uname) throw new Error("Nome de utilizador inválido.");
        if (password !== confirm) throw new Error("As passwords não coincidem.");
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: uname },
            captchaToken,
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/auth" : undefined,
          },
        });
        if (error) throw error;
        setMsg({ type: "ok", text: "Conta criada! Verifica o teu email." });
      }
      resetCaptcha();
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Ocorreu um erro." });
      resetCaptcha();
    } finally {
      setSubmitting(false);
    }
  }

  // Barra de Força da Password
  const strength = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[A-Z]/.test(password)) s++;
    return s; // 0 a 3
  }, [password]);

  return (
    <div className="w-full max-w-md">
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {mode === "login" ? "Bem-vindo!" : "Criar Conta"}
          </h2>
          <p className="text-gray-400 text-sm">
            {mode === "login" 
              ? "Entra para continuar a ver os teus favoritos." 
              : "Junta-te a nós e começa a tua maratona."}
          </p>
        </div>

        {/* Tabs Modernas */}
        <div className="flex p-1 bg-gray-800/50 rounded-xl mb-6 relative">
          <div 
            className="absolute top-1 bottom-1 bg-gray-700/80 rounded-lg transition-all duration-300 shadow-sm"
            style={{ 
              left: mode === "login" ? "4px" : "50%", 
              width: "calc(50% - 4px)" 
            }}
          />
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${mode === "login" ? "text-white" : "text-gray-400 hover:text-white"}`}
          >
            Entrar
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${mode === "signup" ? "text-white" : "text-gray-400 hover:text-white"}`}
          >
            Registar
          </button>
        </div>

        {/* Mensagens de Erro/Sucesso */}
        {msg && (
          <div className={`mb-6 p-3 rounded-lg text-sm flex items-center gap-2 animate-in slide-in-from-top-2 ${
            msg.type === "error" 
              ? "bg-red-500/10 border border-red-500/20 text-red-200" 
              : "bg-green-500/10 border border-green-500/20 text-green-200"
          }`}>
            <span>{msg.type === "error" ? "⚠️" : "✅"}</span>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* E-mail */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition">
              <Icons.Mail />
            </div>
            <input
              type="email"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-red-600 focus:bg-white/10 transition text-white placeholder-gray-500"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Nome de Utilizador (Só Signup) */}
          {mode === "signup" && (
            <div className="relative group animate-in slide-in-from-left-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition">
                <Icons.User />
              </div>
              <input
                type="text"
                required
                maxLength={24}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-red-600 focus:bg-white/10 transition text-white placeholder-gray-500"
                placeholder="Nome de Utilizador"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setUsername((v) => normalizeUsername(v))}
              />
            </div>
          )}

          {/* Password */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition">
              <Icons.Lock />
            </div>
            <input
              type={showPwd ? "text" : "password"}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 outline-none focus:border-red-600 focus:bg-white/10 transition text-white placeholder-gray-500"
              placeholder="Palavra-passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition"
            >
              {showPwd ? <Icons.EyeOff /> : <Icons.Eye />}
            </button>
          </div>

          {/* Medidor de Força da Password (Signup) */}
          {mode === "signup" && password && (
            <div className="flex gap-1 h-1 mt-1 mb-2">
              <div className={`flex-1 rounded-full transition-colors ${strength >= 1 ? "bg-red-500" : "bg-gray-700"}`} />
              <div className={`flex-1 rounded-full transition-colors ${strength >= 2 ? "bg-yellow-500" : "bg-gray-700"}`} />
              <div className={`flex-1 rounded-full transition-colors ${strength >= 3 ? "bg-green-500" : "bg-gray-700"}`} />
            </div>
          )}

          {/* Confirmar Password (Signup) */}
          {mode === "signup" && (
            <div className="relative group animate-in slide-in-from-left-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition">
                <Icons.Lock />
              </div>
              <input
                type={showConfirm ? "text" : "password"}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 outline-none focus:border-red-600 focus:bg-white/10 transition text-white placeholder-gray-500"
                placeholder="Confirmar palavra-passe"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          )}

          {/* Recuperar Password (Login) */}
          {mode === "login" && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={async () => {
                  if (!email) { setMsg({ type: "error", text: "Escreve o teu email primeiro." }); return; }
                  try {
                    await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/auth" });
                    setMsg({ type: "ok", text: "Email de recuperação enviado!" });
                  } catch (e) { setMsg({ type: "error", text: "Erro ao enviar email." }); }
                }}
                className="text-xs text-gray-400 hover:text-white transition hover:underline"
              >
                Esqueceste-te da password?
              </button>
            </div>
          )}

          {/* Captcha */}
          <div className="flex justify-center my-2">
            {!SITEKEY ? (
              <p className="text-red-400 text-xs">⚠️ Configura o hCaptcha no .env</p>
            ) : (
              <HCaptcha
                ref={captchaRef}
                sitekey={SITEKEY}
                theme="dark"
                onVerify={setCaptchaToken}
                onExpire={() => setCaptchaToken("")}
              />
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !captchaToken}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/30"
          >
            {submitting ? "A processar..." : mode === "login" ? "Entrar na Ação" : "Criar Conta Grátis"}
          </button>
        </form>
      </div>
    </div>
  );
} 