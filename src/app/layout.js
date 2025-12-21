// src/app/layout.js
import "./globals.css";

export const metadata = {
  title: "LusoStream",
  description: "Streamy — filmes e séries",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // respeita notch (iPhone)
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-black text-white min-h-screen">
        <div className="safe-px safe-pt">{children}</div>
      </body>
    </html>
  );
}
