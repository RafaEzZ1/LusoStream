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
          
          {/* SECÇÃO 1: A DEFESA (ESTILO MRPIRACY) */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wide">1. Aviso Legal</h2>
            <div className="space-y-4 text-gray-400">
              <p>
                Ao utilizares o <strong>LusoStream</strong> concordas com os seguintes Termos e Condições:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Somos apenas um site que fornece links, funcionando exclusivamente como um <strong>motor de busca</strong>.</li>
                <li><strong>Não temos nenhum ficheiro</strong> com direitos de autor alojado no nosso website ou nos nossos servidores.</li>
                <li>Todos os links para filmes e séries são armazenados em sites externos (como MixDrop, UpStream, etc.) e apenas indexados aqui.</li>
                <li>Não nos responsabilizamos pelo conteúdo alojado por terceiros.</li>
                <li>Este é um site de partilha de conteúdos e avaliação social, onde os utilizadores podem comentar e classificar obras.</li>
              </ul>
              <p className="font-bold text-white mt-4 border-l-2 border-yellow-500 pl-3">
                Resumindo: Somos semelhantes ao Google, apenas indexamos o que já está na internet.
              </p>
            </div>
          </section>

          {/* SECÇÃO 2: PRIVACIDADE E DADOS */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wide">2. Condições de Utilização & Privacidade</h2>
            <div className="space-y-4 text-gray-400">
              <p>
                O LusoStream zela pela privacidade do utilizador. Os dados dos utilizados <strong>não serão divulgados</strong> a terceiros.
              </p>
              <p>
                O tráfego enviado/recebido nos nossos servidores é gerido de forma a manter o anonimato.
                Ao registar-se, tem a possibilidade de escolher o seu nome de utilizador, email e password.
              </p>
              <p>
                <strong>Segurança da Conta:</strong> Ao registar esta conta, para sua proteção, concorda em nunca partilhar a sua palavra-passe com outra pessoa. Concorda também em nunca utilizar a conta de terceiros.
              </p>
              <p>
                <strong>Moderação:</strong> Qualquer informação (comentários ou pedidos) que seja considerada inadequada, ofensiva ou spam, será removida pelos administradores sem aviso prévio.
              </p>
            </div>
          </section>

          {/* SECÇÃO 3: COOKIES */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wide">3. Cookies</h2>
            <p className="text-gray-400">
              É importante referir que este software utiliza um <em>cookie</em> (pequeno ficheiro de texto) na cache do seu navegador. 
              Este serve <strong>apenas para o manter autenticado (login)</strong> e guardar as suas preferências (como a "Minha Lista"). 
              O site não recolhe nem envia qualquer outro tipo de informação do seu computador para fins publicitários ou de rastreio externo.
            </p>
          </section>

          {/* SECÇÃO 4: DMCA / CONTACTO (O TEU PROTONMAIL) */}
          <section id="dmca" className="scroll-mt-32 pt-4 border-t border-gray-800">
            <h2 className="text-xl font-bold text-red-500 mb-4 uppercase tracking-wide">4. Contacto e Remoção (DMCA)</h2>
            <p className="mb-4 text-gray-400">
              Se é detentor de direitos de autor e deseja que um link seja removido do nosso índice, envie um email com a identificação do conteúdo e o URL exato no nosso site.
            </p>
            
            <div className="bg-black p-5 rounded-lg border border-gray-700 inline-block">
              <p className="text-gray-500 text-xs uppercase font-bold mb-1">Email Oficial para Contacto:</p>
              <a href="mailto:Streamyme1@proton.me" className="text-xl md:text-2xl font-bold text-white hover:text-red-500 transition select-all">
                Streamyme1@proton.me
              </a>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}