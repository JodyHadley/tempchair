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
import { CheckCircle2, X } from "lucide-react";
import { updateJobPosting } from "@/lib/db/actions";

interface JobData {
  id: string;
  title: string;
  type: string;
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
  const [title, setTitle] = useState(job.title);
  const [type, setType] = useState(job.type);
  const [startDate, setStartDate] = useState(new Date(job.startDate).toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date(job.endDate).toISOString().split("T")[0]);
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

    if (new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after start date.");
      return;
    }

    setSaving(true);
    try {
      const result = await updateJobPosting(job.id, {
        title,
        type: type as "Hygienist" | "Assistant" | "Dentist",
        startDate,
        endDate,
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

          <div className="space-y-2">
            <Label htmlFor="editTitle">Position Title</Label>
            <Input id="editTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editType">Role Type</Label>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editStartDate">Start Date</Label>
              <Input id="editStartDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEndDate">End Date</Label>
              <Input id="editEndDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
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
            <Textarea id="editDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />
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
