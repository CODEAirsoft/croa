import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { NewsPostForm } from "@/components/news-post-form";
import { SectionCard } from "@/components/section-card";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";
const prismaNews = prisma as any;

export default async function NewsroomPage() {
  const cookieStore = await cookies();
  if (!hasAdministrativeSession(cookieStore)) {
    redirect("/manager");
  }

  const [events, courses, newsPosts] = await Promise.all([
    prisma.eventRecord.findMany({ orderBy: [{ startAt: "desc" }, { title: "asc" }], select: { id: true, title: true } }),
    prisma.courseRecord.findMany({ orderBy: [{ startAt: "desc" }, { title: "asc" }], select: { id: true, title: true } }),
    prismaNews.newsPost.findMany({
      include: {
        event: { select: { title: true } },
        course: { select: { title: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <main className="page-shell">
      <AppShell title="Redação" description="Painel de publicação de notícias, comunicados, convocações e destaques do CROA.">
        <div className="dashboard-grid newsroom-layout">
          <SectionCard eyebrow="Publicação" title="Nova notícia">
            <NewsPostForm
              courseOptions={courses.map((course: any) => ({ id: course.id, label: course.title }))}
              eventOptions={events.map((event: any) => ({ id: event.id, label: event.title }))}
            />
          </SectionCard>

          <SectionCard eyebrow="Arquivo" title="Notícias publicadas">
            <div className="newsroom-list">
              {(newsPosts as any[]).map((post) => (
                <article className="newsroom-item" key={post.id}>
                  <div>
                    <strong>{post.title}</strong>
                    <p>{post.excerpt || "Sem resumo."}</p>
                    <span className="newsroom-meta">
                      {post.event?.title ? `Evento: ${post.event.title}` : post.course?.title ? `Curso: ${post.course.title}` : "Informativo livre"}
                    </span>
                  </div>
                  <div className="newsroom-actions">
                    <span className={`status-pill ${post.published ? "status-active" : "status-inativo"}`}>
                      {post.published ? "Publicado" : "Rascunho"}
                    </span>
                    <Link className="member-card-link" href={`/redacao/${post.id}/editar`}>
                      Editar
                    </Link>
                    <Link className="member-card-link" href={`/noticias/${post.id}`}>
                      Abrir
                    </Link>
                  </div>
                </article>
              ))}
              {!newsPosts.length ? <p className="empty-state">Nenhuma notícia cadastrada.</p> : null}
            </div>
          </SectionCard>
        </div>
      </AppShell>
    </main>
  );
}
