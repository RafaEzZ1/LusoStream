import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";

// GUARDAR PROGRESSO (Chamado pelo player)
export async function saveVideoProgress(userId, mediaId, seconds, duration, type, season = null, episode = null) {
  if (!userId || !mediaId) return;

  const percentage = Math.round((seconds / duration) * 100);
  
  // ID Único para guardar na BD
  // Se for filme: "movie_123"
  // Se for série: "tv_123" (Guardamos o progresso da série no geral)
  const docId = `${type}_${mediaId}`;
  
  try {
    const progressRef = doc(db, "users", userId, "progress", docId);
    
    await setDoc(progressRef, {
      mediaId: String(mediaId),
      mediaType: type === 'series' ? 'tv' : type, // Normaliza 'series' para 'tv'
      seconds,
      duration,
      percentage,
      season: season ? Number(season) : null,
      episode: episode ? Number(episode) : null,
      updatedAt: new Date(), // Importante para ordenar
      isFinished: percentage > 90 // Marca como visto se > 90%
    }, { merge: true });
    
    console.log("Progresso guardado:", percentage + "%");
  } catch (error) {
    console.error("Erro ao guardar progresso:", error);
  }
}

// LISTAR "CONTINUAR A VER" (Chamado pela Home)
export async function listContinueWatching(userId) {
  if (!userId) return [];

  try {
    const q = query(
      collection(db, "users", userId, "progress"),
      orderBy("updatedAt", "desc"), // Os mais recentes primeiro
      limit(10)
    );

    const snapshot = await getDocs(q);
    
    // Filtra apenas os que NÃO estão acabados (< 90%)
    return snapshot.docs
      .map(doc => doc.data())
      .filter(item => item.percentage < 90); 
      
  } catch (error) {
    console.error("Erro ao listar continuar a ver:", error);
    return [];
  }
}

// MARCAR COMO VISTO MANUALMENTE
export async function markAsFinished(userId, mediaId, type, season=null, episode=null) {
    await saveVideoProgress(userId, mediaId, 100, 100, type, season, episode);
}