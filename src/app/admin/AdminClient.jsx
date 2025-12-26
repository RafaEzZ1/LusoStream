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
    // Só toma decisões quando o loading termina
    if (!loading) {
      if (!user) {
        router.push("/auth");
        return;
      }
      // Verifica se o role é admin
      if (profile?.role !== "admin") {
        console.log("Acesso Admin negado. Role:", profile?.role);
        router.push("/");
      }
    }
  }, [user, profile, loading, router]);

  // Enquanto carrega, mostra um spinner bonito em vez de texto branco
  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  // Se não for admin, não mostra nada (o useEffect vai redirecionar)
  if (!user || profile?.role !== "admin") return null;

  const links = [
    { name: "Dashboard", path: "/admin" },
    { name: "Conteúdo", path: "/admin/content" },
    { name: "Reportes", path: "/admin/reports" },
    { name: "Sugestões", path: "/admin/suggestions" },
    { name: "Avisos", path: "/admin/announcements" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex text-white font-sans">
      {/* Sidebar Simples (Original) */}
      <aside className="w-64 border-r border-white/10 bg-black/50 hidden md:block h-screen sticky top-0 shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white mb-1">LusoStream</h1>
          <span className="text-[10px] bg-red-600/20 text-red-500 border border-red-500/20 px-2 py-1 rounded font-bold tracking-wider">ADMINISTRADOR</span>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {links.map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                pathname === link.path 
                  ? "bg-white text-black shadow-lg" 
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-8 mt-8 border-t border-white/5">
            <Link href="/" className="flex items-center gap-2 px-4 py-3 text-zinc-500 hover:text-white text-sm font-medium transition-colors">
              <span>←</span> Voltar ao Site
            </Link>
          </div>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}