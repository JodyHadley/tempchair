"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CheckCircle2, X, Lock, CalendarDays } from "lucide-react";
import { updateJobPosting } from "@/lib/db/actions";

interface JobData {
  id: string;
  title: string;
  type: string;
  dates: string;
  startDate: Date;
  endDate: Date;
  hours: string;
  rate: string;
  description: string;
  status: string;
}

export function EditPositionForm({
  job,
  onClose,
  onSaved,
}: {
  job: JobData;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [hours, setHours] = useState(job.hours);
  const [rate, setRate] = useState(job.rate);
  const [description, setDescription] = useState(job.description);
  const [status, setStatus] = useState(job.status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const result = await updateJobPosting(job.id, {
        title: job.title,
        type: job.type as "Hygienist" | "Assistant" | "Dentist",
        startDate: new Date(job.startDate).toISOString().split("T")[0],
        endDate: new Date(job.endDate).toISOString().split("T")[0],
        hours,
        rate,
        description,
        status: status as "open" | "filled" | "completed" | "cancelled",
      });

      if (result.success) {
        setSaved(true);
        setTimeout(onSaved, 1200);
      }
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
          <h3 className="mt-3 text-base font-semibold">Position Updated!</h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Edit Position</CardTitle>
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

          {/* Locked fields — shown but not editable */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Lock className="h-3 w-3" />
              Fixed Details
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Title</p>
                <p className="text-sm font-medium">{job.title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Role Type</p>
                <p className="text-sm font-medium">{job.type}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  Dates
                </p>
                <p className="text-sm font-medium">{job.dates}</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Title, role, and dates can&apos;t be changed. Need different dates or role? Cancel this posting and create a new one.
            </p>
          </div>

          {/* Editable fields */}
          <div className="space-y-2">
            <Label htmlFor="editStatus">Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editHours">Hours</Label>
              <Input id="editHours" value={hours} onChange={(e) => setHours(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editRate">Pay Rate</Label>
              <Input id="editRate" value={rate} onChange={(e) => setRate(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editDescription">Description</Label>
            <Textarea id="editDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
