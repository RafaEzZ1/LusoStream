import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// Para Filmes
export async function getMovieEmbed(tmdbId) {
  try {
    const docRef = doc(db, "embeds", String(tmdbId));
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().streamUrl : null;
  } catch (error) {
    console.error("Erro embed filme:", error);
    return null;
  }
}

// Para Séries (CORRIGIDO)
export async function getEpisodeEmbed(tmdbId, season, episode) {
  try {
    // ⚠️ O formato tem de bater certo com o Admin: "ID_S1_E1"
    const episodeId = `${tmdbId}_S${season}_E${episode}`;
    
    const docRef = doc(db, "embeds", episodeId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().streamUrl : null;
  } catch (error) {
    console.error("Erro embed episódio:", error);
    return null;
  }
}