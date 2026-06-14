"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

export async function getWorkerDashboardData(workerId: string) {
  const [worker, applications, reviews] = await Promise.all([
    prisma.workerProfile.findUnique({ where: { id: workerId } }),
    prisma.application.findMany({
      where: { workerId },
      include: { job: { include: { clinic: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.findMany({
      where: { toWorkerId: workerId },
      include: { job: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { worker, applications, reviews };
}

export async function getClinicDashboardData(clinicId: string) {
  const [clinic, jobs, reviews] = await Promise.all([
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
    prisma.review.findMany({
      where: { toClinicId: clinicId },
      include: { job: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { clinic, jobs, reviews };
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
