"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CheckCircle2, X, CalendarDays, Info } from "lucide-react";
import { createJobPosting } from "@/lib/db/actions";

export function PostPositionForm({
  clinicId,
  onClose,
  onPosted,
}: {
  clinicId: string;
  onClose: () => void;
  onPosted: () => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Hygienist");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hours, setHours] = useState("");
  const [rate, setRate] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Calculate days remaining
  function getDaysInfo() {
    if (!startDate || !endDate) return null;
    const end = new Date(endDate);
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    const expiresAt = end < thirtyDays ? end : thirtyDays;
    const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after start date.");
      return;
    }

    if (new Date(endDate) < new Date()) {
      setError("End date must be in the future.");
      return;
    }

    setSaving(true);
    try {
      const result = await createJobPosting({
        clinicId,
        title,
        type: type as "Hygienist" | "Assistant" | "Dentist",
        startDate,
        endDate,
        hours,
        rate,
        description,
      });

      if (result.success) {
        setSaved(true);
        setTimeout(onPosted, 1500);
      }
    } catch {
      setError("Failed to post position. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const daysLeft = getDaysInfo();

  if (saved) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
          <h3 className="mt-4 text-lg font-semibold">Position Posted!</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your position is now visible to dental professionals.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Post a Position</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Position Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Dental Hygienist, Dental Assistant"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Role Type</Label>
            <Select value={type} onValueChange={(v) => v && setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hygienist">Dental Hygienist</SelectItem>
                <SelectItem value="Assistant">Dental Assistant</SelectItem>
                <SelectItem value="Dentist">Dentist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          {daysLeft !== null && daysLeft > 0 && (
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              This posting will be active for {daysLeft} day{daysLeft !== 1 ? "s" : ""} (expires at end date or 30 days, whichever is first)
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g., 40 hrs/week, 24 hrs"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Pay Rate</Label>
              <Input
                id="rate"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="e.g., $45–55/hr"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the position, requirements, and what makes your clinic a great place to work..."
              required
            />
          </div>

          <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground flex items-start gap-2">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>Standard posting fee: $35. Payment integration coming soon — postings are currently free during our launch period.</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Posting..." : "Post Position"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
