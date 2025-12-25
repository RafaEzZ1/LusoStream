import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";

// Salvar progresso
export async function saveVideoProgress(userId, mediaId, currentTime, duration, type = "movie", season = null, episode = null) {
  if (!userId || !mediaId) return;

  // ID do documento: "movie_123" ou "series_123_s1e1"
  const docId = type === "movie" ? `movie_${mediaId}` : `series_${mediaId}_s${season}e${episode}`;
  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  try {
    await setDoc(doc(db, "users", userId, "progress", docId), {
      mediaId: String(mediaId),
      type,
      season,
      episode,
      currentTime,
      duration,
      percentage,
      updatedAt: new Date(),
      finished: percentage > 90
    }, { merge: true });
  } catch (error) {
    console.error("Erro ao salvar progresso:", error);
  }
}

// Marcar como visto (Botão)
export async function markAsFinished(userId, mediaId, type = "movie", season = null, episode = null) {
  const docId = type === "movie" ? `movie_${mediaId}` : `series_${mediaId}_s${season}e${episode}`;
  try {
    await setDoc(doc(db, "users", userId, "progress", docId), {
      mediaId: String(mediaId),
      type,
      season,
      episode,
      percentage: 100,
      finished: true,
      updatedAt: new Date()
    }, { merge: true });
  } catch (e) { console.error(e); }
}

// Listar "Continuar a Ver" para a Home
export async function listContinueWatching(userId) {
  try {
    const q = query(collection(db, "users", userId, "progress"), orderBy("updatedAt", "desc"), limit(10));
    const snapshot = await getDocs(q);
    
    // Retorna apenas os que não acabaram (<90%)
    return snapshot.docs
      .map(doc => doc.data())
      .filter(item => item.percentage < 90 && item.percentage > 5);
  } catch (error) {
    console.error("Erro listar progresso:", error);
    return [];
  }
}

// Obter progresso único
export async function getVideoProgress(userId, mediaId, type="movie", season=null, episode=null) {
  const docId = type === "movie" ? `movie_${mediaId}` : `series_${mediaId}_s${season}e${episode}`;
  try {
    const snap = await getDoc(doc(db, "users", userId, "progress", docId));
    return snap.exists() ? snap.data().currentTime : 0;
  } catch (e) { return 0; }
}