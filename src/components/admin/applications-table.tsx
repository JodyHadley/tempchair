"use client";

import { Badge } from "@/components/ui/badge";
import { AdminDataTable } from "./admin-data-table";

type Application = {
  id: string;
  appliedDate: string;
  status: string;
  coverNote: string;
  createdAt: Date;
  worker: { firstName: string; lastName: string; specialty: string; email: string };
  job: { title: string; dates: string; rate: string; status: string; clinic: { name: string } };
  _count: { messages: number };
};

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "outline",
  accepted: "default",
  rejected: "destructive",
  withdrawn: "secondary",
};

export function ApplicationsTable({ applications }: { applications: Application[] }) {
  return (
    <AdminDataTable
      data={applications}
      getKey={(a) => a.id}
      searchKeys={["worker.firstName", "worker.lastName", "worker.email", "job.title", "job.clinic.name"]}
      searchPlaceholder="Search by worker, job, or clinic..."
      filters={[
        {
          key: "status",
          label: "Status",
          options: [
            { value: "pending", label: "Pending" },
            { value: "accepted", label: "Accepted" },
            { value: "rejected", label: "Rejected" },
            { value: "withdrawn", label: "Withdrawn" },
          ],
        },
        {
          key: "worker.specialty",
          label: "Specialty",
          options: [
            { value: "Hygienist", label: "Hygienist" },
            { value: "Assistant", label: "Assistant" },
            { value: "Dentist", label: "Dentist" },
          ],
        },
      ]}
      columns={[
        {
          key: "worker.lastName",
          label: "Worker",
          sortable: true,
          render: (a) => (
            <div>
              <p className="font-medium">{a.worker.firstName} {a.worker.lastName}</p>
              <p className="text-xs text-muted-foreground">{a.worker.specialty}</p>
            </div>
          ),
        },
        {
          key: "job.title",
          label: "Position",
          sortable: true,
          render: (a) => (
            <div>
              <p className="text-xs font-medium">{a.job.title}</p>
              <p className="text-[10px] text-muted-foreground">{a.job.clinic.name}</p>
            </div>
          ),
        },
        {
          key: "status",
          label: "Status",
          sortable: true,
          render: (a) => <Badge variant={statusVariant[a.status] || "outline"} className="text-[10px]">{a.status}</Badge>,
        },
        {
          key: "_count.messages",
          label: "Msgs",
          sortable: true,
          render: (a) => <span className="text-xs">{a._count.messages}</span>,
        },
        {
          key: "appliedDate",
          label: "Applied",
          render: (a) => <span className="text-xs text-muted-foreground">{a.appliedDate}</span>,
        },
        {
          key: "coverNote",
          label: "Note",
          render: (a) => <span className="text-xs text-muted-foreground truncate max-w-[200px] block">{a.coverNote}</span>,
        },
      ]}
    />
  );
}
