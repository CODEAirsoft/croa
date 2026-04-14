"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { DataTable } from "@/components/data-table";

type FieldDirectoryRow = {
  id: string;
  photoDataUrl: string | null;
  codeLabel: string;
  name: string;
  cnpj: string | null;
  managerLabel: string;
  refereeLabel: string;
  contactPhone: string;
  searchText: string;
};

export function FieldsDirectory({
  authorized,
  rows,
}: {
  authorized: boolean;
  rows: FieldDirectoryRow[];
}) {
  const [query, setQuery] = useState("");
  const [previewImage, setPreviewImage] = useState<{ alt: string; src: string } | null>(null);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) => row.searchText.includes(normalizedQuery));
  }, [query, rows]);

  const limitedColumns = [
    {
      key: "photoDataUrl",
      header: "Imagem",
      render: (row: FieldDirectoryRow) => (
        <button
          type="button"
          className="field-table-photo-button"
          onClick={() =>
            setPreviewImage({
              alt: `Imagem do campo ${row.name}`,
              src: row.photoDataUrl || "/cadastro-campos.png",
            })
          }
        >
          <Image
            alt={`Imagem do campo ${row.name}`}
            className="field-table-photo"
            height={52}
            src={row.photoDataUrl || "/cadastro-campos.png"}
            width={84}
          />
        </button>
      ),
    },
    { key: "codeLabel", header: "Registro" },
    { key: "name", header: "Campo" },
    { key: "managerLabel", header: "Proprietário" },
    { key: "contactPhone", header: "Contato" },
  ];

  const fullColumns = [
    limitedColumns[0],
    limitedColumns[1],
    limitedColumns[2],
    {
      key: "cnpj",
      header: "CNPJ",
      render: (row: FieldDirectoryRow) => row.cnpj ?? "-",
    },
    { key: "managerLabel", header: "Proprietário" },
    { key: "refereeLabel", header: "Árbitro" },
    { key: "contactPhone", header: "Contato" },
    {
      key: "edit",
      header: "Editar",
      render: (row: FieldDirectoryRow) => (
        <Link className="member-card-link" href={`/campos/${row.id}/editar`}>
          Editar
        </Link>
      ),
    },
  ];

  return (
    <section className="card section-card">
      <div className="members-directory-header">
        <h2>Registro oficial de campos</h2>

        <div className="members-directory-tools">
          <label className="members-search">
            <span className="visually-hidden">Buscar campo</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por campo, registro, responsável, CNPJ..."
              value={query}
            />
          </label>
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <p className="empty-state members-search-empty">
          {query.trim()
            ? `Nada foi encontrado em referência a "${query.trim()}".`
            : "Nenhum campo cadastrado ainda. Use a área de Cadastros para criar o primeiro registro."}
        </p>
      ) : (
        <DataTable
          columns={authorized ? fullColumns : limitedColumns}
          rows={filteredRows}
          tableClassName="members-table"
          wrapClassName="members-table-wrap"
        />
      )}

      {previewImage && typeof document !== "undefined"
        ? createPortal(
        <div
          className="field-image-modal-backdrop"
          onClick={() => setPreviewImage(null)}
          role="presentation"
        >
          <div
            className="field-image-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={previewImage.alt}
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
              unoptimized
              style={{ objectFit: "contain", objectPosition: "center" }}
            />
          </div>
        </div>
          ,
          document.body,
        )
        : null}
    </section>
  );
}
