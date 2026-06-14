import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/stripe";
import { prisma } from "@/lib/db/prisma";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    // In development without webhook secret, parse the event directly
    // In production, you MUST set STRIPE_WEBHOOK_SECRET
    if (process.env.NODE_ENV === "production" && !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }
  }

  let event: Stripe.Event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clinicId = session.metadata?.clinicId;
        const type = session.metadata?.type;

        if (clinicId && type === "premium") {
          await prisma.clinicProfile.update({
            where: { id: clinicId },
            data: { premiumTier: true },
          });
          console.log(`Premium activated for clinic ${clinicId}`);
        }

        if (clinicId && type === "posting") {
          console.log(`Posting payment received for clinic ${clinicId}`);
          // Posting is already created — payment just confirms it
        }
        break;
      }

      case "customer.subscription.deleted": {
        // Premium subscription cancelled
        const subscription = event.data.object as Stripe.Subscription;
        const clinicId = subscription.metadata?.clinicId;
        if (clinicId) {
          await prisma.clinicProfile.update({
            where: { id: clinicId },
            data: { premiumTier: false },
          });
          console.log(`Premium deactivated for clinic ${clinicId}`);
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
