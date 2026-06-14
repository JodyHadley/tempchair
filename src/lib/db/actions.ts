"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

export async function getWorkerDashboardData(workerId: string) {
  const [worker, applications, reviews, reviewsGiven] = await Promise.all([
    prisma.workerProfile.findUnique({ where: { id: workerId } }),
    prisma.application.findMany({
      where: { workerId },
      include: { job: { include: { clinic: true } } },
      orderBy: { createdAt: "desc" },
    }),
    // Reviews received: only show public reviews (private clinic reviews of workers
    // should only be visible to other premium clinics, not to the worker themselves)
    prisma.review.findMany({
      where: { toWorkerId: workerId, isPrivate: false },
      include: { job: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.findMany({
      where: { fromWorkerId: workerId },
      include: { job: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { worker, applications, reviews, reviewsGiven };
}

export async function getClinicDashboardData(clinicId: string) {
  const [clinic, jobs, reviews, reviewsGiven] = await Promise.all([
    prisma.clinicProfile.findUnique({ where: { id: clinicId } }),
    prisma.jobPosting.findMany({
      where: { clinicId },
      include: {
        applications: {
          include: { worker: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Reviews received: only show public reviews (private worker reviews of clinics
    // should only be visible to other workers, not to the clinic themselves)
    prisma.review.findMany({
      where: { toClinicId: clinicId, isPrivate: false },
      include: { job: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.findMany({
      where: { fromClinicId: clinicId },
      include: { job: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { clinic, jobs, reviews, reviewsGiven };
}

export async function updateReview(
  reviewId: string,
  data: {
    rating: number;
    comment: string;
    isPrivate: boolean;
  },
) {
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: data.rating,
      comment: data.comment,
      isPrivate: data.isPrivate,
    },
  });

  // Recalculate target's average rating
  if (review.toWorkerId) {
    const reviews = await prisma.review.findMany({
      where: { toWorkerId: review.toWorkerId },
      select: { rating: true },
    });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await prisma.workerProfile.update({
      where: { id: review.toWorkerId },
      data: { rating: Math.round(avg * 10) / 10, reviewCount: reviews.length },
    });
  }

  if (review.toClinicId) {
    const reviews = await prisma.review.findMany({
      where: { toClinicId: review.toClinicId },
      select: { rating: true },
    });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await prisma.clinicProfile.update({
      where: { id: review.toClinicId },
      data: { rating: Math.round(avg * 10) / 10, reviewCount: reviews.length },
    });
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateWorkerProfile(
  workerId: string,
  data: {
    firstName: string;
    lastName: string;
    specialty: "Hygienist" | "Assistant" | "Dentist";
    location: string;
    bio: string;
    experience: string;
    hourlyRate: string;
    availability: string;
    certifications: string[];
  },
) {
  const initials = (data.firstName[0] + data.lastName[0]).toUpperCase();

  await prisma.workerProfile.update({
    where: { id: workerId },
    data: {
      ...data,
      initials,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/workers");
  return { success: true };
}

export async function updateClinicProfile(
  clinicId: string,
  data: {
    name: string;
    contactName: string;
    email: string;
    location: string;
    address: string;
    phone: string;
    description: string;
  },
) {
  const initials = data.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  await prisma.clinicProfile.update({
    where: { id: clinicId },
    data: {
      ...data,
      initials,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/clinics");
  return { success: true };
}

export async function submitReview(data: {
  fromWorkerId?: string;
  fromClinicId?: string;
  fromRole: "worker" | "clinic";
  fromName: string;
  toWorkerId?: string;
  toClinicId?: string;
  toRole: "worker" | "clinic";
  rating: number;
  comment: string;
  jobId: string;
  isPrivate: boolean;
}) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  await prisma.review.create({
    data: {
      fromWorkerId: data.fromWorkerId || null,
      fromClinicId: data.fromClinicId || null,
      fromRole: data.fromRole,
      fromName: data.fromName,
      toWorkerId: data.toWorkerId || null,
      toClinicId: data.toClinicId || null,
      toRole: data.toRole,
      rating: data.rating,
      comment: data.comment,
      date: dateStr,
      jobId: data.jobId,
      isPrivate: data.isPrivate,
    },
  });

  // Update review count and recalculate average rating for the target
  if (data.toWorkerId) {
    const reviews = await prisma.review.findMany({
      where: { toWorkerId: data.toWorkerId },
      select: { rating: true },
    });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await prisma.workerProfile.update({
      where: { id: data.toWorkerId },
      data: { rating: Math.round(avg * 10) / 10, reviewCount: reviews.length },
    });
  }

  if (data.toClinicId) {
    const reviews = await prisma.review.findMany({
      where: { toClinicId: data.toClinicId },
      select: { rating: true },
    });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await prisma.clinicProfile.update({
      where: { id: data.toClinicId },
      data: { rating: Math.round(avg * 10) / 10, reviewCount: reviews.length },
    });
  }

  revalidatePath("/dashboard");
  return { success: true };
}

// ── Job Posting ─────────────────────────────────────────────

export async function createJobPosting(data: {
  clinicId: string;
  title: string;
  type: "Hygienist" | "Assistant" | "Dentist";
  startDate: string;
  endDate: string;
  hours: string;
  rate: string;
  description: string;
}) {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const dates = `${fmt(start)} – ${fmt(end)}`;

  // Expires at the end date or 30 days from now, whichever comes first
  const thirtyDays = new Date();
  thirtyDays.setDate(thirtyDays.getDate() + 30);
  const expiresAt = end < thirtyDays ? end : thirtyDays;

  await prisma.jobPosting.create({
    data: {
      clinicId: data.clinicId,
      title: data.title,
      type: data.type,
      dates,
      startDate: start,
      endDate: end,
      hours: data.hours,
      rate: data.rate,
      description: data.description,
      posted: "Just now",
      status: "open",
      expiresAt,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/jobs");
  return { success: true };
}

export async function updateJobPosting(
  jobId: string,
  data: {
    title: string;
    type: "Hygienist" | "Assistant" | "Dentist";
    startDate: string;
    endDate: string;
    hours: string;
    rate: string;
    description: string;
    status: "open" | "filled" | "completed" | "cancelled";
  },
) {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const dates = `${fmt(start)} – ${fmt(end)}`;

  const thirtyDays = new Date();
  thirtyDays.setDate(thirtyDays.getDate() + 30);
  const expiresAt = end < thirtyDays ? end : thirtyDays;

  await prisma.jobPosting.update({
    where: { id: jobId },
    data: {
      title: data.title,
      type: data.type,
      dates,
      startDate: start,
      endDate: end,
      hours: data.hours,
      rate: data.rate,
      description: data.description,
      status: data.status,
      expiresAt,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/jobs");
  return { success: true };
}

export async function expireOldJobs() {
  const now = new Date();
  await prisma.jobPosting.updateMany({
    where: {
      status: "open",
      OR: [
        { expiresAt: { lte: now } },
        { endDate: { lte: now } },
      ],
    },
    data: { status: "cancelled" },
  });
}
