"use client";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminClient({ children }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth");
        return;
      }
      
      // DEBUG: Isto vai aparecer na consola (F12) para veres o que o Firebase está a ler
      console.log("Admin Check - Role:", profile?.role);

      if (profile?.role !== "admin") {
        router.push("/");
      }
    }
  }, [user, profile, loading, router]);

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">A verificar permissões...</div>;
  
  // Bloqueio de renderização se não for admin
  if (!user || profile?.role !== "admin") return null;

  const links = [
    { name: "Dashboard", path: "/admin" },
    { name: "Conteúdo", path: "/admin/content" },
    { name: "Reportes", path: "/admin/reports" },
    { name: "Sugestões", path: "/admin/suggestions" },
    { name: "Avisos", path: "/admin/announcements" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar Simples (O teu layout original) */}
      <aside className="w-64 border-r border-white/10 bg-black/50 hidden md:block shrink-0 h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white mb-1">LusoStream</h1>
          <span className="text-xs text-red-500 font-bold tracking-wider">ADMINISTRADOR</span>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {links.map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition ${
                pathname === link.path 
                  ? "bg-white text-black" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/" className="block px-4 py-3 mt-8 text-gray-500 hover:text-white text-sm">
            ← Voltar ao Site
          </Link>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}