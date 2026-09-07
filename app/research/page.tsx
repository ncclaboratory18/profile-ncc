import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaperList } from "@/components/research/PaperList";
import { ResearchFlythrough } from "@/components/research/ResearchFlythrough";
import { papers } from "@/lib/data";

export const metadata: Metadata = {
  title: "Research — NCC Lab",
};

export default function ResearchPage() {
  return (
    <div className={papers.length > 0 ? "pb-20" : ""}>
      <PageHeader
        title="Research"
        description="The lab's research areas, and papers published by members and supervising faculty."
      />

      <ResearchFlythrough />

      {papers.length > 0 && (
        <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
          <PaperList papers={papers} />
        </div>
      )}
    </div>
  );
}
