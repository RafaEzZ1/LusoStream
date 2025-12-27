import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBH2DmLLTyiLWS9pejKyvCxUctD_LFkIt8",
  authDomain: "lusostream-bd1e2.firebaseapp.com",
  projectId: "lusostream-bd1e2",
  storageBucket: "lusostream-bd1e2.firebasestorage.app",
  messagingSenderId: "900869320876",
  appId: "1:900869320876:web:4be5afca9c9c4508d6ef09"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- 1. AUTH & UTILIZADORES ---

// Verificar se nome existe
export async function checkUsernameExists(username) {
  const q = query(collection(db, "users"), where("name", "==", username));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// Criar/Atualizar Perfil
export async function createUserProfile(user, customName = null) {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const finalName = customName || user.displayName || user.email.split('@')[0];
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      name: finalName,
      photoURL: user.photoURL || null,
      role: "user",
      createdAt: new Date(),
      watchlist: [],
      dismissedNotifications: [] // Inicializa o array vazio
    });
  }
}

export async function getUserData(uid) {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

// --- 2. WATCHLIST ---

export async function addToWatchlist(uid, movieId) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { watchlist: arrayUnion(movieId) });
}

export async function removeFromWatchlist(uid, movieId) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { watchlist: arrayRemove(movieId) });
}

// --- 3. REPORTES & SUGESTÕES ---

export async function createReport(data) {
  await addDoc(collection(db, "reports"), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export async function createSuggestion(data) {
  await addDoc(collection(db, "suggestions"), {
    ...data,
    status: 'pendente',
    createdAt: serverTimestamp()
  });
}

// --- 4. GESTÃO DE NOTIFICAÇÕES (NOVO) ---

// Função para "esconder" uma notificação global apenas para este user
export async function dismissNotification(uid, notificationId) {
  const userRef = doc(db, "users", uid);
  // Adiciona o ID da notificação a um array no perfil do user
  await updateDoc(userRef, {
    dismissedNotifications: arrayUnion(notificationId)
  });
}

// Exportar tudo
export { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  dismissNotification // Não esquecer de exportar a nova função!
};