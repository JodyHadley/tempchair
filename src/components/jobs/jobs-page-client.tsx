"use client";

import { useState, useCallback } from "react";
import { JobCalendar } from "./job-calendar";
import { JobListings } from "./job-listings";

interface JobData {
  id: string;
  title: string;
  type: string;
  dates: string;
  startDate: string;
  endDate: string;
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

export function JobsPageClient({
  jobs,
  bookedJobs,
  workerApplications,
  workerSpecialty,
}: {
  jobs: JobData[];
  bookedJobs: JobData[];
  workerApplications: { jobId: string; status: string }[];
  workerSpecialty: string | null;
}) {
  const [highlightedJobId, setHighlightedJobId] = useState<string | null>(null);

  const handleJobClick = useCallback((jobId: string) => {
    setHighlightedJobId(jobId);

    // Scroll to the job card
    const el = document.getElementById(`job-${jobId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Flash highlight
      setTimeout(() => setHighlightedJobId(null), 3000);
    }
  }, []);

  return (
    <>
      {workerSpecialty && (
        <div className="mt-8">
          <JobCalendar
            availableJobs={jobs}
            bookedJobs={bookedJobs}
            workerApplications={workerApplications}
            workerSpecialty={workerSpecialty}
            onJobClick={handleJobClick}
          />
        </div>
      )}

      <div className="mt-8">
        <JobListings
          jobs={jobs}
          workerApplications={workerApplications.map((a) => ({ jobId: a.jobId }))}
          workerSpecialty={workerSpecialty}
          highlightedJobId={highlightedJobId}
        />
      </div>
    </>
  );
}
