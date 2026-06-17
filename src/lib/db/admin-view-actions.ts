"use server";

import { prisma } from "./prisma";
import { stripe } from "@/lib/stripe/stripe";

export async function getAllWorkers() {
  return prisma.workerProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { applications: true, credentials: true, reviewsReceived: true } },
    },
  });
}

export async function getAllClaimedClinics() {
  return prisma.clinicProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { jobs: true, reviewsReceived: true } },
    },
  });
}

export async function getAllJobs() {
  return prisma.jobPosting.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      clinic: { select: { name: true, location: true } },
      _count: { select: { applications: true } },
    },
  });
}

export async function getAllApplications() {
  return prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      worker: { select: { firstName: true, lastName: true, specialty: true, email: true } },
      job: { select: { title: true, dates: true, rate: true, status: true, clinic: { select: { name: true } } } },
      _count: { select: { messages: true } },
    },
  });
}

export async function getAllTransactions() {
  try {
    const charges = await stripe.charges.list({ limit: 100 });
    return charges.data.map((c) => ({
      id: c.id,
      amount: c.amount,
      description: c.description || (c.amount === 3500 ? "Job Posting" : c.amount === 8900 ? "Premium Subscription" : "Payment"),
      status: c.status,
      date: new Date(c.created * 1000).toISOString(),
      dateFormatted: new Date(c.created * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      email: c.billing_details?.email || "",
      receiptUrl: c.receipt_url || "",
    }));
  } catch {
    return [];
  }
}
