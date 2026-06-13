import { getUnclaimedClinics } from "@/lib/db/queries";
import { ClaimForm } from "@/components/claim/claim-form";

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
