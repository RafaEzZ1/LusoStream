import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";

// GUARDAR (Save)
export async function saveVideoProgress(userId, mediaId, seconds, duration, type, season = null, episode = null) {
  if (!userId || !mediaId) return;

  const safeDuration = duration > 0 ? duration : 1;
  const percentage = Math.round((seconds / safeDuration) * 100);
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
      updatedAt: new Date(),
      isFinished: percentage > 95
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

// LISTAR (Continue Watching)
export async function listContinueWatching(userId) {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, "users", userId, "progress"),
      orderBy("updatedAt", "desc"),
      limit(20)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => doc.data())
      .filter(item => item.percentage < 95 && item.percentage > 0); 
  } catch (error) {
    console.error("Erro listContinueWatching:", error);
    return [];
  }
}

// --- ESTA ERA A FUNÇÃO QUE FALTAVA ---
export async function markAsFinished(userId, mediaId, type, season = null, episode = null) {
  if (!userId || !mediaId) return;
  const docId = `${type === 'series' ? 'tv' : type}_${mediaId}`;
  const progressRef = doc(db, "users", userId, "progress", docId);
  
  return await setDoc(progressRef, {
    mediaId: String(mediaId),
    mediaType: type === 'series' ? 'tv' : type,
    percentage: 100, // Força 100% para sumir do "Continuar a Ver"
    updatedAt: new Date(),
    isFinished: true,
    season: season ? Number(season) : null,
    episode: episode ? Number(episode) : null,
  }, { merge: true });
}