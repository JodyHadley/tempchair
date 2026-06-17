export const dynamic = "force-dynamic";

import { getAllClaimedClinics } from "@/lib/db/admin-view-actions";
import { ClinicsTable } from "@/components/admin/clinics-table";

export default async function AdminClinicsPage() {
  const clinics = await getAllClaimedClinics();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Clinics ({clinics.length})</h1>
      <ClinicsTable clinics={clinics} />
    </div>
  );
}
