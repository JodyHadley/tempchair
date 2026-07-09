"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { WorkerDashboard } from "@/components/dashboard/worker-dashboard";
import { ClinicDashboard } from "@/components/dashboard/clinic-dashboard";
import { GoogleProfileSetup } from "@/components/auth/google-profile-setup";
import { getWorkerDashboardData, getClinicDashboardData } from "@/lib/db/actions";

type WorkerData = Awaited<ReturnType<typeof getWorkerDashboardData>>;
type ClinicData = Awaited<ReturnType<typeof getClinicDashboardData>>;

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 rounded bg-muted" />
        <div className="h-4 w-96 rounded bg-muted" />
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted" />
          ))}
        </div>
        <div className="h-64 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoading, needsProfile, pendingAuthUser } = useAuth();
  const router = useRouter();
  const [workerData, setWorkerData] = useState<WorkerData | null>(null);
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user && !needsProfile) {
      router.replace("/sign-in");
    }
    // Redirect admin users to /admin
    if (!isLoading && user?.role === "admin") {
      router.replace("/admin");
    }
  }, [isLoading, user, needsProfile, router]);

  useEffect(() => {
    if (!user || user.role === "admin") return;

    setDataLoading(true);
    if (user.role === "worker") {
      getWorkerDashboardData(user.id).then((data) => {
        setWorkerData(data);
        setDataLoading(false);
      });
    } else {
      getClinicDashboardData(user.id).then((data) => {
        setClinicData(data);
        setDataLoading(false);
      });
    }
  }, [user]);

  // New Google user needs to complete profile setup
  if (needsProfile && pendingAuthUser) {
    return <GoogleProfileSetup authUser={pendingAuthUser} />;
  }

  if (isLoading || dataLoading || !user) {
    if (!isLoading && !user) return null;
    return <LoadingSkeleton />;
  }

  function refreshData() {
    if (!user) return;
    setDataLoading(true);
    if (user.role === "worker") {
      getWorkerDashboardData(user.id).then((data) => {
        setWorkerData(data);
        setDataLoading(false);
      });
    } else {
      getClinicDashboardData(user.id).then((data) => {
        setClinicData(data);
        setDataLoading(false);
      });
    }
  }

  if (user.role === "worker" && workerData?.worker) {
    return <WorkerDashboard data={workerData} onRefresh={refreshData} />;
  }

  if (user.role === "clinic" && clinicData?.clinic) {
    return (
      <Suspense fallback={<LoadingSkeleton />}>
        <ClinicDashboard data={clinicData} onRefresh={refreshData} />
      </Suspense>
    );
  }

  return <LoadingSkeleton />;
}
