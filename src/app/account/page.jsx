// src/app/account/page.jsx
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import DynamicTitle from "@/components/DynamicTitle";
import AccountClient from "./AccountClient";

export const dynamic = "force-dynamic";

export default function AccountPage() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <DynamicTitle pageTitle="Conta - LusoStream" />

      <main className="pt-24 px-4 pb-12 max-w-3xl mx-auto">
        <Suspense fallback={<p className="text-gray-400">A carregar conta…</p>}>
          <AccountClient />
        </Suspense>
      </main>
    </div>
  );
}
