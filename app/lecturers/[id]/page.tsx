import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LecturerDetail } from "@/components/lecturers/LecturerDetail";
import { lecturers } from "@/lib/data";

export function generateStaticParams() {
  return lecturers.map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lecturer = lecturers.find((l) => l.id === id);
  return {
    title: lecturer ? `${lecturer.name} — NCC Lab` : "Lecturer — NCC Lab",
  };
}

export default async function LecturerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lecturer = lecturers.find((l) => l.id === id);
  if (!lecturer) notFound();

  return <LecturerDetail lecturer={lecturer} />;
}
