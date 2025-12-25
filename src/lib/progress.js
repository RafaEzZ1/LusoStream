import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";

// GUARDAR (Save)
export async function saveVideoProgress(userId, mediaId, seconds, duration, type, season = null, episode = null) {
  if (!userId || !mediaId) return;

  // Evita erros de divisão por zero
  const safeDuration = duration > 0 ? duration : 1;
  const percentage = Math.round((seconds / safeDuration) * 100);
  
  // ID Único: "movie_550" ou "tv_12345"
  const docId = `${type === 'series' ? 'tv' : type}_${mediaId}`;
  
  try {
    const progressRef = doc(db, "users", userId, "progress", docId);
    
    await setDoc(progressRef, {
      mediaId: String(mediaId),
      mediaType: type === 'series' ? 'tv' : type,
      seconds,
      duration: safeDuration,
      percentage,
      season: season ? Number(season) : null,
      episode: episode ? Number(episode) : null,
      updatedAt: new Date(), // Importante para ordenar
      isFinished: percentage > 95 // Marca como visto se > 95%
    }, { merge: true });

  } catch (error) {
    console.error("Erro saveVideoProgress:", error);
  }
}

// LER (Get single)
export async function getVideoProgress(userId, mediaId, type) {
  if (!userId || !mediaId) return null;
  const docId = `${type === 'series' ? 'tv' : type}_${mediaId}`;
  try {
     const docRef = doc(db, "users", userId, "progress", docId);
     const docSnap = await getDoc(docRef);
     return docSnap.exists() ? docSnap.data() : null;
  } catch(e) { return null; }
}

// LISTAR (Continue Watching List)
export async function listContinueWatching(userId) {
  if (!userId) return [];

  try {
    const q = query(
      collection(db, "users", userId, "progress"),
      orderBy("updatedAt", "desc"), // Do mais recente para o mais antigo
      limit(20)
    );

    const snapshot = await getDocs(q);
    
    // Retorna apenas o que NÃO acabou (menos de 95%)
    // E que tenha pelo menos 1% visto (para não mostrar coisas que só abriste e fechaste)
    return snapshot.docs
      .map(doc => doc.data())
      .filter(item => item.percentage < 95 && item.percentage > 0); 
      
  } catch (error) {
    console.error("Erro listContinueWatching:", error);
    return [];
  }
}