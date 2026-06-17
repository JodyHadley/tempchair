"use client";

import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { AdminDataTable } from "./admin-data-table";

type Worker = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  location: string;
  rating: number;
  reviewCount: number;
  experience: string;
  availability: string;
  createdAt: Date;
  _count: { applications: number; credentials: number; reviewsReceived: number };
};

export function WorkersTable({ workers }: { workers: Worker[] }) {
  return (
    <AdminDataTable
      data={workers}
      getKey={(w) => w.id}
      searchKeys={["firstName", "lastName", "email", "location"]}
      searchPlaceholder="Search by name, email, or location..."
      filters={[
        {
          key: "specialty",
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
          key: "name",
          label: "Name",
          sortable: true,
          render: (w) => (
            <div>
              <p className="font-medium">{w.firstName} {w.lastName}</p>
              <p className="text-xs text-muted-foreground">{w.email}</p>
            </div>
          ),
        },
        {
          key: "specialty",
          label: "Specialty",
          sortable: true,
          render: (w) => <Badge variant="secondary" className="text-xs">{w.specialty}</Badge>,
        },
        {
          key: "location",
          label: "Location",
          sortable: true,
          render: (w) => <span className="text-xs">{w.location || "—"}</span>,
        },
        {
          key: "rating",
          label: "Rating",
          sortable: true,
          render: (w) => (
            <span className="flex items-center gap-1 text-xs">
              <Star className="h-3 w-3 fill-primary text-primary" />
              {w.rating} ({w.reviewCount})
            </span>
          ),
        },
        {
          key: "_count.applications",
          label: "Apps",
          sortable: true,
          render: (w) => <span className="text-xs">{w._count.applications}</span>,
        },
        {
          key: "_count.credentials",
          label: "Creds",
          sortable: true,
          render: (w) => <span className="text-xs">{w._count.credentials}</span>,
        },
        {
          key: "createdAt",
          label: "Joined",
          sortable: true,
          render: (w) => <span className="text-xs text-muted-foreground">{new Date(w.createdAt).toLocaleDateString()}</span>,
        },
      ]}
    />
  );
}
