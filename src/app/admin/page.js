// src/app/admin/page.js
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <Suspense fallback={<p className="pt-24 px-6 text-gray-400">A validar permissões…</p>}>
        <AdminClient />
      </Suspense>
    </div>
  );
}
