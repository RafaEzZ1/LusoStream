"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function DynamicTitle({ movieTitle, seriesTitle, searchQuery }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let title = "LusoStream";

    // Página inicial
    if (pathname === "/") {
      title = "Página Principal - LusoStream";
    }

    // Página de filme
    else if (pathname.startsWith("/movies/")) {
      title = movieTitle ? `${movieTitle} - LusoStream` : "Filme - LusoStream";
    }

    // Página de série
    else if (pathname.startsWith("/series/")) {
      title = seriesTitle ? `${seriesTitle} - LusoStream` : "Série - LusoStream";
    }

    // Página de pesquisa
    else if (pathname.startsWith("/search")) {
      const query = searchQuery || searchParams.get("q") || "";
      title = query ? `Pesquisa: ${query} - LusoStream` : "Pesquisar - LusoStream";
    }

    // Atualiza o título
    document.title = title;
  }, [pathname, movieTitle, seriesTitle, searchQuery, searchParams]);

  return null;
}
