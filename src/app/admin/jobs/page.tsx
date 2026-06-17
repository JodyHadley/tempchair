export const dynamic = "force-dynamic";

import { getAllJobs } from "@/lib/db/admin-view-actions";
import { JobsTable } from "@/components/admin/jobs-table";

export default async function AdminJobsPage() {
  const jobs = await getAllJobs();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Job Postings ({jobs.length})</h1>
      <JobsTable jobs={jobs} />
    </div>
  );
}
