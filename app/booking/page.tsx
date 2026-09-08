import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { BookingRedirectCTA } from "@/components/shared/BookingRedirectCTA";

export const metadata: Metadata = {
  title: "Book the Lab — NCC Lab",
};

const BOOKING_URL: string | undefined = undefined;

export default function BookingPage() {
  return (
    <div className="pb-24">
      <PageHeader
        title="Book the Lab"
        description="Reserve PC lab hours for research, coursework, or lab-organized sessions."
      />
      <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="border-t-4 border-accent-blue pt-8">
          <p className="max-w-[60ch] font-sans text-sm leading-relaxed text-text-secondary">
            Lab bookings are handled by a separate scheduling system. Once the
            link is confirmed, this page will redirect straight to it.
          </p>
          <div className="mt-6">
            <BookingRedirectCTA href={BOOKING_URL} />
          </div>
        </div>
      </div>
    </div>
  );
}
