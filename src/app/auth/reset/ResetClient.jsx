"use client";

import Link from "next/link";

/**
 * Mantemos isto **sem** useSearchParams para não disparar o erro de CSR bailout.
 * Se precisares de tratar tokens de recuperação, fazemos noutra rota/API.
 */
export default function ResetClient() {
  return (
    <div className="space-y-3 text-gray-300">
      <p>
        Se chegaste aqui através de um link de recuperação, volta à página{" "}
        <Link href="/auth" className="text-red-400 underline">
          Entrar / Criar conta
        </Link>{" "}
        para concluir o processo.
      </p>
      <p className="text-sm text-gray-400">
        (Esta página existe só para evitar erros de build quando o Next tenta
        pré-renderizar.) 
      </p>
    </div>
  );
}
