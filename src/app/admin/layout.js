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

  // Verificação de Segurança (Garante que só Admins veem o layout)
  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/auth"); // Manda para login se não tiver sessão
        return;
      }

      // Verifica se o user tem a role 'admin'
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/"); // Expulsa se não for admin
      }
      
      setLoading(false);
    }
    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div>
      </div>
    );
  }

  // Itens do Menu
  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: "📊" },
    { name: "Sugestões", href: "/admin/suggestions", icon: "💡" },
    { name: "Reportes", href: "/admin/reports", icon: "⚠️" },
    { name: "Voltar ao Site", href: "/", icon: "🏠" },
  ];

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      
      {/* SIDEBAR (Menu Lateral - Desktop) */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-red-600 tracking-tighter">LusoAdmin 🛡️</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                  isActive 
                    ? "bg-red-600/10 text-red-500 border border-red-600/20" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 text-xs text-gray-600 text-center">
          Painel v2.0
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      {/* A margem esquerda (ml-64) empurra o conteúdo para não ficar debaixo da sidebar */}
      <main className="flex-1 md:ml-64 p-6 md:p-10">
        
        {/* Menu Mobile (Só aparece em ecrãs pequenos) */}
        <div className="md:hidden mb-6 bg-gray-900 p-4 rounded-xl border border-gray-800 flex justify-between items-center">
           <span className="font-bold text-red-600">LusoAdmin</span>
           <div className="flex gap-3 text-sm">
             <Link href="/admin" className="text-gray-300">Menu</Link>
             <Link href="/" className="text-red-400">Sair</Link>
           </div>
        </div>

        {children}
      </main>
    </div>
  );
}