import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };
const prismaNews = prisma as any;

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    return null;
  }

  return {
    mimeType: match[1],
    bytes: new Uint8Array(Buffer.from(match[2], "base64")),
  };
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const post = await prismaNews.newsPost.findUnique({
    where: { id },
    select: {
      imageDataUrl: true,
      published: true,
      updatedAt: true,
    },
  });

  if (!post?.published || !post.imageDataUrl) {
    return new NextResponse(null, { status: 404 });
  }

  const parsedImage = parseDataUrl(post.imageDataUrl);

  if (!parsedImage) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(parsedImage.bytes, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "Content-Type": parsedImage.mimeType,
      "Last-Modified": new Date(post.updatedAt).toUTCString(),
    },
  });
}
