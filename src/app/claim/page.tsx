export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getUnclaimedClinics } from "@/lib/db/queries";
import { ClaimForm } from "@/components/claim/claim-form";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Claim Your Clinic",
  description:
    "Claim your dental practice profile on TempChair. Many Treasure Valley clinics are pre-listed — verify ownership and start posting shifts free during launch.",
  path: "/claim",
});

export default async function ClaimPage() {
  const unclaimed = await getUnclaimedClinics();

  const clinics = unclaimed.map((c) => ({
    id: c.id,
    name: c.name,
    initials: c.initials,
    location: c.location,
    address: c.address,
    phone: c.phone,
  }));

  return <ClaimForm clinics={clinics} />;
}
