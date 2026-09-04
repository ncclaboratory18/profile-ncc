export interface TeamMember {
  id: string;
  name: string;
  nickname?: string;
  team: "admin" | "research";
  role: string;
  generation: string;
  major: string;
  nrp?: string;
  photo: string;
  email?: string;
  instagram?: string;
  bio?: string;
}

export interface Lecturer {
  id: string;
  name: string;
  title: string;
  role?: string;
  email?: string;
  photo?: string;
  profileUrl?: string;
  scopusUrl?: string;
  scholarUrl?: string;
  sintaUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  year?: string;
  images: string[];
  status?: "ongoing" | "completed";
  members?: string[];
  link?: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  year: string;
  venue?: string;
  link?: string;
  abstract?: string;
}
