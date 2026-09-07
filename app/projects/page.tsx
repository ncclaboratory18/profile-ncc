import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectFlythrough } from "@/components/projects/ProjectFlythrough";
import { projects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Projects — NCC Lab",
};

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader
        title="Projects"
        description="Builds and case studies coming out of the lab."
      />

      <ProjectFlythrough projects={projects} />
    </div>
  );
}
