// src/components/Logo.jsx
import Link from "next/link";

export default function Logo({ className = "" }) {
  return (
    <Link 
      href="/" 
      className={`group flex items-center gap-1.5 font-black tracking-tighter select-none ${className}`}
    >
      {/* Ícone Play Desenhado em SVG (Código) */}
      <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-gradient-to-br from-red-600 to-red-800 rounded-lg shadow-lg shadow-red-900/40 group-hover:scale-110 transition-transform duration-300">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-5 h-5 md:w-6 md:h-6 text-white ml-0.5"
        >
          <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
        </svg>
      </div>
      
      {/* Texto */}
      <div className="flex flex-col justify-center leading-none">
        <span className="text-xl md:text-2xl text-white group-hover:text-gray-200 transition drop-shadow-md">
          LUSO<span className="text-red-600">STREAM</span>
        </span>
      </div>
    </Link>
  );
}