"use server";

import { prisma } from "./prisma";
import { stripe } from "@/lib/stripe/stripe";

export async function getAdminDashboardData() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalWorkers,
    totalClinics,
    claimedClinics,
    totalJobs,
    openJobs,
    totalApplications,
    pendingApplications,
    totalReviews,
    totalCredentials,
    totalMessages,
    recentWorkers,
    recentClinics,
    recentJobs,
    recentApplications,
    workers,
    clinics,
    jobs,
  ] = await Promise.all([
    prisma.workerProfile.count(),
    prisma.clinicProfile.count(),
    prisma.clinicProfile.count({ where: { claimed: true } }),
    prisma.jobPosting.count(),
    prisma.jobPosting.count({ where: { status: "open" } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: "pending" } }),
    prisma.review.count(),
    prisma.credential.count(),
    prisma.message.count(),
    prisma.workerProfile.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.clinicProfile.count({ where: { createdAt: { gte: sevenDaysAgo }, claimed: true } }),
    prisma.jobPosting.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.application.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.workerProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true, firstName: true, lastName: true, email: true, specialty: true,
        location: true, rating: true, reviewCount: true, createdAt: true,
      },
    }),
    prisma.clinicProfile.findMany({
      where: { claimed: true },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true, name: true, email: true, location: true, rating: true,
        reviewCount: true, claimed: true, premiumTier: true, premiumTrialEndsAt: true,
        createdAt: true,
      },
    }),
    prisma.jobPosting.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { clinic: { select: { name: true } }, _count: { select: { applications: true } } },
    }),
  ]);

  // Stripe revenue (last 30 days)
  let revenue30d = 0;
  let revenueTotal = 0;
  let premiumSubscribers = 0;
  try {
    const charges = await stripe.charges.list({ limit: 100, created: { gte: Math.floor(thirtyDaysAgo.getTime() / 1000) } });
    revenue30d = charges.data
      .filter((c) => c.status === "succeeded")
      .reduce((sum, c) => sum + c.amount, 0);

    const allCharges = await stripe.charges.list({ limit: 100 });
    revenueTotal = allCharges.data
      .filter((c) => c.status === "succeeded")
      .reduce((sum, c) => sum + c.amount, 0);

    const subs = await stripe.subscriptions.list({ status: "active", limit: 100 });
    premiumSubscribers = subs.data.length;
  } catch {
    // Stripe may fail in some environments
  }

  return {
    metrics: {
      totalWorkers,
      totalClinics,
      claimedClinics,
      totalJobs,
      openJobs,
      totalApplications,
      pendingApplications,
      totalReviews,
      totalCredentials,
      totalMessages,
      recentWorkers,
      recentClinics,
      recentJobs,
      recentApplications,
      revenue30d,
      revenueTotal,
      premiumSubscribers,
    },
    workers,
    clinics,
    jobs,
  };
}

export async function toggleClinicPremium(clinicId: string) {
  const clinic = await prisma.clinicProfile.findUnique({ where: { id: clinicId }, select: { premiumTier: true } });
  if (!clinic) return { error: "Clinic not found." };

  await prisma.clinicProfile.update({
    where: { id: clinicId },
    data: { premiumTier: !clinic.premiumTier },
  });

  return { success: true };
}

export async function verifyCredential(credentialId: string) {
  await prisma.credential.update({
    where: { id: credentialId },
    data: { verified: true },
  });
  return { success: true };
}

export async function getPendingCredentials() {
  return prisma.credential.findMany({
    where: { verified: false, fileUrl: { not: null } },
    include: {
      worker: { select: { firstName: true, lastName: true, specialty: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
