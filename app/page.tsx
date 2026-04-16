import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { DashboardNewsMenu } from "@/components/dashboard-news-menu";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { formatFieldCode } from "@/lib/field-code";
import { formatDateTimeLabel, formatRecurrenceLabel, getNextRecurringDate } from "@/lib/offerings";
import { prisma } from "@/lib/prisma";

const prismaNews = prisma as any;

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="card metric-card">
      <span className="eyebrow">{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

export default async function Home() {
  const cookieStore = await cookies();
  hasAdministrativeSession(cookieStore);

  const [membersCount, activeMembersCount, fields, squads, events, courses, newsPosts] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { status: "ativo" } }),
    prisma.field.findMany({
      orderBy: { codeNumber: "asc" },
      select: { id: true, name: true, codeNumber: true, countryCode: true, state: true, ownerName: true, city: true },
    }),
    prisma.squad.findMany({
      orderBy: [{ rankingPoints: "desc" }, { name: "asc" }],
      take: 6,
      include: {
        field: { select: { codeNumber: true, countryCode: true, state: true, name: true } },
        leader: { select: { codiname: true, fullName: true } },
      },
    }),
    prisma.eventRecord.findMany({
      orderBy: [{ startAt: "asc" }, { title: "asc" }],
      take: 8,
      include: {
        field: { select: { codeNumber: true, countryCode: true, state: true, name: true } },
      },
    }),
    prisma.courseRecord.findMany({
      orderBy: [{ startAt: "asc" }, { title: "asc" }],
      take: 6,
      include: {
        field: { select: { codeNumber: true, countryCode: true, state: true, name: true } },
      },
    }),
    prismaNews.newsPost.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        event: { select: { id: true, title: true } },
        course: { select: { id: true, title: true } },
      },
    }),
  ]);

  const activeFieldsCount = fields.length;
  const activeEventsCount = events.filter((item: any) => item.status !== "cancelado").length;
  const activeCoursesCount = courses.filter((item: any) => item.active).length;

  const keyMetrics = [
    { label: "Membros", value: String(membersCount).padStart(4, "0"), detail: `${activeMembersCount} com homologação ativa` },
    { label: "Campos", value: String(activeFieldsCount).padStart(2, "0"), detail: "Base territorial oficial cadastrada" },
    { label: "Eventos", value: String(activeEventsCount).padStart(2, "0"), detail: "Agenda operacional em circulação" },
    { label: "Cursos", value: String(activeCoursesCount).padStart(2, "0"), detail: "Treinos, avaliações e formação" },
  ];

  const upcomingEvents = events.map((event: any) => {
    const nextOccurrence = event.recurringEnabled ? getNextRecurringDate(event.startAt, event.recurrenceFrequency) : null;
    return {
      id: event.id,
      title: event.title,
      status: event.status,
      statusClass:
        event.status === "inscricoes-abertas"
          ? "status-ok"
          : event.status === "lotado"
            ? "status-excluded"
            : event.status === "cancelado"
              ? "status-excluded"
              : "status-warn",
      dateLabel: event.recurringEnabled
        ? `Evento recorrente · ${formatRecurrenceLabel(event.recurrenceFrequency)} · Próxima: ${formatDateTimeLabel(nextOccurrence ?? event.startAt)}`
        : event.endAt
          ? `${formatDateTimeLabel(event.startAt)} até ${formatDateTimeLabel(event.endAt)}`
          : formatDateTimeLabel(event.startAt),
      location:
        event.field
          ? `${formatFieldCode(event.field.codeNumber, event.field.state, event.field.countryCode)} | ${event.field.name}`
          : [event.city, event.state].filter(Boolean).join(" / ") || "Local a definir",
    };
  });

  return (
    <main className="page-shell">
      <AppShell title="Dashboard" description="Painel central do CROA para acompanhar operação, cadastros, treinos, evolução e movimento do sistema.">
        <section className="dashboard-news-grid">
          <section className="hero hero-panel-only">
            <aside className="hero-panel card">
              <span className="eyebrow">Panorama imediato</span>
              <h2>Leitura operacional do ecossistema</h2>
              <div className="metric-grid">
                {keyMetrics.map((metric) => (
                  <MetricCard key={metric.label} {...metric} />
                ))}
              </div>
            </aside>
          </section>

          <DashboardNewsMenu
            items={(newsPosts as any[]).map((post) => ({
              id: post.id,
              title: post.title,
              excerpt: post.excerpt,
              body: post.body,
              createdAt: post.createdAt.toISOString(),
              imageDataUrl: post.imageDataUrl,
              imagePositionX: post.imagePositionX,
              imagePositionY: post.imagePositionY,
              imageScale: post.imageScale,
            }))}
          />
        </section>

        <section className="dashboard-grid">
          <article className="card section-card">
            <div className="card-header">
              <span className="eyebrow">Agenda esportiva</span>
              <h2>Eventos e operações em evidência</h2>
            </div>
            <div className="event-list">
              {upcomingEvents.map((event: any) => (
                <div className="event-row" key={event.id}>
                  <div>
                    <strong>{event.title}</strong>
                    <p>
                      {event.dateLabel} • {event.location}
                    </p>
                  </div>
                  <span className={`status-badge ${event.statusClass}`}>{event.status}</span>
                </div>
              ))}
              {!upcomingEvents.length ? <p className="empty-state">Nenhum evento cadastrado ainda.</p> : null}
            </div>
          </article>

          <article className="card section-card">
            <div className="card-header">
              <span className="eyebrow">Rank dos squads</span>
              <h2>Escala competitiva atual</h2>
            </div>
            <div className="feed-list dashboard-ranking-list">
              {squads.map((squad: any, index: number) => (
                <div className="feed-row dashboard-ranking-row" key={squad.id}>
                  <div>
                    <strong>{`${index + 1}º ${squad.name}`}</strong>
                    <p>
                      {squad.field ? `${formatFieldCode(squad.field.codeNumber, squad.field.state, squad.field.countryCode)} | ${squad.field.name}` : "Campo não vinculado"}
                    </p>
                  </div>
                  <span className="dashboard-points">{String(squad.rankingPoints).padStart(4, "0")}</span>
                </div>
              ))}
              {!squads.length ? <p className="empty-state">Nenhum squad cadastrado ainda.</p> : null}
            </div>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="card section-card">
            <div className="card-header">
              <span className="eyebrow">Cursos e avaliações</span>
              <h2>Formação e qualificação ativa</h2>
            </div>
            <div className="feed-list">
              {courses.map((course: any) => (
                <div className="feed-row" key={course.id}>
                  <strong>{course.title}</strong>
                  <p>
                    {course.field
                      ? `${formatFieldCode(course.field.codeNumber, course.field.state, course.field.countryCode)} | ${course.field.name}`
                      : [course.city, course.state].filter(Boolean).join(" / ") || "Local a definir"}
                  </p>
                  <p>{formatDateTimeLabel(course.startAt)}</p>
                </div>
              ))}
              {!courses.length ? <p className="empty-state">Nenhum curso cadastrado ainda.</p> : null}
            </div>
          </article>

          <article className="card section-card">
            <div className="card-header">
              <span className="eyebrow">Campos em operação</span>
              <h2>Base territorial do sistema</h2>
            </div>
            <div className="feed-list">
              {fields.slice(0, 8).map((field: any) => (
                <div className="feed-row" key={field.id}>
                  <strong>{field.name}</strong>
                  <p>{`${formatFieldCode(field.codeNumber, field.state, field.countryCode)} • ${field.city || field.state}`}</p>
                  <p>{field.ownerName || "Proprietário não informado"}</p>
                </div>
              ))}
              {!fields.length ? <p className="empty-state">Nenhum campo cadastrado ainda.</p> : null}
            </div>
          </article>
        </section>
      </AppShell>
    </main>
  );
}
