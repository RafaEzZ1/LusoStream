import Navbar from "@/components/Navbar";
import DynamicTitle from "@/components/DynamicTitle";
import { Suspense } from "react";
import ResetClient from "./ResetClient";

export const dynamic = "force-dynamic"; // impede pre-render estático

export default function ResetPage() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <DynamicTitle pageTitle="Recuperar palavra-passe - LusoStream" />
      <main className="pt-24 px-6 max-w-md mx-auto pb-12">
        <Suspense fallback={<p className="text-gray-400">A carregar…</p>}>
          <ResetClient />
        </Suspense>
      </main>
    </div>
  );
}
