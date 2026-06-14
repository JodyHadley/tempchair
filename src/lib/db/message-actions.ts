"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

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

  // Send email notification to the other party
  try {
    let recipientEmail: string | null = null;
    let recipientName = "";
    let jobTitle = app.job?.title || "a position";

    if (data.senderRole === "worker") {
      // Notify the clinic
      const clinic = await prisma.clinicProfile.findUnique({
        where: { id: app.job.clinicId },
        select: { email: true, name: true },
      });
      if (clinic?.email) {
        recipientEmail = clinic.email;
        recipientName = clinic.name;
      }
    } else {
      // Notify the worker
      const worker = await prisma.workerProfile.findUnique({
        where: { id: app.workerId },
        select: { email: true, firstName: true },
      });
      if (worker?.email) {
        recipientEmail = worker.email;
        recipientName = worker.firstName;
      }
    }

    if (recipientEmail && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "TempChair <noreply@notifications.tempchair.com>",
        to: recipientEmail,
        subject: `New message from ${data.senderName} — TempChair`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #1a7a6d; margin-bottom: 4px;">New Message on TempChair</h2>
            <p style="color: #666; margin-top: 0;">Regarding: <strong>${jobTitle}</strong></p>
            <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0 0 4px 0; font-size: 13px; color: #888;">${data.senderName} wrote:</p>
              <p style="margin: 0; font-size: 15px;">${data.content.trim()}</p>
            </div>
            <a href="https://tempchair.com/dashboard" style="display: inline-block; background: #1a7a6d; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">View & Reply on TempChair</a>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">You received this because you have an active application on TempChair.</p>
          </div>
        `,
      });
    }
  } catch (emailError) {
    // Don't fail the message send if email fails
    console.error("Email notification failed:", emailError);
  }

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
