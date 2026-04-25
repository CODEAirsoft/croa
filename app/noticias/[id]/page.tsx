import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DownloadLinkButton } from "@/components/download-link-button";
import {
  buildReservationLink,
  formatCurrencyValue,
  formatDateLabel,
  formatDateTimeLabel,
  formatRecurrenceLabel,
  getNextRecurringDate,
  parseCurrencyInput,
} from "@/lib/offerings";
import { formatFieldCode } from "@/lib/field-code";
import { prisma } from "@/lib/prisma";
const prismaNews = prisma as any;

function getPublicBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_CROA_URL ?? "https://croa-beta.vercel.app";
  return configuredUrl.replace(/\/$/, "");
}

function getNewsDescription(excerpt?: string | null, body?: string | null) {
  const text = (excerpt || body || "Notícia oficial publicada na redação do CROA.").replace(/\s+/g, " ").trim();
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function getEmbedUrl(videoUrl?: string | null) {
  if (!videoUrl) return null;
  if (videoUrl.includes("youtube.com/watch?v=")) {
    return videoUrl.replace("watch?v=", "embed/");
  }
  if (videoUrl.includes("youtu.be/")) {
    return videoUrl.replace("youtu.be/", "youtube.com/embed/");
  }
  return null;
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await prismaNews.newsPost.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      excerpt: true,
      body: true,
      imageDataUrl: true,
      published: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!post || !post.published) {
    return {
      title: "Notícia não encontrada | CROA",
      description: "Esta notícia não está disponível no CROA.",
    };
  }

  const baseUrl = getPublicBaseUrl();
  const title = `${post.title} | CROA`;
  const description = getNewsDescription(post.excerpt, post.body);
  const pageUrl = `${baseUrl}/noticias/${post.id}`;
  const imageUrl = post.imageDataUrl ? `${baseUrl}/api/noticias/${post.id}/imagem` : `${baseUrl}/code-airsoft-logo.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "CROA",
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function NewsPostPage({ params }: Props) {
  const { id } = await params;
  const [post, latestEvent, latestCourse] = await Promise.all([
    prismaNews.newsPost.findUnique({
      where: { id },
      include: {
        event: { select: { id: true, title: true } },
        course: { select: { id: true, title: true } },
      },
    }),
    prisma.eventRecord.findFirst({
      orderBy: [{ createdAt: "desc" }, { startAt: "desc" }],
      include: {
        field: { select: { codeNumber: true, countryCode: true, state: true, name: true } },
      },
    }),
    prisma.courseRecord.findFirst({
      orderBy: [{ createdAt: "desc" }, { startAt: "desc" }],
      include: {
        field: { select: { codeNumber: true, countryCode: true, state: true, name: true } },
      },
    }),
  ]);

  if (!post || !post.published) notFound();

  const embedUrl = getEmbedUrl(post.videoUrl);
  const shareUrl = `/noticias/${post.id}`;

  const latestEventCard = latestEvent
    ? {
        title: latestEvent.title,
        category: latestEvent.category || "Evento",
        summary: latestEvent.summary || latestEvent.description || "Sem resumo cadastrado.",
        placeLabel: latestEvent.field
          ? `${formatFieldCode(latestEvent.field.codeNumber, latestEvent.field.state, latestEvent.field.countryCode)} | ${latestEvent.field.name}`
          : [latestEvent.city, latestEvent.state].filter(Boolean).join(" / ") || "Local a definir",
        dateLabel: latestEvent.recurringEnabled
          ? `Evento recorrente · ${formatRecurrenceLabel(latestEvent.recurrenceFrequency)} · Próxima: ${formatDateTimeLabel(
              getNextRecurringDate(latestEvent.startAt, latestEvent.recurrenceFrequency) ?? latestEvent.startAt,
            )}`
          : latestEvent.endAt
            ? `${formatDateTimeLabel(latestEvent.startAt)} até ${formatDateTimeLabel(latestEvent.endAt)}`
            : formatDateTimeLabel(latestEvent.startAt),
        priceLabel: (() => {
          const parsedValue = parseCurrencyInput(latestEvent.priceLabel ?? "");
          if (parsedValue !== null && latestEvent.discountPercent > 0) {
            return `${formatCurrencyValue(parsedValue * (1 - latestEvent.discountPercent / 100))} (${latestEvent.discountPercent}% off)`;
          }
          return latestEvent.priceLabel || "Consulte a organização";
        })(),
        imageSrc: latestEvent.photoDataUrl || "/cadastro-campos.png",
        href: buildReservationLink({
          kindLabel: "Evento",
          title: latestEvent.title,
          startAt: getNextRecurringDate(latestEvent.startAt, latestEvent.recurrenceFrequency) ?? latestEvent.startAt,
          placeLabel:
            latestEvent.field
              ? `${formatFieldCode(latestEvent.field.codeNumber, latestEvent.field.state, latestEvent.field.countryCode)} | ${latestEvent.field.name}`
              : [latestEvent.city, latestEvent.state].filter(Boolean).join(" / ") || "Local a definir",
          customMessage: latestEvent.whatsappMessage,
        }),
        buttonLabel: latestEvent.reservationLabel || "Reservar vaga",
      }
    : null;

  const latestCourseCard = latestCourse
    ? {
        title: latestCourse.title,
        category: latestCourse.category || "Curso",
        summary: latestCourse.summary || latestCourse.description || "Sem resumo cadastrado.",
        placeLabel: latestCourse.field
          ? `${formatFieldCode(latestCourse.field.codeNumber, latestCourse.field.state, latestCourse.field.countryCode)} | ${latestCourse.field.name}`
          : [latestCourse.city, latestCourse.state].filter(Boolean).join(" / ") || "Local a definir",
        dateLabel: latestCourse.endAt
          ? `${formatDateTimeLabel(latestCourse.startAt)} até ${formatDateTimeLabel(latestCourse.endAt)}`
          : formatDateTimeLabel(latestCourse.startAt),
        priceLabel: latestCourse.priceLabel || "Consulte a organização",
        imageSrc: latestCourse.photoDataUrl || "/cadastro-campos.png",
        href: buildReservationLink({
          kindLabel: "Curso",
          title: latestCourse.title,
          startAt: latestCourse.startAt,
          placeLabel:
            latestCourse.field
              ? `${formatFieldCode(latestCourse.field.codeNumber, latestCourse.field.state, latestCourse.field.countryCode)} | ${latestCourse.field.name}`
              : [latestCourse.city, latestCourse.state].filter(Boolean).join(" / ") || "Local a definir",
          customMessage: latestCourse.whatsappMessage,
        }),
        buttonLabel: latestCourse.reservationLabel || "Reservar vaga",
      }
    : null;

  return (
    <main className="page-shell">
      <AppShell title={post.title} description={post.excerpt ?? "Notícia oficial publicada na redação do CROA."}>
        <article className="card section-card news-article">
          {post.imageDataUrl ? (
            <div className="news-hero-image">
              <Image
                alt={post.title}
                width={1600}
                height={1200}
                src={post.imageDataUrl}
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                }}
                unoptimized
              />
            </div>
          ) : null}

          <div className="news-article-header">
            <span className="eyebrow">Redação CROA</span>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <div className="news-chip-row">
              <span>{formatDateTimeLabel(post.createdAt)}</span>
              {post.event?.title ? <span>Evento: {post.event.title}</span> : null}
              {post.course?.title ? <span>Curso: {post.course.title}</span> : null}
            </div>
          </div>

          {post.body ? (
            <div className="news-article-body">
              <pre>{post.body}</pre>
              <div className="news-article-body-actions">
                <DownloadLinkButton filename={`croa-noticia-${post.id}.url`} label="Download" url={shareUrl} />
                <Link className="button secondary" href="/">
                  Retornar ao Dashboard
                </Link>
              </div>
            </div>
          ) : null}

          {embedUrl ? (
            <div className="news-video-embed">
              <iframe allowFullScreen src={embedUrl} title={post.title} />
            </div>
          ) : null}

          {latestEventCard || latestCourseCard ? (
            <section className="news-related-grid">
              {latestEventCard ? (
                <article className="offering-card news-related-card">
                  <div className="offering-card-image">
                    <Image alt={latestEventCard.title} fill sizes="(max-width: 900px) 100vw, 33vw" src={latestEventCard.imageSrc} unoptimized />
                  </div>
                  <div className="offering-card-copy">
                    <span className="eyebrow">Último evento cadastrado</span>
                    <h3>{latestEventCard.title}</h3>
                    <p>{latestEventCard.summary}</p>
                    <div className="offering-card-meta">
                      <span><strong>Data:</strong> {latestEventCard.dateLabel}</span>
                      <span><strong>Local:</strong> {latestEventCard.placeLabel}</span>
                      <span><strong>Valor:</strong> {latestEventCard.priceLabel}</span>
                    </div>
                    <div className="offering-card-actions">
                      <a className="button primary" href={latestEventCard.href} rel="noreferrer" target="_blank">
                        {latestEventCard.buttonLabel}
                      </a>
                    </div>
                  </div>
                </article>
              ) : null}

              {latestCourseCard ? (
                <article className="offering-card news-related-card">
                  <div className="offering-card-image">
                    <Image alt={latestCourseCard.title} fill sizes="(max-width: 900px) 100vw, 33vw" src={latestCourseCard.imageSrc} unoptimized />
                  </div>
                  <div className="offering-card-copy">
                    <span className="eyebrow">Último curso cadastrado</span>
                    <h3>{latestCourseCard.title}</h3>
                    <p>{latestCourseCard.summary}</p>
                    <div className="offering-card-meta">
                      <span><strong>Data:</strong> {latestCourseCard.dateLabel}</span>
                      <span><strong>Local:</strong> {latestCourseCard.placeLabel}</span>
                      <span><strong>Valor:</strong> {latestCourseCard.priceLabel}</span>
                    </div>
                    <div className="offering-card-actions">
                      <a className="button primary" href={latestCourseCard.href} rel="noreferrer" target="_blank">
                        {latestCourseCard.buttonLabel}
                      </a>
                    </div>
                  </div>
                </article>
              ) : null}
            </section>
          ) : null}
        </article>
      </AppShell>
    </main>
  );
}
