import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { RosterView } from "@/components/roster/RosterView";
import { admins } from "@/lib/data";

export const metadata: Metadata = {
  title: "Admins — NCC Lab",
};

export default function AdminsPage() {
  return (
    <div className="pb-20">
      <PageHeader
        title="Admins"
        description="Lab operations, organized by generation. Click a card to see a member's full profile."
      />
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <RosterView members={admins} />
        </Suspense>
      </div>
    </div>
  );
}
