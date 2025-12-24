import Link from "next/link";
// A Navbar foi removida daqui para não conflituar com o Layout

export default function NotFound() {
  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      {/* O Layout Global já coloca aqui a Navbar, por isso não precisamos dela aqui */}
      
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black -z-10" />

        <h1 className="text-9xl font-bold text-red-600 opacity-20 select-none animate-pulse">
          404
        </h1>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Houston, temos um problema.
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-md">
            A página que procuras perdeu-se no espaço ou foi abduzida por alienígenas.
          </p>
          
          <Link 
            href="/"
            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 hover:bg-gray-200 transition shadow-lg shadow-white/10 flex items-center gap-2"
          >
            🏠 Voltar à Base
          </Link>
        </div>
      </main>
    </div>
  );
}