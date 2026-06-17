"use client";

import { Badge } from "@/components/ui/badge";
import { AdminDataTable } from "./admin-data-table";

type Job = {
  id: string;
  title: string;
  type: string;
  dates: string;
  hours: string;
  rate: string;
  status: string;
  posted: string;
  createdAt: Date;
  clinic: { name: string; location: string };
  _count: { applications: number };
};

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  open: "default",
  filled: "secondary",
  completed: "outline",
  cancelled: "destructive",
};

export function JobsTable({ jobs }: { jobs: Job[] }) {
  return (
    <AdminDataTable
      data={jobs}
      getKey={(j) => j.id}
      searchKeys={["title", "clinic.name", "clinic.location"]}
      searchPlaceholder="Search by title, clinic, or location..."
      filters={[
        {
          key: "status",
          label: "Status",
          options: [
            { value: "open", label: "Open" },
            { value: "filled", label: "Filled" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ],
        },
        {
          key: "type",
          label: "Type",
          options: [
            { value: "Hygienist", label: "Hygienist" },
            { value: "Assistant", label: "Assistant" },
            { value: "Dentist", label: "Dentist" },
          ],
        },
      ]}
      columns={[
        {
          key: "title",
          label: "Position",
          sortable: true,
          render: (j) => (
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-medium">{j.title}</p>
                <Badge variant="secondary" className="text-[8px]">{j.type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{j.clinic.name}</p>
            </div>
          ),
        },
        {
          key: "status",
          label: "Status",
          sortable: true,
          render: (j) => <Badge variant={statusVariant[j.status] || "outline"} className="text-[10px]">{j.status}</Badge>,
        },
        {
          key: "dates",
          label: "Dates",
          render: (j) => <span className="text-xs">{j.dates}</span>,
        },
        {
          key: "rate",
          label: "Rate",
          sortable: true,
          render: (j) => <span className="text-xs font-bold text-primary">{j.rate}</span>,
        },
        {
          key: "_count.applications",
          label: "Apps",
          sortable: true,
          render: (j) => <span className="text-xs">{j._count.applications}</span>,
        },
        {
          key: "createdAt",
          label: "Posted",
          sortable: true,
          render: (j) => <span className="text-xs text-muted-foreground">{new Date(j.createdAt).toLocaleDateString()}</span>,
        },
      ]}
    />
  );
}
