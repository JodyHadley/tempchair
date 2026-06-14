"use server";

import { stripe, PRICES } from "./stripe";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function createPostingCheckout(clinicId: string) {
  const clinic = await prisma.clinicProfile.findUnique({
    where: { id: clinicId },
    select: { name: true, email: true },
  });

  if (!clinic) return { error: "Clinic not found." };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Job Posting — TempChair",
            description: "Post one position for 30 days",
          },
          unit_amount: PRICES.POSTING,
        },
        quantity: 1,
      },
    ],
    customer_email: clinic.email || undefined,
    metadata: {
      clinicId,
      type: "posting",
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tempchair.com"}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tempchair.com"}/dashboard?payment=cancelled`,
  });

  return { url: session.url };
}

export async function createPremiumCheckout(clinicId: string) {
  const clinic = await prisma.clinicProfile.findUnique({
    where: { id: clinicId },
    select: { name: true, email: true, authUserId: true },
  });

  if (!clinic) return { error: "Clinic not found." };

  // Check if clinic already has a Stripe customer
  let customerId: string | undefined;
  const existingCustomers = await stripe.customers.list({
    email: clinic.email || undefined,
    limit: 1,
  });
  if (existingCustomers.data.length > 0) {
    customerId = existingCustomers.data[0].id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "TempChair Premium",
            description: "Unlimited postings, private reviews, market insights",
          },
          unit_amount: PRICES.PREMIUM_MONTHLY,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    customer: customerId,
    customer_email: customerId ? undefined : clinic.email || undefined,
    metadata: {
      clinicId,
      type: "premium",
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tempchair.com"}/dashboard?payment=premium_success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tempchair.com"}/dashboard?payment=cancelled`,
  });

  return { url: session.url };
}

export async function handlePaymentSuccess(clinicId: string, type: string) {
  if (type === "premium") {
    await prisma.clinicProfile.update({
      where: { id: clinicId },
      data: { premiumTier: true },
    });
    revalidatePath("/dashboard");
  }
}

export async function getClinicPaymentStatus(clinicId: string) {
  const clinic = await prisma.clinicProfile.findUnique({
    where: { id: clinicId },
    select: { premiumTier: true, premiumTrialEndsAt: true },
  });

  if (!clinic) return null;

  const isPremium = clinic.premiumTier ||
    (clinic.premiumTrialEndsAt !== null && new Date(clinic.premiumTrialEndsAt) > new Date());

  const trialDaysLeft = clinic.premiumTrialEndsAt && !clinic.premiumTier
    ? Math.max(0, Math.ceil((new Date(clinic.premiumTrialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return { isPremium, isPaidPremium: clinic.premiumTier, trialDaysLeft };
}
