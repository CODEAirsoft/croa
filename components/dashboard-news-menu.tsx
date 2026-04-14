"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type NewsItem = {
  id: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  createdAt: string;
  imageDataUrl: string | null;
  imagePositionX: number;
  imagePositionY: number;
  imageScale: number;
};

function formatDateLabel(value: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getSearchableDateParts(value: string) {
  try {
    const date = new Date(value);
    const formatted = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
    return [formatted, formatted.replace(/\//g, ""), value.slice(0, 10)];
  } catch {
    return [value];
  }
}

export function DashboardNewsMenu({ items }: { items: NewsItem[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => {
      const searchable = [
        item.title,
        item.excerpt ?? "",
        item.body ?? "",
        ...getSearchableDateParts(item.createdAt),
      ];
      return searchable.some((part) => part.toLowerCase().includes(normalized));
    });
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / 10));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice((currentPage - 1) * 10, currentPage * 10);

  function changePage(nextPage: number) {
    setPage(Math.max(1, Math.min(totalPages, nextPage)));
  }

  return (
    <article className="card section-card news-menu-card">
      <div className="card-header news-menu-header">
        <div>
          <span className="eyebrow">Menu de notícias</span>
          <h2>Redação integrada ao CROA</h2>
        </div>
        <label className="news-menu-search">
          <span className="visually-hidden">Buscar notícias</span>
          <input
            placeholder="Buscar notícia"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>

      <div className="news-menu-list">
        {paginatedItems.map((post) => (
          <Link className="news-menu-item" href={`/noticias/${post.id}`} key={post.id}>
            {post.imageDataUrl ? (
              <div className="news-menu-image">
                <Image
                  alt={post.title}
                  fill
                  src={post.imageDataUrl}
                  style={{
                    objectFit: "cover",
                    objectPosition: `${post.imagePositionX}% ${post.imagePositionY}%`,
                    transform: `scale(${post.imageScale / 100})`,
                  }}
                  unoptimized
                />
              </div>
            ) : (
              <div className="news-menu-image news-menu-image-placeholder" />
            )}
            <div className="news-menu-copy">
              <div className="news-menu-topline">
                <strong>{post.title}</strong>
                <span className="news-menu-date">{formatDateLabel(post.createdAt)}</span>
              </div>
              <p>{post.excerpt || "Comunicado oficial do CROA."}</p>
            </div>
          </Link>
        ))}
        {!filteredItems.length ? (
          <p className="empty-state">
            Nada foi encontrado em referência a <strong>{query}</strong>.
          </p>
        ) : null}
      </div>

      {filteredItems.length ? (
        <div className="news-menu-pagination">
          <button className="button secondary" disabled={currentPage === 1} type="button" onClick={() => changePage(currentPage - 1)}>
            Anterior
          </button>
          <span>{`Página ${currentPage} de ${totalPages}`}</span>
          <button className="button secondary" disabled={currentPage === totalPages} type="button" onClick={() => changePage(currentPage + 1)}>
            Próxima
          </button>
        </div>
      ) : null}
    </article>
  );
}
