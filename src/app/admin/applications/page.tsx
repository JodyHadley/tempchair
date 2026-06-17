export const dynamic = "force-dynamic";

import { getAllApplications } from "@/lib/db/admin-view-actions";
import { ApplicationsTable } from "@/components/admin/applications-table";

export default async function AdminApplicationsPage() {
  const applications = await getAllApplications();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Applications ({applications.length})</h1>
      <ApplicationsTable applications={applications} />
    </div>
  );
}
