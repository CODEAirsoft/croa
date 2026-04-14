"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { formatCroaCode } from "@/lib/croa";
import {
  formatMemberClass,
  formatMemberLevel,
  formatMemberRole,
  formatMemberStatus,
} from "@/lib/member-display";

type MemberDirectoryRow = {
  id: string;
  photoDataUrl: string | null;
  photoScale: number | null;
  photoPositionX: number | null;
  photoPositionY: number | null;
  codiname: string;
  croaNumber: number;
  fullName: string;
  birthDateLabel: string;
  enrollmentDateLabel: string;
  role: string;
  otherRole: string | null;
  memberClass: string;
  level: string;
  fieldLabel: string;
  phoneLabel: string;
  rg: string | null;
  cardHref: string;
  status: string;
  searchText: string;
};

export function MembersDirectory({
  authorized,
  rows,
}: {
  authorized: boolean;
  rows: MemberDirectoryRow[];
}) {
  const [query, setQuery] = useState("");

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) => row.searchText.includes(normalizedQuery));
  }, [query, rows]);

  const statusColumn = {
    key: "status",
    header: "Situação",
    render: (row: MemberDirectoryRow) => (
      <div className={`status-pill status-${row.status}`}>{formatMemberStatus(row.status as never)}</div>
    ),
  };

  const cardColumn = {
    key: "card",
    header: "Carteira",
    render: (row: MemberDirectoryRow) => (
      <Link className="member-card-link" href={authorized ? `${row.cardHref}?editar=1` : row.cardHref}>
        {authorized ? "Editar" : "Abrir"}
      </Link>
    ),
  };

  const limitedColumns = [
    {
      key: "photoDataUrl",
      header: "Foto",
      render: (row: MemberDirectoryRow) => (
        <Image
          alt={`Foto de ${row.fullName}`}
          className="member-table-photo"
          height={52}
          src={row.photoDataUrl || "/member-default-photo.jpeg"}
          style={{
            objectPosition: `${row.photoPositionX ?? 50}% ${row.photoPositionY ?? 50}%`,
            transform: `scale(${(row.photoScale ?? 100) / 100})`,
          }}
          unoptimized
          width={52}
        />
      ),
    },
    statusColumn,
    { key: "codiname", header: "Codinome" },
    {
      key: "croaNumber",
      header: "CROA",
      render: (row: MemberDirectoryRow) => formatCroaCode(row.croaNumber),
    },
    {
      key: "role",
      header: "Função",
      render: (row: MemberDirectoryRow) => formatMemberRole(row.role as never, row.otherRole),
    },
    {
      key: "memberClass",
      header: "Classe",
      render: (row: MemberDirectoryRow) => formatMemberClass(row.memberClass as never),
    },
    {
      key: "level",
      header: "Nível",
      render: (row: MemberDirectoryRow) => formatMemberLevel(row.level as never),
    },
    {
      key: "fieldLabel",
      header: "Campo",
      render: (row: MemberDirectoryRow) => row.fieldLabel,
    },
    cardColumn,
  ];

  const fullColumns = [
    limitedColumns[0],
    limitedColumns[1],
    limitedColumns[2],
    limitedColumns[3],
    { key: "fullName", header: "Nome completo" },
    { key: "birthDateLabel", header: "Nascimento" },
    { key: "enrollmentDateLabel", header: "Inscrição" },
    limitedColumns[4],
    limitedColumns[5],
    limitedColumns[6],
    {
      key: "fieldLabel",
      header: "Campo",
      render: (row: MemberDirectoryRow) => row.fieldLabel,
    },
    { key: "phoneLabel", header: "Telefone" },
    {
      key: "rg",
      header: "RG",
      render: (row: MemberDirectoryRow) => row.rg ?? "-",
    },
    cardColumn,
  ];

  return (
    <section className="card section-card">
      <div className="members-directory-header">
        <h2>Registro oficial de membros</h2>

        <div className="members-directory-tools">
          <label className="members-search">
            <span className="visually-hidden">Buscar membro</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome, telefone, CROA, função..."
              value={query}
            />
          </label>
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <p className="empty-state members-search-empty">
          {query.trim()
            ? `Nada foi encontrado em referência a "${query.trim()}".`
            : "Nenhum membro cadastrado ainda. Use a área de Cadastros para criar o primeiro registro."}
        </p>
      ) : (
        <DataTable
          columns={authorized ? fullColumns : limitedColumns}
          rows={filteredRows}
          tableClassName="members-table"
          wrapClassName="members-table-wrap"
        />
      )}
    </section>
  );
}
