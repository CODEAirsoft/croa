"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useMemo, useState } from "react";

type OfferingRow = {
  id: string;
  title: string;
  category: string;
  summary: string;
  placeLabel: string;
  dateLabel: string;
  deadlineLabel: string;
  priceLabel: string;
  seatsLabel: string;
  reserveHref: string;
  reserveLabel: string;
  imageSrc: string;
  searchText: string;
};

export function OfferingsDirectory({
  kindLabel,
  authorized,
  rows,
  editHrefBase,
}: {
  kindLabel: string;
  authorized: boolean;
  rows: OfferingRow[];
  editHrefBase: string;
}) {
  const [query, setQuery] = useState("");
  const [previewImage, setPreviewImage] = useState<{ alt: string; src: string } | null>(null);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) => row.searchText.includes(normalized));
  }, [query, rows]);

  return (
    <section className="card section-card">
      <div className="members-directory-header">
        <h2>{`Registro oficial de ${kindLabel.toLowerCase()}`}</h2>

        <div className="members-directory-tools">
          <label className="members-search">
            <span className="visually-hidden">{`Buscar ${kindLabel}`}</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Buscar ${kindLabel.toLowerCase()}...`}
              value={query}
            />
          </label>
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <p className="empty-state members-search-empty">
          {query.trim()
            ? `Nada foi encontrado em referência a "${query.trim()}".`
            : `Nenhum ${kindLabel.toLowerCase()} cadastrado ainda.`}
        </p>
      ) : (
        <div className="offerings-grid">
          {filteredRows.map((row) => (
            <article className="offering-card" key={row.id}>
              <button
                type="button"
                className="offering-card-image-button"
                onClick={() => setPreviewImage({ alt: row.title, src: row.imageSrc })}
              >
                <div className="offering-card-image">
                  <Image alt={row.title} fill sizes="(max-width: 900px) 100vw, 33vw" src={row.imageSrc} unoptimized />
                </div>
              </button>

              <div className="offering-card-copy">
                <span className="eyebrow">{row.category}</span>
                <h3>{row.title}</h3>
                <p>{row.summary}</p>

                <div className="offering-card-meta">
                  <span><strong>Data:</strong> {row.dateLabel}</span>
                  <span><strong>Local:</strong> {row.placeLabel}</span>
                  <span><strong>Inscrição:</strong> {row.deadlineLabel}</span>
                  <span><strong>Valor:</strong> {row.priceLabel}</span>
                  <span><strong>Vagas:</strong> {row.seatsLabel}</span>
                </div>

                <div className="offering-card-actions">
                  <a className="button primary" href={row.reserveHref} rel="noreferrer" target="_blank">
                    {row.reserveLabel}
                  </a>

                  {authorized ? (
                    <Link className="button secondary" href={`${editHrefBase}/${row.id}/editar`}>
                      Editar
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {previewImage && typeof document !== "undefined"
        ? createPortal(
            <div className="field-image-modal-backdrop" onClick={() => setPreviewImage(null)} role="presentation">
              <div
                aria-label={previewImage.alt}
                aria-modal="true"
                className="field-image-modal"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
              >
                <button
                  type="button"
                  className="field-image-modal-close"
                  onClick={() => setPreviewImage(null)}
                  aria-label="Fechar imagem"
                >
                  X
                </button>
                <Image
                  alt={previewImage.alt}
                  className="field-image-modal-image"
                  fill
                  sizes="70vw"
                  src={previewImage.src}
                  style={{ objectFit: "contain", objectPosition: "center" }}
                  unoptimized
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
