// src/app/page.js
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <Suspense fallback={<p className="pt-24 px-6 text-gray-400">A carregar…</p>}>
        <HomeClient />
      </Suspense>
    </div>
  );
}
