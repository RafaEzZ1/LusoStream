import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs, serverTimestamp } from "firebase/firestore";

// GUARDAR (Save)
export async function saveVideoProgress(userId, mediaId, seconds, duration, type, season = null, episode = null) {
  if (!userId || !mediaId) return;

  const safeDuration = duration > 0 ? duration : 1;
  const percentage = Math.round((seconds / safeDuration) * 100);
  
  // Cria o ID do documento
  const docId = season && episode 
    ? `${type === 'series' ? 'tv' : type}_${mediaId}_s${season}e${episode}` 
    : `${type === 'series' ? 'tv' : type}_${mediaId}`;
  
  try {
    const progressRef = doc(db, "continue_watching", docId); // Coleção correta: continue_watching
    await setDoc(progressRef, {
      userId,
      mediaId: String(mediaId),
      mediaType: type === 'series' ? 'tv' : type,
      seconds,
      duration: safeDuration,
      percentage,
      season: season ? Number(season) : null,
      episode: episode ? Number(episode) : null,
      updatedAt: serverTimestamp(),
      isFinished: percentage > 95
    }, { merge: true });
  } catch (error) {
    console.error("Erro saveVideoProgress:", error);
  }
}

// LER (Get single)
export async function getVideoProgress(userId, mediaId, type, season = null, episode = null) {
  if (!userId || !mediaId) return null;
  
  const docId = season && episode 
    ? `${type === 'series' ? 'tv' : type}_${mediaId}_s${season}e${episode}` 
    : `${type === 'series' ? 'tv' : type}_${mediaId}`;

  try {
     const docRef = doc(db, "continue_watching", docId);
     const docSnap = await getDoc(docRef);
     // Só devolve se pertencer ao user
     if (docSnap.exists() && docSnap.data().userId === userId) {
        return docSnap.data();
     }
     return null;
  } catch(e) { return null; }
}

// LISTAR (Continue Watching)
export async function listContinueWatching(userId) {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, "continue_watching"),
      orderBy("updatedAt", "desc"), // Requer índice no Firebase
      limit(20)
    );
    const snapshot = await getDocs(q);
    // Filtrar localmente por userId para garantir segurança extra, ou usar where()
    return snapshot.docs
      .map(doc => doc.data())
      .filter(item => item.userId === userId && item.percentage < 95 && item.percentage > 0); 
  } catch (error) {
    console.error("Erro listContinueWatching:", error);
    return [];
  }
}

// MARCAR COMO VISTO
export async function markAsFinished(userId, mediaId, type, season = null, episode = null) {
  if (!userId || !mediaId) return;
  
  // Reutiliza a função de salvar, mas força 100%
  return saveVideoProgress(userId, mediaId, 0, 100, type, season, episode); // Duração fake para dar 0%, mas vamos forçar no objeto abaixo se quisermos, mas a saveVideoProgress calcula percentagem.
  // Melhor abordagem direta:
  const docId = season && episode 
    ? `${type === 'series' ? 'tv' : type}_${mediaId}_s${season}e${episode}` 
    : `${type === 'series' ? 'tv' : type}_${mediaId}`;
    
  const progressRef = doc(db, "continue_watching", docId);
  return await setDoc(progressRef, {
      userId,
      mediaId: String(mediaId),
      mediaType: type === 'series' ? 'tv' : type,
      percentage: 100,
      isFinished: true,
      updatedAt: serverTimestamp(),
      season: season ? Number(season) : null,
      episode: episode ? Number(episode) : null,
  }, { merge: true });
}