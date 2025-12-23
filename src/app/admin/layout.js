// src/app/admin/layout.js
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/auth");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/");
      }
      setLoading(false);
    }
    checkAdmin();
  }, [router]);

  if (loading) return <div className="bg-black h-screen flex items-center justify-center text-red-600">A carregar painel...</div>;

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: "📊" },
    { name: "Links & Embeds", href: "/admin/content", icon: "🔗" },
    { name: "Anúncios", href: "/admin/announcements", icon: "📢" },
    { name: "Sugestões", href: "/admin/suggestions", icon: "💡" },
    { name: "Reportes", href: "/admin/reports", icon: "⚠️" },
    { name: "Sair", href: "/", icon: "🚪" },
  ];

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-red-600 tracking-tighter">LusoAdmin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold ${
                pathname === item.href 
                  ? "bg-red-600 text-white shadow-lg" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 md:ml-64 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}