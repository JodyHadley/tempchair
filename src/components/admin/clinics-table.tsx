"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Crown } from "lucide-react";
import { AdminDataTable } from "./admin-data-table";
import { toggleClinicPremium } from "@/lib/db/admin-actions";

type Clinic = {
  id: string;
  name: string;
  email: string;
  contactName: string;
  location: string;
  rating: number;
  reviewCount: number;
  claimed: boolean;
  premiumTier: boolean;
  premiumTrialEndsAt: Date | null;
  createdAt: Date;
  _count: { jobs: number; reviewsReceived: number };
};

export function ClinicsTable({ clinics: initialClinics }: { clinics: Clinic[] }) {
  const [clinics, setClinics] = useState(initialClinics);
  const [toggling, setToggling] = useState<string | null>(null);

  async function handleTogglePremium(clinicId: string) {
    setToggling(clinicId);
    await toggleClinicPremium(clinicId);
    setClinics((prev) => prev.map((c) => c.id === clinicId ? { ...c, premiumTier: !c.premiumTier } : c));
    setToggling(null);
  }

  return (
    <AdminDataTable
      data={clinics}
      getKey={(c) => c.id}
      searchKeys={["name", "email", "contactName", "location"]}
      searchPlaceholder="Search by name, email, contact, or location..."
      filters={[
        {
          key: "premiumTier",
          label: "Plan",
          options: [
            { value: "true", label: "Premium" },
            { value: "false", label: "Standard" },
          ],
        },
        {
          key: "claimed",
          label: "Status",
          options: [
            { value: "true", label: "Claimed" },
            { value: "false", label: "Unclaimed" },
          ],
        },
      ]}
      columns={[
        {
          key: "name",
          label: "Clinic",
          sortable: true,
          render: (c) => (
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-medium">{c.name}</p>
                {c.premiumTier && <Badge variant="default" className="text-[8px]"><Crown className="h-2 w-2 mr-0.5" />Premium</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{c.email}</p>
            </div>
          ),
        },
        {
          key: "contactName",
          label: "Contact",
          render: (c) => <span className="text-xs">{c.contactName || "—"}</span>,
        },
        {
          key: "location",
          label: "Location",
          sortable: true,
          render: (c) => <span className="text-xs">{c.location || "—"}</span>,
        },
        {
          key: "rating",
          label: "Rating",
          sortable: true,
          render: (c) => (
            <span className="flex items-center gap-1 text-xs">
              <Star className="h-3 w-3 fill-primary text-primary" />
              {c.rating} ({c.reviewCount})
            </span>
          ),
        },
        {
          key: "_count.jobs",
          label: "Jobs",
          sortable: true,
          render: (c) => <span className="text-xs">{c._count.jobs}</span>,
        },
        {
          key: "createdAt",
          label: "Joined",
          sortable: true,
          render: (c) => <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>,
        },
      ]}
      actions={(c) => (
        <Button
          size="sm"
          variant={c.premiumTier ? "outline" : "default"}
          className="text-[10px] h-6"
          disabled={toggling === c.id}
          onClick={() => handleTogglePremium(c.id)}
        >
          {toggling === c.id ? "..." : c.premiumTier ? "Remove Premium" : "Make Premium"}
        </Button>
      )}
    />
  );
}
