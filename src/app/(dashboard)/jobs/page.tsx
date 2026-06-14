export const dynamic = "force-dynamic";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getOpenJobs } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { JobListings } from "@/components/jobs/job-listings";
import { JobCalendar } from "@/components/jobs/job-calendar";

export default async function JobsPage() {
  const openJobs = await getOpenJobs();

  // Get current user's info if they're a worker
  let workerApplications: { jobId: string; status: string }[] = [];
  let workerSpecialty: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role === "worker" && user.user_metadata?.profileId) {
      const [apps, worker] = await Promise.all([
        prisma.application.findMany({
          where: { workerId: user.user_metadata.profileId },
          select: { jobId: true, status: true },
        }),
        prisma.workerProfile.findUnique({
          where: { id: user.user_metadata.profileId },
          select: { specialty: true },
        }),
      ]);
      workerApplications = apps;
      workerSpecialty = worker?.specialty ?? null;
    }
  } catch {
    // Not logged in or error
  }

  const jobsData = openJobs.map((job) => ({
    id: job.id,
    title: job.title,
    type: job.type,
    dates: job.dates,
    startDate: job.startDate.toISOString(),
    endDate: job.endDate.toISOString(),
    hours: job.hours,
    rate: job.rate,
    description: job.description,
    posted: job.posted,
    clinic: {
      name: job.clinic.name,
      location: job.clinic.location,
    },
  }));

  // Also get jobs the worker is booked for (accepted, not just open jobs)
  let bookedJobs: typeof jobsData = [];
  if (workerSpecialty) {
    const acceptedApps = workerApplications.filter((a) => a.status === "accepted");
    if (acceptedApps.length > 0) {
      const bookedJobRecords = await prisma.jobPosting.findMany({
        where: { id: { in: acceptedApps.map((a) => a.jobId) } },
        include: { clinic: true },
      });
      bookedJobs = bookedJobRecords.map((job) => ({
        id: job.id,
        title: job.title,
        type: job.type,
        dates: job.dates,
        startDate: job.startDate.toISOString(),
        endDate: job.endDate.toISOString(),
        hours: job.hours,
        rate: job.rate,
        description: job.description,
        posted: job.posted,
        clinic: {
          name: job.clinic.name,
          location: job.clinic.location,
        },
      }));
    }
  }

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

      {/* Calendar view for workers */}
      {workerSpecialty && (
        <div className="mt-8">
          <JobCalendar
            availableJobs={jobsData}
            bookedJobs={bookedJobs}
            workerApplications={workerApplications}
            workerSpecialty={workerSpecialty}
          />
        </div>
      )}

      <div className="mt-8">
        <JobListings
          jobs={jobsData}
          workerApplications={workerApplications.map((a) => ({ jobId: a.jobId }))}
          workerSpecialty={workerSpecialty}
        />
      </div>

      {openJobs.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">No open positions right now. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
