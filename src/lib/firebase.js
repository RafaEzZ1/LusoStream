// src/lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from "firebase/firestore";

// 🔑 A TUA CONFIGURAÇÃO (Já inserida)
const firebaseConfig = {
  apiKey: "AIzaSyBH2DmLLTyiLWS9pejKyvCxUctD_LFkIt8",
  authDomain: "lusostream-bd1e2.firebaseapp.com",
  projectId: "lusostream-bd1e2",
  storageBucket: "lusostream-bd1e2.firebasestorage.app",
  messagingSenderId: "900869320876",
  appId: "1:900869320876:web:4be5afca9c9c4508d6ef09"
};

// 🚀 INICIALIZAÇÃO (Singleton para não dar erro no Next.js)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- FUNÇÕES DE AJUDA (O Cérebro do Site) ---

// 1. Criar/Atualizar Utilizador na Base de Dados ao fazer Login
export async function createUserProfile(user) {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Se é a primeira vez, cria o perfil como "user" normal
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      name: user.displayName || "Sem Nome",
      photoURL: user.photoURL || null,
      role: "user", // ⚠️ Tu vais mudar isto para 'admin' na consola do Firebase depois
      createdAt: new Date(),
      watchlist: []
    });
  }
}

// 2. Saber se é Admin ou User
export async function getUserData(uid) {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

// 3. Adicionar Filme à Watchlist
export async function addToWatchlist(uid, movieId) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    watchlist: arrayUnion(movieId)
  });
}

// 4. Remover Filme da Watchlist
export async function removeFromWatchlist(uid, movieId) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    watchlist: arrayRemove(movieId)
  });
}

// Exportar tudo para usar nas páginas
export { auth, db, googleProvider, signInWithPopup, firebaseSignOut, onAuthStateChanged };