"use server";

import { prisma } from "./prisma";

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
