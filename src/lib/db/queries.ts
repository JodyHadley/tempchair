import { prisma } from "./prisma";
import type { UserRole } from "@/generated/prisma/client";

// ── Worker Queries ──────────────────────────────────────────

export async function getWorkerById(id: string) {
  return prisma.workerProfile.findUnique({ where: { id } });
}

export async function getAllWorkers() {
  return prisma.workerProfile.findMany({ orderBy: { rating: "desc" } });
}

// ── Clinic Queries ──────────────────────────────────────────

export async function getClinicById(id: string) {
  return prisma.clinicProfile.findUnique({ where: { id } });
}

export async function getAllClinics() {
  return prisma.clinicProfile.findMany({ orderBy: { name: "asc" } });
}

export async function getClaimedClinics() {
  return prisma.clinicProfile.findMany({
    where: { claimed: true },
    orderBy: { name: "asc" },
  });
}

export async function getUnclaimedClinics() {
  return prisma.clinicProfile.findMany({
    where: { claimed: false },
    orderBy: { name: "asc" },
  });
}

// ── Job Queries ─────────────────────────────────────────────

export async function getJobById(id: string) {
  return prisma.jobPosting.findUnique({ where: { id } });
}

export async function getJobsByClinicId(clinicId: string) {
  return prisma.jobPosting.findMany({
    where: { clinicId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOpenJobs() {
  return prisma.jobPosting.findMany({
    where: { status: "open" },
    include: { clinic: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOpenJobsPlain() {
  return prisma.jobPosting.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "desc" },
  });
}

// ── Application Queries ─────────────────────────────────────

export async function getApplicationsByWorkerId(workerId: string) {
  return prisma.application.findMany({
    where: { workerId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getApplicationsByJobId(jobId: string) {
  return prisma.application.findMany({
    where: { jobId },
    orderBy: { createdAt: "desc" },
  });
}

// ── Review Queries ──────────────────────────────────────────

export async function getReviewsForWorker(workerId: string) {
  return prisma.review.findMany({
    where: { toWorkerId: workerId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReviewsForClinic(clinicId: string) {
  return prisma.review.findMany({
    where: { toClinicId: clinicId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReviewsByWorker(workerId: string) {
  return prisma.review.findMany({
    where: { fromWorkerId: workerId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReviewsByClinic(clinicId: string) {
  return prisma.review.findMany({
    where: { fromClinicId: clinicId },
    orderBy: { createdAt: "desc" },
  });
}

// ── User Lookup (for auth) ──────────────────────────────────

export async function getWorkerByAuthUserId(authUserId: string) {
  return prisma.workerProfile.findUnique({ where: { authUserId } });
}

export async function getClinicByAuthUserId(authUserId: string) {
  return prisma.clinicProfile.findUnique({ where: { authUserId } });
}

export async function getProfileByAuthUserId(authUserId: string) {
  const worker = await prisma.workerProfile.findUnique({ where: { authUserId } });
  if (worker) return { role: "worker" as const, profile: worker };

  const clinic = await prisma.clinicProfile.findUnique({ where: { authUserId } });
  if (clinic) return { role: "clinic" as const, profile: clinic };

  return null;
}
