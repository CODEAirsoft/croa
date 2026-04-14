import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { NewsPostForm } from "@/components/news-post-form";
import { SectionCard } from "@/components/section-card";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";
const prismaNews = prisma as any;

type Props = { params: Promise<{ id: string }> };

export default async function EditNewsPage({ params }: Props) {
  const cookieStore = await cookies();
  if (!hasAdministrativeSession(cookieStore)) {
    redirect("/manager");
  }

  const { id } = await params;
  const [post, events, courses] = await Promise.all([
    prismaNews.newsPost.findUnique({ where: { id } }),
    prisma.eventRecord.findMany({ orderBy: [{ startAt: "desc" }, { title: "asc" }], select: { id: true, title: true } }),
    prisma.courseRecord.findMany({ orderBy: [{ startAt: "desc" }, { title: "asc" }], select: { id: true, title: true } }),
  ]);

  if (!post) notFound();

  return (
    <main className="page-shell">
      <AppShell title="Editar notícia" description="Atualize os conteúdos oficiais publicados no Dashboard do CROA.">
        <SectionCard eyebrow="Redação" title={post.title}>
          <NewsPostForm
            allowDelete
            courseOptions={courses.map((course: any) => ({ id: course.id, label: course.title }))}
            endpoint={`/api/noticias/${post.id}`}
            eventOptions={events.map((event: any) => ({ id: event.id, label: event.title }))}
            initialData={{
              id: post.id,
              title: post.title,
              excerpt: post.excerpt ?? "",
              body: post.body ?? "",
              imageDataUrl: post.imageDataUrl ?? "",
              imageScale: post.imageScale,
              imagePositionX: post.imagePositionX,
              imagePositionY: post.imagePositionY,
              videoUrl: post.videoUrl ?? "",
              externalLink: post.externalLink ?? "",
              eventId: post.eventId ?? "",
              courseId: post.courseId ?? "",
              published: post.published,
              sortOrder: post.sortOrder,
            }}
            returnHref="/redacao"
            submitLabel="Salvar alterações"
            successMessage="Notícia atualizada com sucesso."
          />
        </SectionCard>
      </AppShell>
    </main>
  );
}
