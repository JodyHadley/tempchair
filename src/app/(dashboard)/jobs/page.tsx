export const dynamic = "force-dynamic";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getOpenJobs } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { JobsPageClient } from "@/components/jobs/jobs-page-client";

export default async function JobsPage() {
  const openJobs = await getOpenJobs();

  let workerApplications: { jobId: string; status: string }[] = [];
  let workerSpecialty: string | null = null;
  let userRole: "worker" | "clinic" | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.user_metadata?.role === "worker" && user.user_metadata?.profileId) {
      userRole = "worker";
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
    } else if (user?.user_metadata?.role === "clinic") {
      userRole = "clinic";
    }
  } catch {
    // Not logged in or error
  }

  // Soonest start first for decision-friendly browsing
  const sortedJobs = [...openJobs].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime(),
  );

  const jobsData = sortedJobs.map((job) => ({
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
    createdAt: job.createdAt.toISOString(),
    clinic: {
      name: job.clinic.name,
      location: job.clinic.location,
      rating: job.clinic.rating,
      reviewCount: job.clinic.reviewCount,
    },
  }));

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
        createdAt: job.createdAt.toISOString(),
        clinic: {
          name: job.clinic.name,
          location: job.clinic.location,
          rating: job.clinic.rating,
          reviewCount: job.clinic.reviewCount,
        },
      }));
    }
  }

  const postCta =
    userRole === "clinic"
      ? { href: "/dashboard?post=1", label: "Post a Position" }
      : userRole === "worker"
        ? null
        : { href: "/sign-up?role=clinic", label: "Post a Position" };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Open Positions</h1>
          <p className="mt-1 text-muted-foreground">
            Browse available shifts and positions at dental clinics near you.
          </p>
        </div>
        {postCta && (
          <Link href={postCta.href} className={cn(buttonVariants())}>
            {postCta.label}
          </Link>
        )}
      </div>

      <JobsPageClient
        jobs={jobsData}
        bookedJobs={bookedJobs}
        workerApplications={workerApplications}
        workerSpecialty={workerSpecialty}
      />

      {openJobs.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">No open positions right now. Check back soon!</p>
          {userRole === "clinic" && (
            <Link href="/dashboard?post=1" className={cn(buttonVariants({ size: "sm" }), "mt-4 inline-flex")}>
              Post a position
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
