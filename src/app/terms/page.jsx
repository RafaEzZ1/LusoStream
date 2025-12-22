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

        <div className="space-y-12 text-base leading-relaxed bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
          
          {/* SECÇÃO 1: A DEFESA */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wide">1. Aviso Legal e Isenção de Responsabilidade</h2>
            <div className="space-y-4 text-gray-400 text-justify">
              <p>
                Ao aceder e utilizar o <strong>LusoStream</strong>, o utilizador concorda com os seguintes termos. O LusoStream opera estritamente como um motor de busca de índices audiovisuais.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>O LusoStream <strong>não aloja, carrega ou armazena</strong> qualquer ficheiro de vídeo nos seus servidores.</li>
                <li>Todo o conteúdo é fornecido por terceiros não afiliados (como MixDrop, UpStream, VidCloud, etc.).</li>
                <li>O LusoStream não tem controlo sobre o conteúdo alojado nesses sites externos e não assume qualquer responsabilidade pelo mesmo.</li>
                <li>Funcionamos de forma análoga ao Google, indexando hiperligações públicas já existentes na internet.</li>
              </ul>
            </div>
          </section>

          {/* SECÇÃO 2: PRIVACIDADE */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wide">2. Privacidade e Dados</h2>
            <div className="space-y-4 text-gray-400 text-justify">
              <p>
                O LusoStream respeita o anonimato dos seus utilizadores. Não partilhamos dados com terceiros.
                O tráfego nos nossos servidores é gerido para garantir a privacidade. As credenciais de acesso (email/password) são encriptadas e usadas estritamente para autenticação.
              </p>
              <p className="text-sm border-l-2 border-gray-600 pl-3 italic">
                Aviso: Nunca partilhe a sua palavra-passe. A administração reserva-se o direito de banir contas que demonstrem comportamento abusivo ou spam.
              </p>
            </div>
          </section>

          {/* SECÇÃO 3: COOKIES */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wide">3. Política de Cookies</h2>
            <p className="text-gray-400 text-justify">
              Utilizamos apenas cookies essenciais para manter a sessão do utilizador ativa ("Login"). Não utilizamos cookies de rastreio publicitário intrusivo nem recolhemos dados de navegação para fins comerciais.
            </p>
          </section>

          {/* SECÇÃO 4: DMCA PRO (PROFISSIONAL) */}
          <section id="dmca" className="scroll-mt-32 pt-6 border-t border-gray-800">
            <h2 className="text-xl font-bold text-red-500 mb-4 uppercase tracking-wide flex items-center gap-2">
              4. DMCA & Copyright Compliance
            </h2>
            
            <div className="text-gray-400 space-y-4 text-justify text-sm md:text-base">
              <p>
                O LusoStream respeita a propriedade intelectual de terceiros e cumpre com o <strong>Digital Millennium Copyright Act (DMCA)</strong>, Título 17 U.S.C. § 512(c).
                É nossa política responder a avisos claros de alegada violação de direitos de autor que estejam em conformidade com a lei.
              </p>

              <div className="bg-black/40 p-6 rounded-lg border border-gray-700">
                <p className="font-bold text-white mb-3 text-lg">Elementos Obrigatórios da Notificação</p>
                <p className="mb-4">Para que a sua reclamação seja válida e processada, deve incluir as seguintes informações:</p>
                
                <ol className="list-decimal list-inside space-y-2 ml-2 mb-6 text-gray-300">
                  <li>Identificação do trabalho protegido por direitos de autor que alega ter sido infringido.</li>
                  <li>Identificação do material que alega estar a infringir (o <strong>URL exato</strong> da página no LusoStream).</li>
                  <li>Informações de contacto (Nome, Morada, Telefone e Email).</li>
                  <li>Uma declaração de que tem uma <em>crença de boa fé</em> de que o uso do material não é autorizado pelo proprietário dos direitos de autor, pelo seu agente ou pela lei.</li>
                  <li>Uma declaração de que as informações na notificação são precisas e, <strong>sob pena de perjúrio</strong>, de que está autorizado a agir em nome do proprietário.</li>
                  <li>Assinatura física ou eletrónica do detentor dos direitos.</li>
                </ol>

                <div className="bg-red-900/20 border border-red-900/50 p-4 rounded mb-6 text-xs text-red-200">
                  ⚠️ <strong>Aviso Importante:</strong> Nos termos da lei, qualquer pessoa que, intencionalmente, deturpe materialmente que o material ou atividade está a infringir direitos de autor pode ser responsabilizada por danos (incluindo custos e honorários de advogados).
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 bg-gray-900 p-4 rounded border border-gray-600">
                  <span className="text-gray-400 text-sm font-bold uppercase">Agente Designado:</span>
                  <a href="mailto:Streamyme1@proton.me" className="text-xl font-bold text-white hover:text-red-500 transition font-mono select-all">
                    Streamyme1@proton.me
                  </a>
                </div>
                <p className="text-center text-xs text-gray-500 mt-2">
                  Respondemos a todos os pedidos válidos num prazo razoável.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}