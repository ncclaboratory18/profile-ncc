import adminsData from "@/content/admins.json";
import researchTeamData from "@/content/research-team.json";
import lecturersData from "@/content/lecturers.json";
import projectsData from "@/content/projects.json";
import papersData from "@/content/papers.json";
import type { Lecturer, Project, ResearchPaper, TeamMember } from "./types";

export const admins = adminsData as TeamMember[];
export const researchTeam = researchTeamData as TeamMember[];
export const lecturers = lecturersData as Lecturer[];
export const projects = projectsData as Project[];
export const papers = papersData as ResearchPaper[];

export function generationsOf(members: TeamMember[]): string[] {
  return Array.from(new Set(members.map((m) => m.generation))).sort((a, b) =>
    b.localeCompare(a),
  );
}

export function findMember(id: string): TeamMember | undefined {
  return [...admins, ...researchTeam].find((m) => m.id === id);
}

export function findProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
