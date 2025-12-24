// src/app/admin/layout.js
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // <--- NOVO IMPORT

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Criar instância do Supabase
  const supabase = createClient();

  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) throw new Error("Sem sessão");

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();

        if (profileError || profile?.role !== "admin") {
          // Se for moderador, deixamos passar (ajusta conforme a tua lógica)
          if (profile?.role !== "mod") throw new Error("Não autorizado");
        }

        if (active) setLoading(false);
      } catch (err) {
        if (active) router.push("/auth"); 
      }
    }

    checkAdmin();
    return () => { active = false; };
  }, [router]);

  if (loading) {
    return (
      <div className="bg-black h-screen flex flex-col items-center justify-center text-red-600 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
        <p>A verificar permissões...</p>
      </div>
    );
  }

  const menuItems = [
    { name: "Dash", href: "/admin", icon: "📊" },
    { name: "Conteúdo", href: "/admin/content", icon: "🔗" },
    { name: "Anúncios", href: "/admin/announcements", icon: "📢" },
    { name: "Pedidos", href: "/admin/suggestions", icon: "💡" },
    { name: "Reportes", href: "/admin/reports", icon: "⚠️" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black text-gray-100 font-sans">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-red-600 tracking-tighter">LusoAdmin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold ${pathname === item.href ? "bg-red-600 text-white shadow-lg" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
              <span>{item.icon}</span>{item.name}
            </Link>
          ))}
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition font-bold mt-auto"><span>🚪</span> Sair</Link>
        </nav>
      </aside>
      <div className="md:hidden bg-gray-900 p-4 border-b border-gray-800 flex justify-between items-center sticky top-0 z-30">
         <h1 className="text-xl font-bold text-red-600">LusoAdmin</h1>
         <Link href="/" className="text-xs bg-gray-800 px-3 py-1 rounded border border-gray-700">Sair</Link>
      </div>
      <main className="flex-1 md:ml-64 p-4 md:p-10 mb-20 md:mb-0">{children}</main>
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-800 flex justify-around p-2 z-50 pb-safe">
         {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center p-2 rounded-lg text-xs ${pathname === item.href ? "text-red-500" : "text-gray-500"}`}><span className="text-lg mb-0.5">{item.icon}</span><span className="truncate max-w-[50px]">{item.name}</span></Link>
         ))}
      </nav>
    </div>
  );
}