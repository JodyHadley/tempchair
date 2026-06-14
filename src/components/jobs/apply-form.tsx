"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  X,
  Building2,
  CalendarDays,
  Clock,
  MapPin,
} from "lucide-react";
import { applyToJob } from "@/lib/db/actions";

interface ApplyFormProps {
  jobId: string;
  jobTitle: string;
  clinicName: string;
  clinicLocation: string;
  dates: string;
  hours: string;
  rate: string;
  type: string;
  workerId: string;
  onClose: () => void;
  onApplied: () => void;
}

export function ApplyForm({
  jobId,
  jobTitle,
  clinicName,
  clinicLocation,
  dates,
  hours,
  rate,
  type,
  workerId,
  onClose,
  onApplied,
}: ApplyFormProps) {
  const [coverNote, setCoverNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (coverNote.trim().length < 10) {
      setError("Please write a short note about why you're a good fit (at least 10 characters).");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const result = await applyToJob({
        jobId,
        workerId,
        coverNote: coverNote.trim(),
      });

      if (!result.success) {
        setError(result.error || "Failed to submit application.");
        setSaving(false);
        return;
      }

      setSaved(true);
      setTimeout(onApplied, 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
          <h3 className="mt-4 text-lg font-semibold">Application Submitted!</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {clinicName} will review your application and get back to you.
            You can track your application status in your dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Apply for Position</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {/* Job summary */}
        <div className="rounded-lg bg-muted p-4 mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{jobTitle}</h3>
            <Badge variant="secondary">{type}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {clinicName}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {clinicLocation}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {dates}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {hours}
            </span>
          </div>
          <p className="mt-2 text-sm font-bold text-primary">{rate}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="coverNote">Why are you a good fit?</Label>
            <Textarea
              id="coverNote"
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              rows={4}
              placeholder="Tell the clinic about your relevant experience, availability, and why you'd be great for this position..."
            />
            <p className="text-[10px] text-muted-foreground">
              A good note helps you stand out. Mention relevant experience and your availability.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
