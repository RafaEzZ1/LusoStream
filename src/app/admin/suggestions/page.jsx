import Navbar from "@/components/Navbar";
import AdminSuggestionsClient from "./AdminSuggestionsClient";

export const dynamic = "force-dynamic";

export default function AdminSuggestionsPage() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <main className="pt-24 px-4 md:px-6 max-w-6xl mx-auto pb-16">
        <AdminSuggestionsClient />
      </main>
    </div>
  );
}
