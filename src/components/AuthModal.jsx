"use client";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useAuthModal } from "@/context/AuthModalContext";
import { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  createUserProfile,
  checkUsernameExists 
} from "@/lib/firebase";
import { FaTimes } from "react-icons/fa";
import toast from 'react-hot-toast';

export default function AuthModal() {
  const { isOpen, closeModal } = useAuthModal();
  const [isLogin, setIsLogin] = useState(true);
  
  // Estados do Formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); 
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN ---
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Login efetuado!");
        closeModal();
      } else {
        // --- REGISTO ---
        if (!username || username.length < 3) throw new Error("O nome deve ter pelo menos 3 letras.");
        
        // Verificar se nome existe na BD
        const exists = await checkUsernameExists(username);
        if (exists) throw new Error("Esse nome de utilizador já existe.");

        // Criar conta
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Atualizar Perfil e criar na BD
        await updateProfile(user, { displayName: username });
        await createUserProfile(user, username);

        toast.success("Conta criada! Bem-vindo.");
        closeModal();
      }
    } catch (error) {
      console.error(error);
      let msg = "Ocorreu um erro.";
      if (error.code === 'auth/email-already-in-use') msg = "Email já registado.";
      if (error.code === 'auth/wrong-password') msg = "Password errada.";
      if (error.message) msg = error.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-2xl font-bold text-white">
                    {isLogin ? "Bem-vindo de volta" : "Criar Conta"}
                  </Dialog.Title>
                  <button onClick={closeModal} className="text-gray-400 hover:text-white">
                    <FaTimes size={24} />
                  </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {/* CAMPO DE NOME (Só no registo) */}
                  {!isLogin && (
                    <div>
                      <label className="text-xs uppercase font-bold text-gray-500 ml-1">Nome de Utilizador</label>
                      <input
                        type="text"
                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                        placeholder="Ex: Tuga123"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs uppercase font-bold text-gray-500 ml-1">Email</label>
                    <input
                      type="email"
                      className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                      placeholder="email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase font-bold text-gray-500 ml-1">Password</label>
                    <input
                      type="password"
                      className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? "A processar..." : (isLogin ? "Entrar" : "Registar")}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-400">
                  {isLogin ? "Não tens conta?" : "Já tens conta?"}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-2 text-purple-400 hover:text-purple-300 font-bold underline"
                  >
                    {isLogin ? "Regista-te" : "Faz Login"}
                  </button>
                </p>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}