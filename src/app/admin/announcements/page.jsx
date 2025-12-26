"use client";
import { useState, useEffect } from "react";
import AdminClient from "../AdminClient";
import { db } from "@/lib/firebase";
// Importamos addDoc, collection, etc., para interagir com a coleção de notificações
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { searchMulti } from "@/lib/tmdb"; 
import toast from "react-hot-toast";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  
  // Estados do Formulário
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info"); // info, warning, success
  const [selectedImage, setSelectedImage] = useState(null); // Caminho da imagem (backdrop_path)
  
  // Estados da Pesquisa de Filme (Para o Anúncio)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(false);

  // Carregar avisos/notificações globais existentes
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    // Procuramos na coleção 'notifications' onde não existe userId (são as globais)
    const q = query(
      collection(db, "notifications"), 
      where("type", "==", "announcement"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // --- LÓGICA DE PESQUISA ---
  const handleSearchMovie = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const data = await searchMulti(searchQuery);
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Erro pesquisa:", error);
      toast.error("Erro na pesquisa");
    }
  };

  const selectMovieForAnnouncement = (movie) => {
    setTitle(`Novidade: ${movie.title || movie.name}`);
    setMessage(`Já está disponível no LusoStream! Corre para assistir.`);
    setSelectedImage(movie.backdrop_path || movie.poster_path); 
    setSearchResults([]);
    setSearchQuery("");
  };

  // --- CRIAR AVISO (DISPARAR NOTIFICAÇÃO GLOBAL) ---
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !message) return;

    setLoading(true);
    try {
      // Guardamos na coleção 'notifications' para o NotificationBell ler
      await addDoc(collection(db, "notifications"), {
        title,
        message,
        type: "announcement",
        movieImage: selectedImage || null, // Campo que o sininho usa para a foto
        createdAt: serverTimestamp(),
        // userId: null -> Fica implícito que é global
      });
      
      toast.success("Aviso publicado para todos os utilizadores!");
      
      // Reset
      setTitle("");
      setMessage("");
      setSelectedImage(null);
      fetchAnnouncements();
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao publicar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Apagar esta notificação para todos os utilizadores?")) return;
    try {
        await deleteDoc(doc(db, "notifications", id));
        toast.success("Notificação removida");
        fetchAnnouncements();
    } catch (error) {
        toast.error("Erro ao apagar");
    }
  };

  return (
    <AdminClient>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 border-l-4 border-yellow-500 pl-4 italic tracking-tighter uppercase">
          Gestão de Avisos Globais
        </h1>

        <div className="bg-zinc-900/50 p-6 rounded-[2.5rem] border border-white/5 mb-12 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-6">Criar Notificação Global</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 border-r border-white/5 pr-4">
              <p className="text-[10px] text-purple-500 font-black uppercase tracking-widest">Opção A: Pesquisar Filme</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Pesquisar filme para o aviso..." 
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-purple-600 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearchMovie} className="bg-purple-600 px-4 rounded-xl text-white hover:bg-purple-500 transition">🔍</button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="bg-black border border-white/10 rounded-xl max-h-48 overflow-y-auto divide-y divide-white/5">
                  {searchResults.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => selectMovieForAnnouncement(item)}
                      className="p-3 hover:bg-white/5 cursor-pointer flex gap-3 items-center transition"
                    >
                      <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} className="w-8 h-12 object-cover rounded shadow" />
                      <span className="text-xs text-zinc-300 truncate font-medium">{item.title || item.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedImage && (
                <div className="relative mt-4 rounded-2xl overflow-hidden border border-purple-500/30 group">
                   <img src={`https://image.tmdb.org/t/p/w500${selectedImage}`} className="w-full h-32 object-cover opacity-60" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-black/60 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">Poster Selecionado</span>
                   </div>
                   <button 
                    onClick={() => setSelectedImage(null)} 
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-500"
                   >✕</button>
                </div>
              )}
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Detalhes da Mensagem</p>
              
              <div>
                <input
                  type="text"
                  required
                  placeholder="Título do Aviso"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-600"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <textarea
                  required
                  placeholder="Conteúdo da mensagem que aparecerá no sininho..."
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-600 h-28 resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl hover:bg-purple-500 transition shadow-lg shadow-purple-900/20 active:scale-95"
              >
                {loading ? "A PUBLICAR..." : "DISPARAR PARA TODOS"}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span> Histórico de Notificações
          </h3>
          <div className="grid gap-4">
          {announcements.map((item) => (
            <div key={item.id} className="flex gap-4 bg-zinc-900/40 p-5 rounded-3xl border border-white/5 items-center backdrop-blur-sm group hover:border-white/10 transition">
              {item.movieImage ? (
                 <img src={`https://image.tmdb.org/t/p/w200${item.movieImage}`} className="w-14 h-20 object-cover rounded-xl shadow-lg" />
              ) : (
                 <div className="w-14 h-20 bg-white/5 rounded-xl flex items-center justify-center text-2xl border border-white/5">📢</div>
              )}

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white truncate">{item.title}</h4>
                <p className="text-zinc-500 text-xs line-clamp-2 mt-1">{item.message}</p>
                <p className="text-zinc-600 text-[9px] mt-3 font-bold uppercase tracking-widest">
                  Publicado em: {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Recentemente'}
                </p>
              </div>
              
              <button 
                onClick={() => handleDelete(item.id)}
                className="bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white p-3 rounded-2xl transition-all"
              >
                <FaTrash size={14} />
              </button>
            </div>
          ))}
          </div>
          
          {announcements.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                <p className="text-zinc-600 italic">Nenhum aviso global enviado recentemente.</p>
            </div>
          )}
        </div>
      </div>
    </AdminClient>
  );
}