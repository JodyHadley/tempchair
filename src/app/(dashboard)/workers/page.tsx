export const dynamic = "force-dynamic";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAllWorkers } from "@/lib/db/queries";
import { WorkersDirectory } from "@/components/jobs/workers-directory";

export default async function WorkersPage() {
  const workers = await getAllWorkers();

  const workersData = workers.map((worker) => ({
    id: worker.id,
    firstName: worker.firstName,
    lastName: worker.lastName,
    initials: worker.initials,
    specialty: worker.specialty,
    location: worker.location,
    bio: worker.bio,
    experience: worker.experience,
    rating: worker.rating,
    reviewCount: worker.reviewCount,
    certifications: worker.certifications,
    availability: worker.availability,
    hourlyRate: worker.hourlyRate,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find Dental Professionals</h1>
          <p className="mt-1 text-muted-foreground">
            Browse qualified hygienists, assistants, and dentists available for temp work.
          </p>
        </div>
        <Link href="/sign-up?role=worker" className={cn(buttonVariants())}>
          List Your Profile
        </Link>
      </div>

      {workersData.length === 0 ? (
        <div className="mt-12 text-center text-muted-foreground">
          <p>No professionals listed yet. Check back soon.</p>
        </div>
      ) : (
        <WorkersDirectory workers={workersData} />
      )}
    </div>
  );
}
