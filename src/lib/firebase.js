import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword, // <--- Importante para o registo manual
  updateProfile, // <--- Para atualizar o nome no Auth
  signInWithEmailAndPassword // <--- Para o login
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

// --- FUNÇÕES ---

// 1. Verificar se nome de utilizador já existe
export async function checkUsernameExists(username) {
  const q = query(collection(db, "users"), where("name", "==", username));
  const snapshot = await getDocs(q);
  return !snapshot.empty; // Retorna true se existir, false se estiver livre
}

// 2. Criar Perfil (Atualizado para aceitar nome customizado)
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
      watchlist: []
    });
  }
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
  updateProfile
};