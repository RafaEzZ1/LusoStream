import { db } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from "firebase/firestore";

// Nome da coleção (tem de ser igual às regras do Firebase)
const COLLECTION_NAME = "continue_watching";

export const saveProgress = async (userId, mediaId, mediaType, progress, duration, season = null, episode = null) => {
  if (!userId) return; // Se não houver user, não faz nada (Evita erro de permissão)

  // Cria um ID único para o documento
  const uniqueId = season && episode 
    ? `${userId}_${mediaId}_s${season}e${episode}` 
    : `${userId}_${mediaId}`;

  const percentage = (progress / duration) * 100;

  try {
    const progressRef = doc(db, COLLECTION_NAME, uniqueId);
    
    await setDoc(progressRef, {
      userId,
      mediaId: mediaId.toString(),
      mediaType,
      progress,
      duration,
      percentage,
      season,
      episode,
      updatedAt: serverTimestamp()
    }, { merge: true }); // merge: true não apaga outros campos se existirem
  } catch (error) {
    console.error("Erro ao guardar progresso:", error);
  }
};

export const getProgress = async (userId, mediaId, season = null, episode = null) => {
  if (!userId) return null; // Proteção contra erro de permissão

  const uniqueId = season && episode 
    ? `${userId}_${mediaId}_s${season}e${episode}` 
    : `${userId}_${mediaId}`;

  try {
    const docRef = doc(db, COLLECTION_NAME, uniqueId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Erro getProgress:", error);
    return null;
  }
};

export const listContinueWatching = async (userId) => {
  if (!userId) return []; // CRÍTICO: Se não houver user, retorna lista vazia imediatamente

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"), // Ordena pelos vistos mais recentemente
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erro listContinueWatching:", error);
    return [];
  }
};