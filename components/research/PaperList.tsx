import type { ResearchPaper } from "@/lib/types";
import { PaperListItem } from "./PaperListItem";
import { PlaceholderState } from "@/components/shared/PlaceholderState";
import { Article } from "@phosphor-icons/react/dist/ssr";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export function PaperList({ papers }: { papers: ResearchPaper[] }) {
  if (papers.length === 0) {
    return (
      <PlaceholderState
        icon={Article}
        title="No papers listed yet"
        description="A starter set can be pulled from the lab's Scopus and Google Scholar profiles once confirmed."
      />
    );
  }

  return (
    <RevealGroup className="divide-y divide-hairline">
      {papers.map((paper) => (
        <RevealItem key={paper.id}>
          <PaperListItem paper={paper} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
