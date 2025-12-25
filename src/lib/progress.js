import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";

// GUARDAR PROGRESSO (Save)
export async function saveVideoProgress(userId, mediaId, seconds, duration, type, season = null, episode = null) {
  if (!userId || !mediaId) return;

  const percentage = Math.round((seconds / duration) * 100);
  const docId = `${type}_${mediaId}`;
  
  try {
    const progressRef = doc(db, "users", userId, "progress", docId);
    
    await setDoc(progressRef, {
      mediaId: String(mediaId),
      mediaType: type === 'series' ? 'tv' : type,
      seconds,
      duration,
      percentage,
      season: season ? Number(season) : null,
      episode: episode ? Number(episode) : null,
      updatedAt: new Date(),
      isFinished: percentage > 90
    }, { merge: true });
  } catch (error) {
    console.error("Erro ao guardar progresso:", error);
  }
}

// LER PROGRESSO (Get - Faltava esta função!)
export async function getVideoProgress(userId, mediaId, type) {
  if (!userId || !mediaId) return null;
  const docId = `${type}_${mediaId}`;
  try {
     const docRef = doc(db, "users", userId, "progress", docId);
     const docSnap = await getDoc(docRef);
     return docSnap.exists() ? docSnap.data() : null;
  } catch(e) { return null; }
}

// LISTAR TUDO (Continue Watching)
export async function listContinueWatching(userId) {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, "users", userId, "progress"),
      orderBy("updatedAt", "desc"),
      limit(10)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => doc.data())
      .filter(item => item.percentage < 90); 
  } catch (error) {
    console.error("Erro lista:", error);
    return [];
  }
}

// MARCAR VISTO
export async function markAsFinished(userId, mediaId, type, season=null, episode=null) {
    await saveVideoProgress(userId, mediaId, 100, 100, type, season, episode);
}