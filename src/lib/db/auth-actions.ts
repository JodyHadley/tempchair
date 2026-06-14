"use server";

import { prisma } from "./prisma";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function createWorkerAccount(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  specialty: "Hygienist" | "Assistant" | "Dentist";
}) {
  const supabase = getAdminClient();

  // Create a placeholder profile ID first
  const profileId = crypto.randomUUID();
  const initials = (data.firstName[0] + data.lastName[0]).toUpperCase();
  const name = `${data.firstName} ${data.lastName}`;

  // Create Supabase auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      role: "worker",
      profileId,
      name,
      initials,
    },
  });

  if (authError) {
    if (authError.message.includes("already been registered")) {
      return { success: false, error: "An account with this email already exists. Try signing in." };
    }
    return { success: false, error: authError.message };
  }

  // Create worker profile in database
  await prisma.workerProfile.create({
    data: {
      id: profileId,
      authUserId: authData.user.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      initials,
      specialty: data.specialty,
      location: "",
      bio: "",
      experience: "",
      certifications: [],
      availability: "",
      hourlyRate: "",
    },
  });

  return { success: true };
}

export async function createClinicAccount(data: {
  email: string;
  password: string;
  clinicName: string;
  contactName: string;
}) {
  const supabase = getAdminClient();

  const profileId = crypto.randomUUID();
  const initials = data.clinicName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Create Supabase auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      role: "clinic",
      profileId,
      name: data.clinicName,
      initials,
    },
  });

  if (authError) {
    if (authError.message.includes("already been registered")) {
      return { success: false, error: "An account with this email already exists. Try signing in." };
    }
    return { success: false, error: authError.message };
  }

  // Create clinic profile in database
  await prisma.clinicProfile.create({
    data: {
      id: profileId,
      authUserId: authData.user.id,
      email: data.email,
      name: data.clinicName,
      contactName: data.contactName,
      initials,
      location: "",
      address: "",
      phone: "",
      description: "",
      claimed: true,
      premiumTrialEndsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });

  return { success: true };
}
