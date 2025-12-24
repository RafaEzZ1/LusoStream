import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-9xl font-bold text-red-600 opacity-20 animate-pulse">404</h1>
      <h2 className="text-4xl font-bold mb-4">Página não encontrada.</h2>
      <Link href="/" className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition">
        🏠 Voltar ao Início
      </Link>
    </div>
  );
}