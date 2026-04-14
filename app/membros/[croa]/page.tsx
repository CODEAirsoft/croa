import { redirect } from "next/navigation";

type MemberCardPageProps = {
  params: Promise<{
    croa: string;
  }>;
};

export default async function MemberCardPage({ params }: MemberCardPageProps) {
  const { croa } = await params;
  redirect(`/croa/${croa}`);
}
