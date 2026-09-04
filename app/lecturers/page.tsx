import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { LecturerGrid } from "@/components/lecturers/LecturerGrid";
import { lecturers } from "@/lib/data";

export const metadata: Metadata = {
  title: "Lecturers — NCC Lab",
};

export default function LecturersPage() {
  return (
    <div className="pb-20">
      <PageHeader
        title="Lecturers"
        description="Faculty supervising the NCC Lab within the Department of Informatics Engineering."
      />
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <LecturerGrid lecturers={lecturers} />
      </div>
    </div>
  );
}
