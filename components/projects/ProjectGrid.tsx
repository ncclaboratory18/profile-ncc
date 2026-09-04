import type { Project } from "@/lib/types";
import { ProjectCard } from "./ProjectCard";
import { PlaceholderState } from "@/components/shared/PlaceholderState";
import { FolderDashed } from "@phosphor-icons/react/dist/ssr";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export function ProjectGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <PlaceholderState
        icon={FolderDashed}
        title="No projects listed yet"
        description="Real project write-ups and images are coming soon."
      />
    );
  }

  return (
    <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <RevealItem key={project.id}>
          <ProjectCard project={project} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
