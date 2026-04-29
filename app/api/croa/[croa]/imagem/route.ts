import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    croa: string;
  }>;
};

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
  const { croa } = await params;

  if (!/^\d{6}$/.test(croa)) {
    return new NextResponse(null, { status: 404 });
  }

  const croaNumber = Number.parseInt(croa, 10);
  const member = await prisma.member.findFirst({
    where: { croaNumber },
    select: {
      photoDataUrl: true,
      updatedAt: true,
    },
  });

  if (!member?.photoDataUrl) {
    return new NextResponse(null, { status: 404 });
  }

  const parsedImage = parseDataUrl(member.photoDataUrl);

  if (!parsedImage) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(parsedImage.bytes, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "Content-Type": parsedImage.mimeType,
      "Last-Modified": new Date(member.updatedAt).toUTCString(),
    },
  });
}
