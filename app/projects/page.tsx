import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { projects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Projects — NCC Lab",
};

export default function ProjectsPage() {
  return (
    <div className="pb-20">
      <PageHeader
        title="Projects"
        description="Builds and case studies coming out of the lab."
      />
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <ProjectGrid projects={projects} />
      </div>
    </div>
  );
}
