"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function addCredential(data: {
  workerId: string;
  type: string;
  name: string;
  number?: string;
  issuedBy?: string;
  expiresAt?: string;
}) {
  await prisma.credential.create({
    data: {
      workerId: data.workerId,
      type: data.type as any,
      name: data.name,
      number: data.number || null,
      issuedBy: data.issuedBy || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateCredential(
  credentialId: string,
  workerId: string,
  data: {
    name: string;
    number?: string;
    issuedBy?: string;
    expiresAt?: string;
  },
) {
  const cred = await prisma.credential.findUnique({ where: { id: credentialId } });
  if (!cred || cred.workerId !== workerId) {
    return { success: false, error: "Credential not found." };
  }

  await prisma.credential.update({
    where: { id: credentialId },
    data: {
      name: data.name,
      number: data.number || null,
      issuedBy: data.issuedBy || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteCredential(credentialId: string, workerId: string) {
  const cred = await prisma.credential.findUnique({ where: { id: credentialId } });
  if (!cred || cred.workerId !== workerId) {
    return { success: false, error: "Credential not found." };
  }

  // Delete file from storage if exists
  if (cred.fileUrl) {
    const supabase = getAdminClient();
    const path = cred.fileUrl.split("/credentials/")[1];
    if (path) {
      await supabase.storage.from("credentials").remove([path]);
    }
  }

  await prisma.credential.delete({ where: { id: credentialId } });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function uploadCredentialFile(credentialId: string, workerId: string, formData: FormData) {
  const cred = await prisma.credential.findUnique({ where: { id: credentialId } });
  if (!cred || cred.workerId !== workerId) {
    return { success: false, error: "Credential not found." };
  }

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided." };

  const supabase = getAdminClient();
  const ext = file.name.split(".").pop();
  const path = `${workerId}/${credentialId}.${ext}`;

  // Delete old file if exists
  if (cred.fileUrl) {
    const oldPath = cred.fileUrl.split("/credentials/")[1];
    if (oldPath) {
      await supabase.storage.from("credentials").remove([oldPath]);
    }
  }

  const { error } = await supabase.storage
    .from("credentials")
    .upload(path, file, { upsert: true });

  if (error) {
    return { success: false, error: "File upload failed: " + error.message };
  }

  const { data: urlData } = supabase.storage
    .from("credentials")
    .getPublicUrl(path);

  await prisma.credential.update({
    where: { id: credentialId },
    data: {
      fileUrl: urlData.publicUrl,
      fileName: file.name,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getWorkerCredentials(workerId: string) {
  return prisma.credential.findMany({
    where: { workerId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCredentialDownloadUrl(credentialId: string, requesterId: string, requesterRole: string) {
  const cred = await prisma.credential.findUnique({
    where: { id: credentialId },
    include: { worker: { select: { id: true } } },
  });

  if (!cred || !cred.fileUrl) return { success: false, error: "File not found." };

  // Worker can access their own credentials
  if (requesterRole === "worker" && cred.workerId === requesterId) {
    return { success: true, url: cred.fileUrl };
  }

  // Clinic can access credentials of workers they have accepted applications for
  if (requesterRole === "clinic") {
    const acceptedApp = await prisma.application.findFirst({
      where: {
        workerId: cred.workerId,
        status: "accepted",
        job: { clinicId: requesterId },
      },
    });
    if (acceptedApp) {
      return { success: true, url: cred.fileUrl };
    }
  }

  return { success: false, error: "Access denied." };
}
