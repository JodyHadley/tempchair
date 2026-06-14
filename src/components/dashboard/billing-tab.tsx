"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Receipt,
  Crown,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { getClinicBillingData, cancelPremiumSubscription } from "@/lib/stripe/actions";

type BillingData = Awaited<ReturnType<typeof getClinicBillingData>>;

export function BillingTab({
  clinicId,
  isPremium,
  isPaidPremium,
  trialDaysLeft,
}: {
  clinicId: string;
  isPremium: boolean;
  isPaidPremium: boolean;
  trialDaysLeft: number | null;
}) {
  const [billing, setBilling] = useState<BillingData>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getClinicBillingData(clinicId).then((data) => {
      setBilling(data);
      setLoading(false);
    });
  }, [clinicId]);

  async function handleCancelSubscription() {
    if (!confirm("Are you sure you want to cancel your Premium subscription? You'll keep access until the end of your billing period.")) return;
    setCancelling(true);
    await cancelPremiumSubscription(clinicId);
    // Refresh billing data
    const data = await getClinicBillingData(clinicId);
    setBilling(data);
    setCancelling(false);
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 rounded-lg bg-muted" />
        <div className="h-48 rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPaidPremium ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">Premium Plan</p>
                  <Badge variant="default" className="text-xs">Active</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">$89/month — unlimited postings, private reviews, market insights</p>
                {billing?.subscription && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {billing.subscription.cancelAtPeriodEnd
                      ? `Cancels on ${billing.subscription.currentPeriodEnd}`
                      : `Next billing: ${billing.subscription.currentPeriodEnd}`}
                  </p>
                )}
              </div>
              {billing?.subscription && !billing.subscription.cancelAtPeriodEnd && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel Plan"}
                </Button>
              )}
              {billing?.subscription?.cancelAtPeriodEnd && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Cancelling
                </Badge>
              )}
            </div>
          ) : trialDaysLeft && trialDaysLeft > 0 ? (
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">Premium Trial</p>
                <Badge variant="default" className="text-xs">{trialDaysLeft} days left</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                You have full premium access. Upgrade before your trial ends to keep all features.
              </p>
              <Button
                className="mt-3"
                size="sm"
                onClick={async () => {
                  const { createPremiumCheckout } = await import("@/lib/stripe/actions");
                  const result = await createPremiumCheckout(clinicId);
                  if (result.url) window.location.href = result.url;
                }}
              >
                Upgrade to Premium — $89/mo
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">Standard Plan</p>
                <Badge variant="secondary" className="text-xs">$35/posting</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Pay per posting. Upgrade to Premium for unlimited postings and exclusive features.
              </p>
              <Button
                className="mt-3"
                size="sm"
                onClick={async () => {
                  const { createPremiumCheckout } = await import("@/lib/stripe/actions");
                  const result = await createPremiumCheckout(clinicId);
                  if (result.url) window.location.href = result.url;
                }}
              >
                Upgrade to Premium — $89/mo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!billing?.payments.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">No payments yet.</p>
          ) : (
            <div className="space-y-2">
              {billing.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{payment.description}</p>
                      <p className="text-xs text-muted-foreground">{payment.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold">${(payment.amount / 100).toFixed(2)}</p>
                      {payment.status === "succeeded" ? (
                        <Badge variant="outline" className="text-[10px] text-green-600">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Paid
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-amber-600">
                          <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />{payment.status}
                        </Badge>
                      )}
                    </div>
                    {payment.receiptUrl && (
                      <a
                        href={payment.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-0.5"
                      >
                        Receipt
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
