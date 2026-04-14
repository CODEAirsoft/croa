import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };
const prismaNews = prisma as any;

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    const item = await prismaNews.newsPost.update({
      where: { id },
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

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Falha ao atualizar notícia:", error);
    return NextResponse.json({ error: "Não foi possível salvar a notícia." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    await prismaNews.newsPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Falha ao excluir notícia:", error);
    return NextResponse.json({ error: "Não foi possível excluir a notícia." }, { status: 500 });
  }
}
