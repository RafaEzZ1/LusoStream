// src/components/AvatarUploader.jsx
"use client";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // <--- ATUALIZADO

export default function AvatarUploader({ user, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const supabase = createClient(); // <--- INSTÂNCIA

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      onChange?.(pub.publicUrl);

    } catch (e) {
      console.error(e);
      alert("Falha ao enviar avatar.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <img
        src={value || "/avatar-placeholder.png"}
        alt="Avatar"
        className="w-16 h-16 rounded-full object-cover border border-gray-700"
      />
      <div>
        <button
          type="button"
          className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded text-sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "A enviar..." : "Alterar foto"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}