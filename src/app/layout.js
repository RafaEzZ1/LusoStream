import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; 
import { AuthProvider } from "@/components/AuthProvider";
import { AuthModalProvider } from "@/context/AuthModalContext";
import AuthModal from "@/components/AuthModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LusoStream",
  description: "Cinema Português Online",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className={`${inter.className} bg-black text-white min-h-screen flex flex-col`}>
        <AuthProvider>
          <AuthModalProvider>

            <Navbar />
            <AuthModal /> 

            {/* O main grow garante que o footer fica sempre em baixo */}
            <main className="flex-grow">
              {children}
            </main>

            <Footer />

          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}