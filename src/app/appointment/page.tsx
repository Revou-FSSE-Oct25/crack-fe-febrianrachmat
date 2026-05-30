"use client";

import BookingForm from "@/components/BookingForm";
import { cardSurface, PageHeader, widePageShell } from "@/components/ui/page-shell";
import { useLanguage } from "@/contexts/language-context";

export default function AppointmentPage() {
  const { t } = useLanguage();
  return (
    <main className={`${widePageShell} space-y-8 pb-16`}>
      <div className="mx-auto max-w-3xl space-y-8">
        <PageHeader
          eyebrow={t("booking.appointment.eyebrow")}
          title={t("booking.appointment.title")}
          description={t("booking.appointment.description")}
        />
        <div className={`${cardSurface} p-6 sm:p-8`}>
          <BookingForm />
        </div>
      </div>
    </main>
  );
}
