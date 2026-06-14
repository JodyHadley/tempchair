"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MapPin, Clock, CalendarDays, Building2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApplyForm } from "./apply-form";

interface JobData {
  id: string;
  title: string;
  type: string;
  dates: string;
  hours: string;
  rate: string;
  description: string;
  posted: string;
  clinic: {
    name: string;
    location: string;
  };
}

interface ApplicationData {
  jobId: string;
}

export function JobListings({
  jobs,
  workerApplications,
}: {
  jobs: JobData[];
  workerApplications: ApplicationData[];
}) {
  const { user } = useAuth();
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(
    new Set(workerApplications.map((a) => a.jobId)),
  );

  const isWorker = user?.role === "worker";
  const isClinic = user?.role === "clinic";

  return (
    <div className="space-y-4">
      {jobs.map((job) => {
        const alreadyApplied = appliedJobs.has(job.id);

        if (applyingTo === job.id && user && isWorker) {
          return (
            <ApplyForm
              key={job.id}
              jobId={job.id}
              jobTitle={job.title}
              clinicName={job.clinic.name}
              clinicLocation={job.clinic.location}
              dates={job.dates}
              hours={job.hours}
              rate={job.rate}
              type={job.type}
              workerId={user.id}
              onClose={() => setApplyingTo(null)}
              onApplied={() => {
                setApplyingTo(null);
                setAppliedJobs((prev) => new Set(prev).add(job.id));
              }}
            />
          );
        }

        return (
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
                  {alreadyApplied ? (
                    <Badge variant="outline" className="mt-2 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Applied
                    </Badge>
                  ) : isWorker ? (
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => setApplyingTo(job.id)}
                    >
                      Apply Now
                    </Button>
                  ) : isClinic ? null : (
                    <Link
                      href={`/sign-in`}
                      className={cn(buttonVariants({ size: "sm" }), "mt-2")}
                    >
                      Sign In to Apply
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
