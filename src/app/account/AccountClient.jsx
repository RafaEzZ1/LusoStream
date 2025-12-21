// src/app/account/AccountClient.jsx
"use client";

import { useEffect, useState } from "react";
import { supabase, hardLogout } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";

export default function AccountClient() {
  const { user, authLoading } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // password
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  useEffect(() => {
    if (!user) {
      setLoadingProfile(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cancelled) {
        if (!error && data) {
          setUsername(data.username || "");
          setAvatarUrl(data.avatar_url || "");
        }
        setLoadingProfile(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleSaveProfile(e) {
    e?.preventDefault();
    if (!user) return;

    setMsg(null);
    setSaving(true);

    // 1) update profile
    const { error: profErr } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          username: username?.trim() || user.email,
          avatar_url: avatarUrl?.trim() || null,
        },
        { onConflict: "user_id" }
      );

    if (profErr) {
      setMsg({ type: "error", text: "Erro a guardar perfil: " + profErr.message });
      setSaving(false);
      return;
    }

    // 2) update password (opcional)
    if (newPassword || newPassword2) {
      if (newPassword !== newPassword2) {
        setMsg({ type: "error", text: "As passwords não coincidem." });
        setSaving(false);
        return;
      }
      if (newPassword.length < 6) {
        setMsg({ type: "error", text: "Password tem de ter pelo menos 6 caracteres." });
        setSaving(false);
        return;
      }

      const { error: passErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (passErr) {
        setMsg({ type: "error", text: "Perfil guardado, mas não deu para mudar password." });
        setSaving(false);
        return;
      }
    }

    setMsg({ type: "ok", text: "Dados atualizados ✅" });
    setSaving(false);
  }

  async function handleLogoutEverywhere() {
    // isto termina sessões em todo o lado
    await hardLogout();
  }

  if (authLoading) {
    return <p className="text-gray-400">A verificar sessão…</p>;
  }

  if (!user) {
    return (
      <div className="bg-gray-900/40 border border-gray-800 rounded p-6">
        <p className="mb-3">Tens de entrar para veres esta página.</p>
        <a
          href="/auth"
          className="inline-block bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold"
        >
          Entrar
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Definições da conta</h1>

      {msg && (
        <div
          className={`rounded px-3 py-2 text-sm ${
            msg.type === "ok"
              ? "bg-green-800/30 border border-green-600 text-green-100"
              : "bg-red-800/30 border border-red-600 text-red-100"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Dados básicos */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-gray-900/40 border border-gray-800 rounded p-5 space-y-4"
      >
        <h2 className="text-lg font-semibold">Perfil</h2>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Email</label>
          <input
            value={user.email}
            disabled
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-full text-gray-400"
          />
          <p className="text-xs text-gray-500 mt-1">
           Envie um pedido se necessitar de mudar o email.
          </p>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-full"
            placeholder="o teu nome no site"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Avatar (URL)</label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-full"
            placeholder="https://…"
          />
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-16 h-16 rounded-full mt-2 object-cover border border-gray-700"
            />
          ) : null}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-900 px-4 py-2 rounded font-semibold"
        >
          {saving ? "A guardar…" : "Guardar alterações"}
        </button>
      </form>

      {/* Password */}
      <div className="bg-gray-900/40 border border-gray-800 rounded p-5 space-y-4">
        <h2 className="text-lg font-semibold">Segurança</h2>
        <p className="text-sm text-gray-400">
          Mudar password termina normalmente as outras sessões.
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Nova password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Confirmar nova password</label>
            <input
              type="password"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-full"
            />
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-900 px-4 py-2 rounded font-semibold"
        >
          {saving ? "A atualizar…" : "Atualizar password"}
        </button>
      </div>

      {/* Sessões */}
      <div className="bg-gray-900/40 border border-gray-800 rounded p-5 space-y-3">
        <h2 className="text-lg font-semibold">Sessões</h2>
        <p className="text-sm text-gray-400">
         Ocasionalmente, isto terminara sessão em todos os navegadores 
        </p>
        <button
          onClick={handleLogoutEverywhere}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
        >
          Terminar sessão em todo o lado
        </button>
      </div>
    </div>
  );
}
