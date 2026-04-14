import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const prismaNews = prisma as any;

export async function GET() {
  const items = await prismaNews.newsPost.findMany({
    include: {
      event: { select: { id: true, title: true } },
      course: { select: { id: true, title: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const item = await prismaNews.newsPost.create({
      data: {
        title: String(body.title ?? "").trim() || "Notícia sem título",
        excerpt: String(body.excerpt ?? "").trim() || null,
        body: String(body.body ?? "").trim() || null,
        imageDataUrl: String(body.imageDataUrl ?? "").trim() || null,
        imageScale: Math.max(60, Math.min(140, Number(body.imageScale ?? 100) || 100)),
        imagePositionX: Math.max(0, Math.min(100, Number(body.imagePositionX ?? 50) || 50)),
        imagePositionY: Math.max(0, Math.min(100, Number(body.imagePositionY ?? 50) || 50)),
        videoUrl: String(body.videoUrl ?? "").trim() || null,
        externalLink: String(body.externalLink ?? "").trim() || null,
        eventId: String(body.eventId ?? "").trim() || null,
        courseId: String(body.courseId ?? "").trim() || null,
        published: body.published !== false,
        sortOrder: Number(body.sortOrder ?? 0) || 0,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Falha ao criar notícia:", error);
    return NextResponse.json({ error: "Não foi possível salvar a notícia." }, { status: 500 });
  }
}
