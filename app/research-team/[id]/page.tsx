import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MemberDetail } from "@/components/roster/MemberDetail";
import { researchTeam } from "@/lib/data";

export function generateStaticParams() {
  return researchTeam.map((m) => ({ id: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const member = researchTeam.find((m) => m.id === id);
  return { title: member ? `${member.name} — NCC Lab` : "Researcher — NCC Lab" };
}

export default async function ResearchTeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = researchTeam.find((m) => m.id === id);
  if (!member) notFound();

  return <MemberDetail member={member} />;
}
