"use server";

import { prisma } from "./prisma";
import { stripe } from "@/lib/stripe/stripe";

function getDaysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function getSignupDetails() {
  const thirtyDaysAgo = getDaysAgo(30);

  const [workers, clinics] = await Promise.all([
    prisma.workerProfile.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, firstName: true, lastName: true, email: true, specialty: true, location: true, createdAt: true },
    }),
    prisma.clinicProfile.findMany({
      where: { claimed: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, location: true, premiumTier: true, premiumTrialEndsAt: true, createdAt: true },
    }),
  ]);

  // Daily signups for last 30 days
  const dailySignups: { date: string; workers: number; clinics: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const dayStart = new Date(getDaysAgo(i));
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const dayWorkers = workers.filter((w) => new Date(w.createdAt) >= dayStart && new Date(w.createdAt) <= dayEnd).length;
    const dayClinics = clinics.filter((c) => new Date(c.createdAt) >= dayStart && new Date(c.createdAt) <= dayEnd).length;

    dailySignups.push({ date: formatDate(dayStart), workers: dayWorkers, clinics: dayClinics });
  }

  return { workers, clinics, dailySignups, totalWorkers: workers.length, totalClinics: clinics.length };
}

export async function getJobDetails() {
  const jobs = await prisma.jobPosting.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      clinic: { select: { name: true, location: true } },
      _count: { select: { applications: true } },
    },
  });

  const byStatus = {
    open: jobs.filter((j) => j.status === "open").length,
    filled: jobs.filter((j) => j.status === "filled").length,
    completed: jobs.filter((j) => j.status === "completed").length,
    cancelled: jobs.filter((j) => j.status === "cancelled").length,
  };

  const byType = {
    Hygienist: jobs.filter((j) => j.type === "Hygienist").length,
    Assistant: jobs.filter((j) => j.type === "Assistant").length,
    Dentist: jobs.filter((j) => j.type === "Dentist").length,
  };

  const avgApplicants = jobs.length > 0
    ? Math.round((jobs.reduce((sum, j) => sum + j._count.applications, 0) / jobs.length) * 10) / 10
    : 0;

  return { jobs, byStatus, byType, avgApplicants, total: jobs.length };
}

export async function getApplicationDetails() {
  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      worker: { select: { firstName: true, lastName: true, specialty: true } },
      job: { select: { title: true, dates: true, clinic: { select: { name: true } } } },
    },
  });

  const byStatus = {
    pending: applications.filter((a) => a.status === "pending").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    withdrawn: applications.filter((a) => a.status === "withdrawn").length,
  };

  const total = applications.length;
  const acceptRate = total > 0 ? Math.round((byStatus.accepted / total) * 100) : 0;

  return { applications, byStatus, total, acceptRate };
}

export async function getRevenueDetails() {
  let payments: {
    id: string;
    amount: number;
    description: string;
    status: string;
    date: string;
    email: string | null;
  }[] = [];

  let monthlyRevenue: { month: string; amount: number }[] = [];

  try {
    const charges = await stripe.charges.list({ limit: 100 });
    payments = charges.data.map((c) => ({
      id: c.id,
      amount: c.amount,
      description: c.description || (c.amount === 3500 ? "Job Posting ($35)" : c.amount === 8900 ? "Premium Subscription ($89)" : `Payment ($${(c.amount / 100).toFixed(2)})`),
      status: c.status,
      date: new Date(c.created * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      email: c.billing_details?.email || null,
    }));

    // Group by month
    const byMonth: Record<string, number> = {};
    charges.data.filter((c) => c.status === "succeeded").forEach((c) => {
      const month = new Date(c.created * 1000).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      byMonth[month] = (byMonth[month] || 0) + c.amount;
    });
    monthlyRevenue = Object.entries(byMonth).map(([month, amount]) => ({ month, amount }));
  } catch {
    // Stripe may fail
  }

  const totalRevenue = payments.filter((p) => p.status === "succeeded").reduce((sum, p) => sum + p.amount, 0);
  const postingRevenue = payments.filter((p) => p.status === "succeeded" && p.amount === 3500).reduce((sum, p) => sum + p.amount, 0);
  const premiumRevenue = payments.filter((p) => p.status === "succeeded" && p.amount === 8900).reduce((sum, p) => sum + p.amount, 0);

  return { payments, monthlyRevenue, totalRevenue, postingRevenue, premiumRevenue };
}

export async function getEngagementDetails() {
  const [messages, reviews, credentials] = await Promise.all([
    prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, senderRole: true, senderName: true, content: true, createdAt: true },
    }),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, fromName: true, fromRole: true, toRole: true, rating: true, isPrivate: true, comment: true, date: true },
    }),
    prisma.credential.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { worker: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  const totalMessages = await prisma.message.count();
  const totalReviews = await prisma.review.count();
  const totalCredentials = await prisma.credential.count();
  const verifiedCredentials = await prisma.credential.count({ where: { verified: true } });

  return {
    messages, reviews, credentials,
    totalMessages, totalReviews, totalCredentials, verifiedCredentials,
  };
}
