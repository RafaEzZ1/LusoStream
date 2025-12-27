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

// Nome da coleção (tem de coincidir com as regras do Firebase)
const COLLECTION_NAME = "continue_watching";

// --- FUNÇÕES PRINCIPAIS (SEGURAS) ---

export const saveProgress = async (userId, mediaId, mediaType, progress, duration, season = null, episode = null) => {
  if (!userId) return; // Segurança: Não grava sem user

  const uniqueId = season && episode 
    ? `${userId}_${mediaId}_s${season}e${episode}` 
    : `${userId}_${mediaId}`;

  const percentage = duration > 0 ? (progress / duration) * 100 : 0;

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
    }, { merge: true });
  } catch (error) {
    console.error("Erro ao guardar progresso:", error);
  }
};

export const getProgress = async (userId, mediaId, season = null, episode = null) => {
  if (!userId) return null; // Segurança

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
  if (!userId) return []; // Segurança crítica

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
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

// --- SECÇÃO DE COMPATIBILIDADE (CORRIGE O ERRO DO VERCEL) ---
// Estas funções mapeiam os nomes antigos para as funções novas

export const saveVideoProgress = saveProgress;

export const getVideoProgress = getProgress;

export const markAsFinished = async (userId, mediaId, mediaType, duration, season = null, episode = null) => {
  // Marca como 100% visto (progresso = duração)
  return saveProgress(userId, mediaId, mediaType, duration, duration, season, episode);
};