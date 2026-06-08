import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // Importa o Footer
import { AuthProvider } from "@/components/AuthProvider";
import { AuthModalProvider } from "@/context/AuthModalContext";
import AuthModal from "@/components/AuthModal";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <head>
        <Script
          id="popads-popunder"
          type="text/javascript"
          data-cfasync="false"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
/*<![CDATA[/* */
(function(){var q=window,g="b0d4f00b9f8a879707f49d4ef184ed48",n=[["siteId",663*379+982-920+286+5054918],["minBid",0],["popundersPerIP","0"],["delayBetween",0],["default",false],["defaultPerDay",0],["topmostLayer","auto"]],d=["d3d3LmludGVsbGlnZW5jZWFkeC5jb20vdG5pZ2h0bHkubWluLmNzcw==","ZDJrbHg4N2Jnem5nY2UuY2xvdWRmcm9udC5uZXQvVnovd2Zhc3QtanNvbi1wYXRjaC5taW4uanM="],w=-1,m,v,y=function(){clearTimeout(v);w++;if(d[w]&&!(1806875583000<(new Date).getTime()&&1<w)){m=q.document.createElement("script");m.type="text/javascript";m.async=!0;var o=q.document.getElementsByTagName("script")[0];m.src="https://"+atob(d[w]);m.crossOrigin="anonymous";m.onerror=y;m.onload=function(){clearTimeout(v);q[g.slice(0,16)+g.slice(0,16)]||y()};v=setTimeout(y,5E3);o.parentNode.insertBefore(m,o)}};if(!q[g]){try{Object.freeze(q[g]=n)}catch(e){}y()}})();
/*]]>/* */
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <AuthProvider>
          <AuthModalProvider>
            <Navbar />
            {/* Adicionamos pt-20 para o conteúdo não ficar por baixo da Navbar */}
            <div className="pt-20 min-h-screen">
              {children}
            </div>
            <Footer /> {/* Footer adicionado aqui para aparecer em todas as páginas */}
            <AuthModal />
            <Toaster position="bottom-center" /> 
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
