// src/app/auth/page.jsx
import DynamicTitle from "@/components/DynamicTitle";
import Navbar from "@/components/Navbar";
import AuthClient from "./AuthClient";

export const dynamic = "force-dynamic";

export default function AuthPage() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <DynamicTitle pageTitle="Entrar / Criar Conta - LusoStream" />
      <main className="pt-24 px-6 max-w-md mx-auto pb-12">
        <AuthClient />
      </main>
    </div>
  );
}
