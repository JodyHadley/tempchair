"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

export async function sendMessage(data: {
  applicationId: string;
  senderRole: "worker" | "clinic";
  senderName: string;
  content: string;
  senderId: string;
}) {
  // Verify sender has access to this application
  const app = await prisma.application.findUnique({
    where: { id: data.applicationId },
    include: { job: true },
  });

  if (!app) return { success: false, error: "Application not found." };

  // Worker can only message on their own applications
  if (data.senderRole === "worker" && app.workerId !== data.senderId) {
    return { success: false, error: "Access denied." };
  }

  // Clinic can only message on applications for their jobs
  if (data.senderRole === "clinic" && app.job.clinicId !== data.senderId) {
    return { success: false, error: "Access denied." };
  }

  if (data.content.trim().length === 0) {
    return { success: false, error: "Message cannot be empty." };
  }

  await prisma.message.create({
    data: {
      applicationId: data.applicationId,
      senderRole: data.senderRole,
      senderName: data.senderName,
      content: data.content.trim(),
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getMessagesForApplication(applicationId: string) {
  return prisma.message.findMany({
    where: { applicationId },
    orderBy: { createdAt: "asc" },
  });
}

export async function markMessagesAsRead(applicationId: string, readerRole: "worker" | "clinic") {
  // Mark messages from the OTHER role as read
  const oppositeRole = readerRole === "worker" ? "clinic" : "worker";
  await prisma.message.updateMany({
    where: {
      applicationId,
      senderRole: oppositeRole,
      readAt: null,
    },
    data: { readAt: new Date() },
  });
}

export async function getUnreadMessageCount(userId: string, userRole: "worker" | "clinic") {
  if (userRole === "worker") {
    // Count unread messages from clinics on this worker's applications
    return prisma.message.count({
      where: {
        senderRole: "clinic",
        readAt: null,
        application: { workerId: userId },
      },
    });
  } else {
    // Count unread messages from workers on this clinic's job applications
    return prisma.message.count({
      where: {
        senderRole: "worker",
        readAt: null,
        application: { job: { clinicId: userId } },
      },
    });
  }
}
