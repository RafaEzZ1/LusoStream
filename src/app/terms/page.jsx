// src/app/terms/page.jsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="bg-black min-h-screen text-gray-300 font-sans">
      <Navbar />
      
      <main className="pt-32 px-6 max-w-4xl mx-auto pb-20">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 border-l-4 border-red-600 pl-4">
          Termos e Condições
        </h1>

        <div className="space-y-10 text-base leading-relaxed bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
          
          {/* SECÇÃO 1: AVISO LEGAL (Estilo MrPiracy) */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wide">1. Aviso Legal</h2>
            <div className="space-y-4 text-gray-400">
              <p>
                Ao utilizares o <strong>LusoStream</strong> concordas com os seguintes pontos:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Somos apenas um site que fornece links, funcionando exclusivamente como um motor de busca.</li>
                <li><strong>Não temos nenhum ficheiro</strong> com direitos de autor alojado no nosso website ou nos nossos servidores.</li>
                <li>Os links para os filmes/séries são armazenados por utilizadores em sites externos (MixDrop, UpStream, etc.) e controlados pela administração.</li>
                <li>Não nos responsabilizamos pelos conteúdos alojados por terceiros.</li>
                <li>Somos semelhantes ao Google: apenas indexamos o que já existe na internet.</li>
              </ul>
            </div>
          </section>

          {/* SECÇÃO 2: PRIVACIDADE */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wide">2. Privacidade e Dados</h2>
            <div className="space-y-4 text-gray-400">
              <p>
                Os dados dos utilizadores <strong>não serão divulgados</strong>. O LusoStream zela pela privacidade total.
              </p>
              <p>
                Ao registar-se, tem a possibilidade de escolher o seu nome de utilizador e email.
                Para sua proteção, concorda em nunca partilhar a sua palavra-passe com terceiros.
              </p>
              <p>
                Qualquer informação (comentários ou pedidos) considerada inadequada será removida pelos administradores sem aviso prévio.
              </p>
            </div>
          </section>

          {/* SECÇÃO 3: COOKIES */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wide">3. Cookies</h2>
            <p className="text-gray-400">
              Este site utiliza apenas um pequeno ficheiro (cookie) para manter a sua sessão iniciada ("Login"). O software não recolhe nem envia qualquer outro tipo de informação do seu computador.
            </p>
          </section>

          {/* SECÇÃO 4: DMCA (Versão Simples e Direta) */}
          <section id="dmca" className="scroll-mt-32 pt-6 border-t border-gray-800">
            <h2 className="text-xl font-bold text-red-500 mb-4 uppercase tracking-wide">4. DMCA / Contacto</h2>
            <p className="mb-4 text-gray-400">
              O LusoStream respeita os direitos de propriedade intelectual. Se és o detentor dos direitos de autor de algum conteúdo aqui listado e queres que o link seja removido, entra em contacto connosco.
            </p>
            
            <div className="bg-black p-6 rounded-lg border border-gray-700">
              <p className="text-white mb-2">Para remover um link, envia email com:</p>
              <ul className="list-disc list-inside text-sm text-gray-400 mb-4 ml-2">
                <li>Nome do Filme ou Série;</li>
                <li>Link (URL) da página no LusoStream.</li>
              </ul>

              <p className="text-gray-500 text-xs uppercase font-bold mb-1">Email para Contacto:</p>
              <a href="mailto:Streamyme1@proton.me" className="text-xl font-bold text-white hover:text-red-500 transition select-all">
                Streamyme1@proton.me
              </a>
              <p className="text-xs text-gray-600 mt-2 italic">
                Removemos o conteúdo o mais breve possível após a receção do email.
              </p>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}