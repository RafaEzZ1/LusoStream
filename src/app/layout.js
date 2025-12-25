import { Inter } from "next/font/google";
import "./globals.css"; // Isto carrega o estilo
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
      <body className={inter.className}>
        <AuthProvider>
          <AuthModalProvider>
            <div className="flex flex-col min-h-screen bg-black text-white">
              <Navbar />
              <AuthModal />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}