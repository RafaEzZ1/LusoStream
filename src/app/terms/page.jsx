"use client"; // Adicionado para permitir animações
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FaShieldAlt, FaUserSecret, FaCookieBite, FaEnvelopeOpenText } from "react-icons/fa";

export default function TermsPage() {
  return (
    <div className="bg-[#050505] min-h-screen text-gray-400 font-sans selection:bg-red-600/30">
      <Navbar />
      
      {/* Efeito de luz de fundo para profundidade */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-red-600/5 blur-[120px] pointer-events-none" />

      <main className="relative pt-32 px-6 max-w-4xl mx-auto pb-24 z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
            Termos e <span className="text-red-600">Condições</span>
          </h1>
          <p className="text-zinc-500">Última atualização: {new Date().toLocaleDateString('pt-PT')}</p>
        </header>

        <div className="space-y-8 leading-relaxed">
          
          {/* SECÇÃO 1: AVISO LEGAL */}
          <section className="bg-zinc-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <FaShieldAlt className="text-red-600 text-xl" />
              <h2 className="text-xl font-bold text-white uppercase tracking-widest text-sm">1. Responsabilidade e Indexação</h2>
            </div>
            <div className="space-y-4">
              <p>
                O <strong>LusoStream</strong> opera estritamente como um indexador automatizado de conteúdos audiovisuais disponíveis publicamente na rede mundial de computadores.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm italic">
                <li className="flex items-start gap-2 bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-red-600">•</span> Não alojamos ficheiros nos nossos servidores.
                </li>
                <li className="flex items-start gap-2 bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-red-600">•</span> Funcionamos como um diretório de links externos.
                </li>
                <li className="flex items-start gap-2 bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-red-600">•</span> O conteúdo é gerido por plataformas de terceiros.
                </li>
                <li className="flex items-start gap-2 bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-red-600">•</span> Não detemos controlo sobre a disponibilidade dos links.
                </li>
              </ul>
            </div>
          </section>

          {/* SECÇÃO 2: PRIVACIDADE */}
          <section className="bg-zinc-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <FaUserSecret className="text-red-600 text-xl" />
              <h2 className="text-xl font-bold text-white uppercase tracking-widest text-sm">2. Blindagem de Dados</h2>
            </div>
            <p className="mb-4">
              A privacidade é um pilar fundamental. O registo no LusoStream é minimalista: solicitamos apenas o necessário para a tua experiência de utilizador.
            </p>
            <blockquote className="border-l-2 border-red-600 pl-4 py-1 italic text-zinc-500 text-sm">
              Concordas em manter a tua credencial de acesso confidencial. Atividades suspeitas ou abusivas resultarão na revogação imediata do acesso.
            </blockquote>
          </section>

          {/* SECÇÃO 3: COOKIES */}
          <section className="bg-zinc-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <FaCookieBite className="text-red-600 text-xl" />
              <h2 className="text-xl font-bold text-white uppercase tracking-widest text-sm">3. Cookies de Sessão</h2>
            </div>
            <p className="text-sm">
              Utilizamos cookies estritamente funcionais. Estes pequenos identificadores servem apenas para reconhecer a tua conta e manter a tua sessão ativa, garantindo que não precisas de fazer login a cada clique.
            </p>
          </section>

          {/* SECÇÃO 4: REMOÇÃO DE CONTEÚDO (DMCA) */}
          <section id="dmca" className="bg-red-600/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-red-600/20 shadow-2xl shadow-red-600/5">
            <div className="flex items-center gap-3 mb-6">
              <FaEnvelopeOpenText className="text-red-600 text-xl" />
              <h2 className="text-xl font-bold text-white uppercase tracking-widest text-sm">4. Notificação de Direitos de Autor</h2>
            </div>
            <p className="mb-6 text-sm">
              Respeitamos a propriedade intelectual. Se deténs os direitos de algum conteúdo indexado e desejas solicitar a sua remoção do nosso índice, segue o protocolo abaixo:
            </p>
            
            <div className="bg-black/40 p-6 rounded-2xl border border-red-600/10 group transition-all hover:border-red-600/30">
              <p className="text-white text-xs font-black uppercase tracking-widest mb-4 opacity-50">Canal de Contacto Oficial</p>
              <a href="mailto:Streamyme1@proton.me" className="text-2xl md:text-3xl font-black text-white hover:text-red-600 transition-colors break-all">
                Streamyme1@proton.me
              </a>
              <div className="mt-6 flex flex-col md:flex-row gap-4 text-xs font-bold">
                <span className="bg-zinc-800 px-3 py-1 rounded-full text-zinc-400">Tempo de resposta: &lt; 48h</span>
                <span className="bg-zinc-800 px-3 py-1 rounded-full text-zinc-400">Requer URL direta do LusoStream</span>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}