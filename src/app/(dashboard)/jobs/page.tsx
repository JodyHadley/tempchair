export const dynamic = "force-dynamic";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, CalendarDays, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getOpenJobs } from "@/lib/db/queries";

export default async function JobsPage() {
  const openJobs = await getOpenJobs();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Open Positions</h1>
          <p className="mt-1 text-muted-foreground">
            Browse available shifts and positions at dental clinics near you.
          </p>
        </div>
        <Link href="/sign-up?role=clinic" className={cn(buttonVariants())}>
          Post a Position
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {openJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{job.title}</h2>
                    <Badge variant="secondary">{job.type}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {job.clinic.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.clinic.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {job.dates}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {job.hours}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {job.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-lg font-bold text-primary">
                    {job.rate}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {job.posted}
                  </span>
                  <Link
                    href="/sign-in"
                    className={cn(buttonVariants({ size: "sm" }), "mt-2")}
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
