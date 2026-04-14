import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    croa: string;
  }>;
};

export default async function EditMemberPage({ params }: Props) {
  const { croa } = await params;
  redirect(`/croa/${croa}`);
}
