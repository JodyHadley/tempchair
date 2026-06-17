"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { toggleClinicPremium } from "@/lib/db/admin-actions";

interface ClinicData {
  id: string;
  name: string;
  email: string;
  location: string;
  rating: number;
  reviewCount: number;
  premiumTier: boolean;
  premiumTrialEndsAt: Date | null;
  createdAt: Date;
}

export function AdminClinicList({ clinics }: { clinics: ClinicData[] }) {
  const [clinicList, setClinicList] = useState(clinics);
  const [toggling, setToggling] = useState<string | null>(null);

  async function handleTogglePremium(clinicId: string) {
    setToggling(clinicId);
    await toggleClinicPremium(clinicId);
    setClinicList((prev) =>
      prev.map((c) => (c.id === clinicId ? { ...c, premiumTier: !c.premiumTier } : c)),
    );
    setToggling(null);
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Active Clinics</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          {clinicList.map((c) => {
            const trialActive = c.premiumTrialEndsAt && new Date(c.premiumTrialEndsAt) > new Date();
            return (
              <div key={c.id} className="flex items-center justify-between rounded-lg border p-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{c.name}</p>
                    {c.premiumTier && (
                      <Badge variant="default" className="text-[9px]"><Crown className="h-2.5 w-2.5 mr-0.5" />Premium</Badge>
                    )}
                    {!c.premiumTier && trialActive && (
                      <Badge variant="outline" className="text-[9px]">Trial</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{c.location || "No location"} — {c.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</p>
                  <Button
                    size="sm"
                    variant={c.premiumTier ? "outline" : "default"}
                    className="text-[10px] h-7"
                    disabled={toggling === c.id}
                    onClick={() => handleTogglePremium(c.id)}
                  >
                    {toggling === c.id ? "..." : c.premiumTier ? "Remove Premium" : "Make Premium"}
                  </Button>
                </div>
              </div>
            );
          })}
          {clinicList.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No active clinics yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
