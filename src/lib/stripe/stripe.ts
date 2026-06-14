import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

export const PRICES = {
  POSTING: 3500, // $35.00 in cents
  PREMIUM_MONTHLY: 8900, // $89.00 in cents
};
