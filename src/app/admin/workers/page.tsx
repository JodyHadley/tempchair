export const dynamic = "force-dynamic";

import { getAllWorkers } from "@/lib/db/admin-view-actions";
import { WorkersTable } from "@/components/admin/workers-table";

export default async function AdminWorkersPage() {
  const workers = await getAllWorkers();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Workers ({workers.length})</h1>
      <WorkersTable workers={workers} />
    </div>
  );
}
