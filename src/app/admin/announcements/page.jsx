"use client";
import { useState, useEffect } from "react";
import AdminClient from "../AdminClient";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, serverTimestamp } from "firebase/firestore";
import { searchMulti } from "@/lib/tmdb"; // Importar a pesquisa

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  
  // Estados do Formulário
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info"); // info, warning, success
  const [selectedImage, setSelectedImage] = useState(null); // URL da imagem
  
  // Estados da Pesquisa de Filme (Para o Anúncio)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(false);

  // Carregar anúncios existentes
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // --- LÓGICA DE PESQUISA (Igual à página de Content) ---
  const handleSearchMovie = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const data = await searchMulti(searchQuery);
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Erro pesquisa:", error);
    }
  };

  const selectMovieForAnnouncement = (movie) => {
    // Preenche automaticamente os dados do anúncio com o filme
    setTitle(`Novidade: ${movie.title || movie.name}`);
    setMessage(`Já está disponível no LusoStream! Corre para assistir.`);
    setSelectedImage(movie.backdrop_path); // Guarda o caminho da imagem
    setSearchResults([]); // Limpa a pesquisa
    setSearchQuery("");
  };

  // --- CRIAR ANÚNCIO ---
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !message) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "announcements"), {
        title,
        message,
        type,
        image: selectedImage || null, // Guarda a imagem no Firebase
        createdAt: serverTimestamp()
      });
      
      // Reset
      setTitle("");
      setMessage("");
      setSelectedImage(null);
      fetchAnnouncements();
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Apagar este aviso?")) return;
    await deleteDoc(doc(db, "announcements", id));
    fetchAnnouncements();
  };

  return (
    <AdminClient>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 border-l-4 border-yellow-500 pl-4">
          Gestão de Avisos
        </h1>

        {/* --- FORMULÁRIO DE CRIAÇÃO --- */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-12">
          <h2 className="text-xl font-bold text-white mb-4">Criar Novo Aviso</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* LADO ESQUERDO: Pesquisa de Filme (Opcional) */}
            <div className="space-y-4 border-r border-white/10 pr-4">
              <p className="text-xs text-blue-400 font-bold uppercase">Opção A: Usar Filme/Série</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Pesquisar para preencher auto..." 
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearchMovie} className="bg-blue-600 px-3 rounded text-white">🔍</button>
              </div>
              
              {/* Resultados da Pesquisa */}
              {searchResults.length > 0 && (
                <div className="bg-black/80 rounded border border-white/10 max-h-40 overflow-y-auto">
                  {searchResults.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => selectMovieForAnnouncement(item)}
                      className="p-2 hover:bg-white/20 cursor-pointer flex gap-2 items-center"
                    >
                      <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} className="w-8 h-10 object-cover" />
                      <span className="text-xs text-white truncate">{item.title || item.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Pré-visualização da Imagem Selecionada */}
              {selectedImage && (
                <div className="relative mt-4 rounded-lg overflow-hidden border border-green-500/50">
                   <img src={`https://image.tmdb.org/t/p/w500${selectedImage}`} className="w-full h-32 object-cover opacity-80" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-black/50 px-2 py-1 rounded text-xs text-white">Imagem Selecionada</span>
                   </div>
                   <button 
                    onClick={() => setSelectedImage(null)} 
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                   >✕</button>
                </div>
              )}
            </div>

            {/* LADO DIREITO: Campos de Texto */}
            <form onSubmit={handleCreate} className="space-y-4">
              <p className="text-xs text-gray-400 font-bold uppercase">Detalhes do Aviso</p>
              
              <div>
                <label className="block text-gray-400 text-xs mb-1">Título</label>
                <input
                  type="text"
                  required
                  className="w-full bg-black border border-white/10 rounded px-4 py-2 text-white outline-none focus:border-purple-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1">Mensagem</label>
                <textarea
                  required
                  className="w-full bg-black border border-white/10 rounded px-4 py-2 text-white outline-none focus:border-purple-500 h-24"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1">Tipo de Aviso</label>
                <select 
                  className="w-full bg-black border border-white/10 rounded px-4 py-2 text-white"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="info">🔵 Informação (Azul)</option>
                  <option value="success">🟢 Novidade / Sucesso (Verde)</option>
                  <option value="warning">🔴 Aviso Importante (Vermelho)</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition"
              >
                {loading ? "A publicar..." : "Publicar Aviso"}
              </button>
            </form>
          </div>
        </div>

        {/* --- LISTA DE AVISOS ATIVOS --- */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Avisos Ativos</h3>
          {announcements.map((item) => (
            <div key={item.id} className="flex gap-4 bg-zinc-900 p-4 rounded-xl border border-white/5 items-start">
              {/* Imagem do Aviso (Se tiver) */}
              {item.image ? (
                 <img src={`https://image.tmdb.org/t/p/w200${item.image}`} className="w-24 h-16 object-cover rounded-lg" />
              ) : (
                 <div className="w-24 h-16 bg-white/10 rounded-lg flex items-center justify-center text-2xl">📢</div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-white">{item.title}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold 
                    ${item.type === 'success' ? 'bg-green-500 text-black' : 
                      item.type === 'warning' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                    {item.type}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{item.message}</p>
                <p className="text-gray-600 text-xs mt-2">
                  {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Agora'}
                </p>
              </div>
              
              <button 
                onClick={() => handleDelete(item.id)}
                className="text-red-500 hover:text-red-400 p-2"
              >
                🗑️
              </button>
            </div>
          ))}
          
          {announcements.length === 0 && (
            <p className="text-gray-500 text-center py-8">Nenhum aviso ativo no momento.</p>
          )}
        </div>
      </div>
    </AdminClient>
  );
}