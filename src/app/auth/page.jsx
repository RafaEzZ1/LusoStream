// src/app/auth/page.jsx
import DynamicTitle from "@/components/DynamicTitle";
import Navbar from "@/components/Navbar";
import AuthClient from "./AuthClient";

export const dynamic = "force-dynamic";

export default function AuthPage() {
  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <DynamicTitle pageTitle="Entrar / Criar Conta - LusoStream" />
      
      {/* Imagem de Fundo (Cinematic) */}
      <div 
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/c38a2d52-138e-48a3-ab68-36787ece46b3/eeb03fc9-99bf-440d-a630-1e97e70d7bd2/PT-pt-20240101-popsignuptwoweeks-perspective_alpha_website_large.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Gradiente para escurecer */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/80 to-black/60" />

      <main className="relative z-10 flex-1 flex items-center justify-center pt-24 pb-12 px-4">
        <AuthClient />
      </main>
    </div>
  );
}