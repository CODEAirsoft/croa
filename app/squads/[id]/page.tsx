import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { formatFieldCode } from "@/lib/field-code";
import { formatMemberClass, formatMemberLevel, formatMemberStatus } from "@/lib/member-display";
import { prisma } from "@/lib/prisma";
import {
  formatRankingCode,
  squadAssignmentTypeLabel,
  squadOperationalClassLabel,
  squadPositionLabel,
  squadSpecializationLabel,
} from "@/lib/squad";

export default async function SquadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const authorized = hasAdministrativeSession(cookieStore);
  const { id } = await params;

  const squad = await prisma.squad.findUnique({
    where: { id },
    include: {
      field: {
        select: {
          codeNumber: true,
          countryCode: true,
          state: true,
          name: true,
          fullAddress: true,
        },
      },
      leader: {
        select: {
          codiname: true,
          fullName: true,
          croaNumber: true,
        },
      },
      assignments: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: {
          member: {
            select: {
              croaNumber: true,
              codiname: true,
              fullName: true,
              memberClass: true,
              level: true,
              photoDataUrl: true,
            },
          },
        },
      },
    },
  });

  if (!squad) {
    notFound();
  }

  const fieldLabel = squad.field
    ? `${formatFieldCode(squad.field.codeNumber, squad.field.state, squad.field.countryCode)} | ${squad.field.name}`
    : "Campo-base não vinculado";

  const commandCount = squad.assignments.filter((item) => item.slotType === "COMANDO").length;
  const reserveCount = squad.assignments.filter((item) => item.slotType === "RESERVA").length;
  const titularCount = squad.assignments.filter((item) => item.slotType === "TITULAR").length;
  const activeSpecializations = new Set(
    squad.assignments.flatMap((assignment) => assignment.specializations.map((item) => squadSpecializationLabel(item))),
  );

  const metricCards = [
    { label: "Ranking", value: formatRankingCode(squad.rankingPoints), detail: "Pontuação atual do squad" },
    { label: "Homologação", value: formatMemberStatus(squad.status), detail: "Situação administrativa atual" },
    { label: "Titulares", value: String(titularCount).padStart(2, "0"), detail: "Base principal do squad" },
    { label: "Reservas", value: String(reserveCount).padStart(2, "0"), detail: "Suporte de composição" },
    { label: "Comando", value: String(commandCount).padStart(2, "0"), detail: "Membros em função de comando" },
    { label: "Especializações", value: String(activeSpecializations.size).padStart(2, "0"), detail: "Capacidades ativas do grupo" },
  ];

  return (
    <main className="page-shell">
      <AppShell
        title={squad.name}
        description={`Painel oficial do squad ${squad.name} no CROA.`}
      >
        <section className="card section-card squad-detail-shell">
          <div className="squad-detail-top">
            <div className="squad-detail-photo-wrap">
              <div className="squad-detail-photo">
                <Image
                  alt={`Imagem do squad ${squad.name}`}
                  fill
                  src={squad.photoDataUrl || "/cadastro-base-humana.png"}
                  style={{
                    objectFit: "cover",
                    objectPosition: `${squad.photoPositionX}% ${squad.photoPositionY}%`,
                    transform: `scale(${squad.photoScale / 100})`,
                  }}
                  unoptimized
                />
              </div>
            </div>

            <div className="squad-detail-copy">
              <span className="eyebrow">Registro oficial de squad</span>
              <h2>{squad.name}</h2>
              <div className="squad-summary-bar">
                <span>{fieldLabel}</span>
                <span>{squadOperationalClassLabel(squad.operationalClass)}</span>
                <span>{formatMemberStatus(squad.status)}</span>
              </div>
              <div className="squad-summary-bar">
                <span>Líder: {squad.leader?.codiname || squad.leader?.fullName || "Não definido"}</span>
                <span>Integrantes: {squad.assignments.length}</span>
                {squad.enrollmentDate ? <span>Inscrição: {new Intl.DateTimeFormat("pt-BR").format(squad.enrollmentDate)}</span> : null}
              </div>
              {squad.field?.fullAddress ? (
                <p className="squad-detail-address">{squad.field.fullAddress}</p>
              ) : null}

              {authorized ? (
                <div className="squad-detail-actions">
                  <Link className="button secondary" href={`/squads/${squad.id}/editar`}>
                    Editar squad
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          <div className="metric-grid squad-detail-metrics">
            {metricCards.map((card) => (
              <article className="card metric-card" key={card.label}>
                <span className="eyebrow">{card.label}</span>
                <strong>{card.value}</strong>
                <p>{card.detail}</p>
              </article>
            ))}
          </div>

          <div className="card-header">
            <span className="eyebrow">Composição do squad</span>
            <h2>Métricas e operadores vinculados</h2>
          </div>

          <div className="squad-members-grid">
            {squad.assignments.map((assignment) => (
              <article className="squad-member-card" key={assignment.id}>
                <div className="squad-member-card-top">
                  <div className="squad-member-avatar">
                    <Image
                      alt={assignment.member.codiname || assignment.member.fullName}
                      fill
                      src={assignment.member.photoDataUrl || "/member-default-photo.jpeg"}
                      unoptimized
                    />
                  </div>

                  <div className="squad-member-identity">
                    <strong>{assignment.member.codiname || assignment.member.fullName}</strong>
                    <span>{assignment.member.croaNumber ? `CROA-${String(assignment.member.croaNumber).padStart(6, "0")}` : ""}</span>
                    <small>{formatMemberClass(assignment.member.memberClass)} · {formatMemberLevel(assignment.member.level)}</small>
                  </div>
                </div>

                <div className="squad-member-detail-list">
                  <span><strong>Tipo de vaga:</strong> {squadAssignmentTypeLabel(assignment.slotType)}</span>
                  <span><strong>Posição:</strong> {squadPositionLabel(assignment.position)}</span>
                  <span>
                    <strong>Especializações:</strong>{" "}
                    {assignment.specializations.length
                      ? assignment.specializations.map((item) => squadSpecializationLabel(item)).join(", ")
                      : "Sem especialização"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </AppShell>
    </main>
  );
}
