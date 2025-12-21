// src/components/Carousel.jsx
"use client";

import { useRef, useState } from "react";
import Link from "next/link";

export default function Carousel({ items = [], title }) {
  const containerRef = useRef(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  if (!items?.length) return null;

  // ---- DRAG COM RATO ----
  function handleMouseDown(e) {
    // só botão esquerdo
    if (e.button !== 0) return;
    if (!containerRef.current) return;

    isDownRef.current = true;
    setDragging(false);

    // posição inicial
    startXRef.current = e.pageX;
    scrollLeftRef.current = containerRef.current.scrollLeft;
  }

  function handleMouseMove(e) {
    if (!isDownRef.current || !containerRef.current) return;

    // diferença desde o início do drag
    const dx = e.pageX - startXRef.current;

    // se o movimento já for razoável, marcamos como drag e não click
    if (Math.abs(dx) > 5 && !dragging) {
      setDragging(true);
    }

    // multiplicador para ficar mais "leve" / rápido
    const multiplier = 1.2;
    containerRef.current.scrollLeft = scrollLeftRef.current - dx * multiplier;

    // evitar seleccionar texto enquanto arrastamos
    e.preventDefault();
  }

  function handleMouseUp() {
    isDownRef.current = false;
    // não limpamos dragging já aqui para o click seguinte conseguir ver este estado
  }

  function handleMouseLeave() {
    isDownRef.current = false;
  }

  // se estivermos a arrastar, bloqueamos o click nos links
  function handleClickCapture(e) {
    if (dragging) {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
    }
  }

  // impedir drag nativo da imagem/link
  function handleDragStart(e) {
    e.preventDefault();
  }

  // ---- SETAS COM SCROLL SUAVE POR "PÁGINAS" ----
  function scrollByAmount(sign) {
    const container = containerRef.current;
    if (!container) return;

    const step = container.clientWidth * 0.9; // quase uma página inteira
    container.scrollBy({
      left: step * sign,
      behavior: "smooth",
    });
  }

  function scrollLeft() {
    scrollByAmount(-1);
  }

  function scrollRight() {
    scrollByAmount(1);
  }

  return (
    <section className="w-full">
      {title && (
        <h3 className="text-xl md:text-2xl font-bold mb-2 px-2 md:px-0">
          {title}
        </h3>
      )}

      <div className="relative">
        {/* botões de navegação (desktop) */}
        <button
          type="button"
          onClick={scrollLeft}
          className="
            hidden md:flex items-center justify-center
            absolute left-0 top-1/2 -translate-y-1/2 z-10
            h-10 w-10 rounded-full bg-black/60 border border-white/10
            hover:bg-black/80 transition
          "
        >
          ‹
        </button>

        <button
          type="button"
          onClick={scrollRight}
          className="
            hidden md:flex items-center justify-center
            absolute right-0 top-1/2 -translate-y-1/2 z-10
            h-10 w-10 rounded-full bg-black/60 border border-white/10
            hover:bg-black/80 transition
          "
        >
          ›
        </button>

        <div
          ref={containerRef}
          className={`
            flex gap-3 overflow-x-auto pb-3
            no-scrollbar
            select-none
            ${dragging ? "cursor-grabbing" : "cursor-grab"}
          `}
          style={{
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "smooth", // ajuda no scroll "normal" / setas
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onClickCapture={handleClickCapture}
          onDragStart={handleDragStart}
        >
          {items.map((it) => {
            const href =
              it.type === "movie" ? `/movies/${it.id}` : `/series/${it.id}`;

            const img = it.poster_path
              ? `https://image.tmdb.org/t/p/w342${it.poster_path}`
              : it.image || "/no-image.jpg";

            return (
              <Link
                key={`${it.type || "item"}-${it.id}`}
                href={href}
                className="group relative flex-none w-[140px] md:w-[170px]"
                prefetch={false}
                draggable={false}
                onDragStart={handleDragStart}
              >
                <div className="rounded-xl overflow-hidden bg-gray-900/60 border border-gray-800 shadow-md
            transition-transform duration-300
            group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:scale-[1.02]">
                  <div className="relative w-[140px] h-[210px] md:w-[170px] md:h-[255px]">
                    <img
                      src={img}
                      alt={it.title || it.name || "Poster"}
                      className="w-full h-full object-cover block"
                      loading="lazy"
                      draggable={false}
                      onDragStart={handleDragStart}
                    />

                    {/* overlay escuro + ícone de play ao centro no hover (desktop) */}
                    <div className="pointer-events-none absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center">
                        <span
                          className="
                            ml-[2px]
                            inline-block
                            border-l-[10px] border-l-black
                            border-y-[6px] border-y-transparent
                          "
                        />
                      </div>
                    </div>
                  </div>

                  {/* título no hover, em baixo */}
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[12px] md:text-sm font-semibold line-clamp-2">
                      {it.title || it.name || "Sem título"}
                    </p>
                  </div>
                </div>

                {/* subtítulo sempre visível (por ex. progressLabel para séries) */}
                {it.progressLabel ? (
                  <p className="mt-1 text-xs text-gray-400">
                    {it.progressLabel}
                  </p>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
