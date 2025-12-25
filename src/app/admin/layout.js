// src/app/admin/layout.js
export const metadata = {
  title: "Admin Panel - LusoStream",
  description: "Gestão de conteúdo",
  robots: "noindex, nofollow", // Impede o Google de ler o admin
};

export default function AdminLayout({ children }) {
  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      {/* O AdminClient (dentro das pages) tratará da segurança */}
      {children}
    </div>
  );
}