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
  try {
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
  } catch (dbError) {
    console.error("Worker profile creation error:", dbError);
    return { success: false, error: "Account created but profile setup failed. Please contact support." };
  }

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
  try {
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
  } catch (dbError) {
    console.error("Clinic profile creation error:", dbError);
    return { success: false, error: "Account created but profile setup failed. Please contact support." };
  }

  return { success: true };
}

// ── Google OAuth Profile Setup ─────────────────────────────

export async function createProfileForGoogleUser(data: {
  authUserId: string;
  email: string;
  role: "worker" | "clinic";
  firstName?: string;
  lastName?: string;
  specialty?: "Hygienist" | "Assistant" | "Dentist";
  clinicName?: string;
  contactName?: string;
}) {
  const supabase = getAdminClient();
  const profileId = crypto.randomUUID();

  try {
    if (data.role === "worker") {
      const firstName = data.firstName || "";
      const lastName = data.lastName || "";
      const initials = ((firstName[0] || "") + (lastName[0] || "")).toUpperCase() || "??";
      const name = `${firstName} ${lastName}`.trim();

      await prisma.workerProfile.create({
        data: {
          id: profileId,
          authUserId: data.authUserId,
          email: data.email,
          firstName,
          lastName,
          initials,
          specialty: data.specialty || "Hygienist",
          location: "",
          bio: "",
          experience: "",
          certifications: [],
          availability: "",
          hourlyRate: "",
        },
      });

      await supabase.auth.admin.updateUserById(data.authUserId, {
        user_metadata: { role: "worker", profileId, name, initials },
      });

      return { success: true, profileId, name, initials, role: "worker" as const };
    } else {
      const clinicName = data.clinicName || "";
      const initials = clinicName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "??";

      await prisma.clinicProfile.create({
        data: {
          id: profileId,
          authUserId: data.authUserId,
          email: data.email,
          name: clinicName,
          contactName: data.contactName || "",
          initials,
          location: "",
          address: "",
          phone: "",
          description: "",
          claimed: true,
          premiumTrialEndsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        },
      });

      await supabase.auth.admin.updateUserById(data.authUserId, {
        user_metadata: { role: "clinic", profileId, name: clinicName, initials },
      });

      return { success: true, profileId, name: clinicName, initials, role: "clinic" as const };
    }
  } catch (err) {
    console.error("Google profile creation error:", err);
    return { success: false, error: "Failed to create profile. Please try again." };
  }
}
