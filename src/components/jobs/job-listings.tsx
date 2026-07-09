"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MapPin, Clock, CalendarDays, Building2, CheckCircle2, Filter, X, Star } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApplyForm } from "./apply-form";

interface JobData {
  id: string;
  title: string;
  type: string;
  dates: string;
  startDate?: string;
  hours: string;
  rate: string;
  description: string;
  posted: string;
  createdAt?: string;
  clinic: {
    name: string;
    location: string;
    rating?: number;
    reviewCount?: number;
  };
}

interface ApplicationData {
  jobId: string;
}

function relativeStartLabel(startDateIso?: string): string | null {
  if (!startDateIso) return null;
  const start = new Date(startDateIso);
  if (Number.isNaN(start.getTime())) return null;

  const now = new Date();
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((startDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "In progress";
  if (diffDays === 0) return "Starts today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays <= 30) {
    const weeks = Math.ceil(diffDays / 7);
    return `In ${weeks} week${weeks !== 1 ? "s" : ""}`;
  }
  return null;
}

function isNewPosting(createdAt?: string): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return false;
  return Date.now() - created.getTime() < 48 * 60 * 60 * 1000;
}

export function JobListings({
  jobs,
  workerApplications,
  workerSpecialty,
  highlightedJobId,
}: {
  jobs: JobData[];
  workerApplications: ApplicationData[];
  workerSpecialty: string | null;
  highlightedJobId?: string | null;
}) {
  const { user } = useAuth();
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(
    new Set(workerApplications.map((a) => a.jobId)),
  );
  const [showAll, setShowAll] = useState(false);

  const isWorker = user?.role === "worker";
  const isClinic = user?.role === "clinic";

  const filteredJobs =
    isWorker && workerSpecialty && !showAll
      ? jobs.filter((job) => job.type === workerSpecialty)
      : jobs;

  const hiddenCount =
    isWorker && workerSpecialty
      ? jobs.length - jobs.filter((j) => j.type === workerSpecialty).length
      : 0;

  return (
    <div className="space-y-4">
      {isWorker && workerSpecialty && (
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {showAll ? (
              <span className="text-muted-foreground">
                Showing <strong className="text-foreground">all {jobs.length}</strong> positions
              </span>
            ) : (
              <span className="text-muted-foreground">
                Showing{" "}
                <strong className="text-foreground">
                  {filteredJobs.length} {workerSpecialty}
                </strong>{" "}
                position{filteredJobs.length !== 1 ? "s" : ""}
                {hiddenCount > 0 && (
                  <span>
                    {" "}
                    ({hiddenCount} other{hiddenCount !== 1 ? "s" : ""} hidden)
                  </span>
                )}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowAll(!showAll)}>
            {showAll ? (
              <>
                <Filter className="h-3 w-3 mr-1" />
                Show My Specialty
              </>
            ) : (
              <>
                <X className="h-3 w-3 mr-1" />
                Show All Jobs
              </>
            )}
          </Button>
        </div>
      )}

      {filteredJobs.map((job) => {
        const alreadyApplied = appliedJobs.has(job.id);
        const when = relativeStartLabel(job.startDate);
        const isNew = isNewPosting(job.createdAt);

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
          <Card
            key={job.id}
            id={`job-${job.id}`}
            className={`hover:shadow-md transition-all ${highlightedJobId === job.id ? "ring-2 ring-primary shadow-lg" : ""}`}
          >
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{job.title}</h2>
                    <Badge variant="secondary">{job.type}</Badge>
                    {when && (
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                        {when}
                      </Badge>
                    )}
                    {isNew && (
                      <Badge className="text-[10px]">New</Badge>
                    )}
                    {isWorker && workerSpecialty && job.type !== workerSpecialty && (
                      <Badge variant="outline" className="text-[10px]">
                        Other specialty
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {job.clinic.name}
                    </span>
                    {typeof job.clinic.rating === "number" && job.clinic.reviewCount !== undefined && job.clinic.reviewCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        {job.clinic.rating} ({job.clinic.reviewCount})
                      </span>
                    )}
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
                  <p className="mt-3 text-sm text-muted-foreground">{job.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-lg font-bold text-primary">{job.rate}</span>
                  <span className="text-xs text-muted-foreground">{job.posted}</span>
                  {alreadyApplied ? (
                    <Badge variant="outline" className="mt-2 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Applied
                    </Badge>
                  ) : isWorker ? (
                    <Button size="sm" className="mt-2" onClick={() => setApplyingTo(job.id)}>
                      Apply Now
                    </Button>
                  ) : isClinic ? null : (
                    <Link
                      href="/sign-in"
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

      {filteredJobs.length === 0 && isWorker && workerSpecialty && !showAll && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="font-medium">No open {workerSpecialty.toLowerCase()} positions right now.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check other roles or check back soon — new shifts post often.
            </p>
            {hiddenCount > 0 && (
              <Button variant="default" size="sm" className="mt-4" onClick={() => setShowAll(true)}>
                View {hiddenCount} other position{hiddenCount !== 1 ? "s" : ""}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
