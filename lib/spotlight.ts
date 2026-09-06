import { admins, researchTeam, lecturers } from "./data";

export interface SpotlightPerson {
  id: string;
  name: string;
  role: string;
  photo: string;
  href: string;
  blurb: string;
}

/**
 * A short curated cast for the Home-page spotlight — deliberately not the
 * full roster, which lives on the Admins and Research Team pages. Records are
 * resolved from the existing content files so names, roles, and photos have a
 * single source of truth; only the one-line blurb is written for this section.
 */
const CURATED: { id: string; blurb: string }[] = [
  { id: "tohari-ahmad", blurb: "Sets the lab's research direction and supervises its graduate work." },
  { id: "danish-abqori", blurb: "Runs day-to-day lab operations and the onboarding track for new members." },
  { id: "raka-hutagalung", blurb: "Leads the security and forensics research track." },
  { id: "rangga-wijaya", blurb: "Founded the admin team and the operating rhythm the lab still runs on." },
  { id: "salsabila-rahmadani", blurb: "Works on network anomaly detection across the campus mesh." },
];

function resolve(id: string): Omit<SpotlightPerson, "blurb"> | null {
  const member = [...admins, ...researchTeam].find((m) => m.id === id);
  if (member) {
    return {
      id: member.id,
      name: member.nickname ?? member.name,
      role: member.role,
      photo: member.photo,
      href: member.team === "admin" ? `/admins/${member.id}` : `/research-team/${member.id}`,
    };
  }

  const lecturer = lecturers.find((l) => l.id === id);
  if (lecturer?.photo) {
    return {
      id: lecturer.id,
      name: lecturer.name,
      role: lecturer.role ?? "Lecturer",
      photo: lecturer.photo,
      // Lecturers have no per-person route; their page is the roster itself.
      href: "/lecturers",
    };
  }

  return null;
}

export const spotlightPeople: SpotlightPerson[] = CURATED.flatMap(({ id, blurb }) => {
  const person = resolve(id);
  return person ? [{ ...person, blurb }] : [];
});
