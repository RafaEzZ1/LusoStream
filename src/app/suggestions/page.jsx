import Navbar from "@/components/Navbar";
import SuggestionsClient from "./SuggestionsClient";

export const dynamic = "force-dynamic";

export default function SuggestionsPage() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <main className="pt-24 px-4 md:px-6 max-w-3xl mx-auto pb-16">
        <SuggestionsClient />
      </main>
    </div>
  );
}
