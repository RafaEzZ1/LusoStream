import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-black min-h-[60vh] text-white flex flex-col items-center justify-center text-center px-6">
      {/* ATENÇÃO: Não importes nem uses a Navbar aqui. 
          O RootLayout já a carrega para ti.
      */}
      <h1 className="text-9xl font-bold text-red-600 opacity-20 animate-pulse">
        404
      </h1>
      
      <div className="mt-[-4rem] z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Página não encontrada
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          O conteúdo que procuras não existe ou foi movido.
        </p>
        
        <Link 
          href="/"
          className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition shadow-lg inline-block"
        >
          🏠 Voltar ao Início
        </Link>
      </div>
    </div>
  );
}