// src/app/terms/page.jsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="bg-black min-h-screen text-gray-300 font-sans">
      <Navbar />
      
      <main className="pt-32 px-6 max-w-4xl mx-auto pb-20">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 border-l-4 border-red-600 pl-4">
          Termos de Uso e Política DMCA
        </h1>

        <div className="space-y-8 text-sm md:text-base leading-relaxed bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao aceder e utilizar o LusoStream, o utilizador aceita cumprir estes termos. O LusoStream funciona como um motor de busca e índice de conteúdos audiovisuais disponíveis publicamente na internet.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Isenção de Responsabilidade (Disclaimer)</h2>
            <p className="mb-2">
              <strong>O LusoStream NÃO aloja, carrega ou armazena qualquer conteúdo de vídeo nos seus servidores.</strong>
            </p>
            <p>
              Todo o conteúdo multimédia acessível através deste site é alojado por serviços de terceiros (como MixDrop, UpStream, VidCloud, etc.). O LusoStream não tem controlo sobre esses conteúdos, não assume responsabilidade pela sua legalidade e não tem qualquer afiliação com os sites de alojamento.
            </p>
          </section>

          <section id="dmca" className="scroll-mt-32"> {/* ID para o link funcionar */}
            <h2 className="text-xl font-bold text-white mb-3 text-red-500">3. Direitos de Autor e DMCA</h2>
            <p className="mb-4">
              O LusoStream respeita a propriedade intelectual. Se é detentor de direitos de autor e acredita que o seu conteúdo foi indexado indevidamente, cooperaremos totalmente para remover o link do nosso índice.
            </p>
            
            <div className="bg-black/50 p-4 rounded border-l-2 border-red-600">
              <p className="font-bold text-white mb-2">Instruções para Remoção (Takedown Notice):</p>
              <p className="mb-2">Envie um email com as seguintes informações:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-400 mb-4">
                <li>Nome e identificação do trabalho protegido.</li>
                <li>O URL exato (link) no LusoStream que deseja remover.</li>
                <li>Prova de que é o detentor dos direitos ou representante legal.</li>
              </ul>
              <p className="text-white font-bold">Email para contacto: <span className="text-red-400 select-all">dmca@lusostream.xyz</span></p>
              <p className="text-xs text-gray-500 mt-1">(Substitua este email pelo seu email real ou ProtonMail)</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Uso do Site</h2>
            <p>
              O utilizador compromete-se a não utilizar o site para fins ilegais, não tentar hackear ou comprometer a segurança da plataforma e respeitar a comunidade nos comentários ou pedidos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Alterações</h2>
            <p>
              Reservamo-nos o direito de alterar estes termos a qualquer momento. O uso continuado do site implica a aceitação das novas regras.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}