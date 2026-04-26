import { DashboardNewsMenu } from "@/components/dashboard-news-menu";
import { prisma } from "@/lib/prisma";

const prismaNews = prisma as any;
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Nossa Resenha | CROA",
  description: "Lista pública de notícias do CROA para incorporação externa.",
};

export default async function ResenhaPage() {
  const newsPosts = await prismaNews.newsPost.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <main className="resenha-shell">
      <DashboardNewsMenu
        compact
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
        openInNewTab
      />
    </main>
  );
}
