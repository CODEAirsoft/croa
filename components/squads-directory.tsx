"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";

type SquadDirectoryRow = {
  id: string;
  name: string;
  photoDataUrl: string;
  fieldLabel: string;
  operationalClassLabel: string;
  leaderLabel: string;
  memberCountLabel: string;
  rankingLabel: string;
  statusLabel: string;
  status: string;
  searchText: string;
};

export function SquadsDirectory({
  authorized,
  rows,
}: {
  authorized: boolean;
  rows: SquadDirectoryRow[];
}) {
  const [query, setQuery] = useState("");

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) => row.searchText.includes(normalizedQuery));
  }, [query, rows]);

  const baseColumns = [
    {
      key: "photo",
      header: "Foto",
      render: (row: SquadDirectoryRow) => (
        <div className="squad-table-photo">
          <Image
            alt={`Imagem de ${row.name}`}
            className="squad-table-photo"
            height={52}
            src={row.photoDataUrl || "/cadastro-base-humana.png"}
            unoptimized
            width={52}
          />
        </div>
      ),
    },
    {
      key: "statusLabel",
      header: "Homologação",
      render: (row: SquadDirectoryRow) => (
        <div className={`status-pill squad-status-pill status-${row.status}`}>
          {row.statusLabel}
        </div>
      ),
    },
    { key: "name", header: "Squad" },
    { key: "fieldLabel", header: "Campo-base" },
    { key: "operationalClassLabel", header: "Classe operacional" },
    { key: "leaderLabel", header: "Líder" },
    { key: "memberCountLabel", header: "Integrantes" },
    { key: "rankingLabel", header: "Ranking" },
    {
      key: "open",
      header: "Abrir",
      render: (row: SquadDirectoryRow) => (
        <Link className="member-card-link" href={`/squads/${row.id}`}>
          Abrir
        </Link>
      ),
    },
  ];

  const fullColumns = [
    ...baseColumns.slice(0, -1),
    {
      key: "edit",
      header: "Editar",
      render: (row: SquadDirectoryRow) => (
        <Link className="member-card-link" href={`/squads/${row.id}/editar`}>
          Editar
        </Link>
      ),
    },
  ];

  return (
    <section className="card section-card">
      <div className="members-directory-header">
        <h2>Registro oficial de squads</h2>

        <div className="members-directory-tools">
          <label className="members-search">
            <span className="visually-hidden">Buscar squad</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por squad, campo, líder, classe..."
              value={query}
            />
          </label>
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <p className="empty-state members-search-empty">
          {query.trim()
            ? `Nada foi encontrado em referência a "${query.trim()}".`
            : "Nenhum squad cadastrado ainda. Use a área de Cadastros para criar o primeiro registro."}
        </p>
      ) : (
        <DataTable
          columns={authorized ? fullColumns : baseColumns}
          rows={filteredRows}
          tableClassName="members-table"
          wrapClassName="members-table-wrap"
        />
      )}
    </section>
  );
}
