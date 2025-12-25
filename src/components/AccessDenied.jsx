import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <h1 className="text-4xl font-bold text-red-500 mb-4">Acesso Negado</h1>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        Não tens permissão para ver esta página. Esta área é restrita a administradores.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition"
      >
        Voltar ao Início
      </Link>
    </div>
  );
}