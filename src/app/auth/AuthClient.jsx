"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const SITEKEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY;

const passwordRules = [
  { test: (v) => v.length >= 8, label: "≥ 8 caracteres" },
  { test: (v) => /[a-z]/.test(v), label: "letra minúscula" },
  { test: (v) => /[A-Z]/.test(v), label: "letra maiúscula" },
  { test: (v) => /[0-9]/.test(v), label: "número" },
  { test: (v) => /[^A-Za-z0-9]/.test(v), label: "símbolo" },
];

const normalizeUsername = (v) =>
  v.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 24);

export default function AuthClient() {
  const router = useRouter();

  // UI
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // hCaptcha
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef(null);

  // Feedback
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null); // {type:'ok'|'error', text}

  const strength = useMemo(() => {
    let s = 0;
    for (const r of passwordRules) if (r.test(password)) s++;
    return s;
  }, [password]);

  // Evita “ficar logado só depois de clicar em algo”: ouvimos o evento de auth e redirecionamos.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        // garante que a sessão está hidratada
        setTimeout(async () => {
          await supabase.auth.getUser();
          router.replace("/");
        }, 50);
      }
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, [router]);

  // Limpa mensagem quando mudas de modo
  useEffect(() => setMsg(null), [mode]);

  // Tenta criar/garantir row em profiles ( não bloqueia o login )
  async function ensureProfile(user) {
    try {
      const wanted =
        user?.user_metadata?.username ||
        (user?.email ? user.email.split("@")[0] : `user_${user?.id?.slice(0, 6) || "new"}`);
      await supabase.from("profiles").upsert(
        {
          user_id: user.id,
        username: normalizeUsername(wanted),
          avatar_url: user?.user_metadata?.avatar_url || null,
        },
        { onConflict: "user_id" }
      );
    } catch {
      /* ignora */
    }
  }

  function resetCaptcha() {
    try {
      captchaRef.current?.resetCaptcha();
    } catch {}
    setCaptchaToken("");
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMsg(null);

    if (!captchaToken) {
      setMsg({ type: "error", text: "Confirma o hCaptcha antes de continuar." });
      return;
    }

    try {
      setSubmitting(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken }, // ← OBRIGATÓRIO quando Bot Protection está ON
      });
      if (error) throw error;

      if (data?.user) ensureProfile(data.user);

      setMsg({ type: "ok", text: "Login com sucesso! 🎉" });
      // onAuthStateChange fará o redirect; apenas limpamos o captcha
      resetCaptcha();
    } catch (err) {
      setMsg({
        type: "error",
        text:
          err?.message ||
          "Falha no login. Se o captcha expirou, confirma novamente e tenta outra vez.",
      });
      resetCaptcha();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setMsg(null);

    if (!captchaToken) {
      setMsg({ type: "error", text: "Confirma o hCaptcha antes de continuar." });
      return;
    }

    const uname = normalizeUsername(username);
    if (!uname) {
      setMsg({ type: "error", text: "O nome de utilizador é obrigatório." });
      return;
    }
    if (password !== confirm) {
      setMsg({ type: "error", text: "As palavras-passe não coincidem." });
      return;
    }
    const fails = passwordRules.filter((r) => !r.test(password));
    if (fails.length) {
      setMsg({ type: "error", text: "A password não cumpre os requisitos." });
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: uname },
          captchaToken, // ← OBRIGATÓRIO
          emailRedirectTo:
            typeof window !== "undefined" ? window.location.origin + "/auth" : undefined,
        },
      });
      if (error) throw error;

      setMsg({
        type: "ok",
        text: "Conta criada. Verifica o teu e-mail para confirmar a conta.",
      });
      resetCaptcha();
    } catch (err) {
      setMsg({
        type: "error",
        text:
          err?.message ||
          "Falha ao criar conta. Se o captcha expirou, confirma novamente e tenta outra vez.",
      });
      resetCaptcha();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
      {/* Tabs */}
      <div className="flex gap-3 mb-4">
        <button
          className={`px-4 py-2 rounded ${mode === "login" ? "bg-red-600" : "bg-gray-800 hover:bg-gray-700"}`}
          onClick={() => setMode("login")}
        >
          Entrar
        </button>
        <button
          className={`px-4 py-2 rounded ${mode === "signup" ? "bg-red-600" : "bg-gray-800 hover:bg-gray-700"}`}
          onClick={() => setMode("signup")}
        >
          Criar conta
        </button>
      </div>

      {/* Mensagens */}
      {msg && (
        <div
          className={`mb-4 text-sm rounded p-3 ${
            msg.type === "error"
              ? "bg-red-900/50 text-red-200 border border-red-800"
              : "bg-green-900/40 text-green-200 border border-green-800"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">E-mail</label>
          <input
            type="email"
            required
            autoComplete="email"
            className="w-full bg-gray-800 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-red-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="o.teu@email.com"
          />
        </div>

        {mode === "signup" && (
          <div>
            <label className="block text-sm mb-1">Nome de utilizador</label>
            <input
              type="text"
              required
              className="w-full bg-gray-800 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-red-600"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => setUsername((v) => normalizeUsername(v))}
              placeholder="ex: rafa_ezz"
              maxLength={24}
            />
            <p className="text-xs text-gray-400 mt-1">
              Apenas letras, números e underscore. Máx. 24 caracteres.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm mb-1">Palavra-passe</label>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full bg-gray-800 rounded px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-red-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-300 hover:text-white"
              onClick={() => setShowPwd((s) => !s)}
              aria-label={showPwd ? "Esconder password" : "Mostrar password"}
            >
              {showPwd ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {mode === "signup" && (
          <>
            <div>
              <label className="block text-sm mb-1">Confirmar palavra-passe</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  className="w-full bg-gray-800 rounded px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-red-600"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-300 hover:text-white"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={showConfirm ? "Esconder confirmação" : "Mostrar confirmação"}
                >
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-300 grid grid-cols-2 gap-1">
              {passwordRules.map((r) => {
                const ok = r.test(password);
                return (
                  <div key={r.label} className={`flex items-center gap-2 ${ok ? "text-green-300" : "text-gray-400"}`}>
                    <span>{ok ? "✓" : "•"}</span>
                    <span>{r.label}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* hCaptcha */}
        <div className="mt-2">
          {!SITEKEY ? (
            <p className="text-red-300 text-sm">
              ⚠️ Falta definir <code>NEXT_PUBLIC_HCAPTCHA_SITEKEY</code>.
            </p>
          ) : (
            <HCaptcha
              ref={captchaRef}
              sitekey={SITEKEY}
              theme="dark"
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken("")}
              onError={() => setCaptchaToken("")}
            />
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || !captchaToken}
          className="w-full mt-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded px-4 py-2 font-semibold"
        >
          {submitting ? "A processar..." : mode === "login" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      {/* Reset password */}
      <div className="text-sm text-gray-300 mt-4">
        Esqueceste a password?{" "}
        <button
          className="text-red-400 hover:text-red-300 underline"
          onClick={async () => {
            setMsg(null);
            if (!email) {
              setMsg({ type: "error", text: "Indica o e-mail para recuperar a password." });
              return;
            }
            try {
              const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo:
                  typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined,
              });
              if (error) throw error;
              setMsg({ type: "ok", text: "Email de recuperação enviado (verifica o spam)." });
            } catch (e) {
              setMsg({ type: "error", text: e.message || "Falha ao enviar e-mail." });
            }
          }}
        >
          Recuperar
        </button>
      </div>
    </div>
  );
}
