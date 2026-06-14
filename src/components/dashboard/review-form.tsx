"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, X, CheckCircle2, Lock, Globe } from "lucide-react";
import { submitReview } from "@/lib/db/actions";

interface ReviewFormProps {
  // Who is writing the review
  fromWorkerId?: string;
  fromClinicId?: string;
  fromRole: "worker" | "clinic";
  fromName: string;
  // Who is being reviewed
  toWorkerId?: string;
  toClinicId?: string;
  toRole: "worker" | "clinic";
  toName: string;
  // Context
  jobId: string;
  jobTitle: string;
  // Can this user write private reviews?
  canWritePrivate: boolean;
  // Callbacks
  onClose: () => void;
  onSubmitted: () => void;
}

export function ReviewForm({
  fromWorkerId,
  fromClinicId,
  fromRole,
  fromName,
  toWorkerId,
  toClinicId,
  toRole,
  toName,
  jobId,
  jobTitle,
  canWritePrivate,
  onClose,
  onSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Please write at least a short comment (10+ characters).");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await submitReview({
        fromWorkerId,
        fromClinicId,
        fromRole,
        fromName,
        toWorkerId,
        toClinicId,
        toRole,
        rating,
        comment: comment.trim(),
        jobId,
        isPrivate,
      });
      setSaved(true);
      setTimeout(onSubmitted, 1500);
    } catch {
      setError("Failed to submit review. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
          <h3 className="mt-4 text-lg font-semibold">Review Submitted!</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your {isPrivate ? "private" : "public"} review of {toName} has been saved.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Review {toName}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          For: {jobTitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= (hoveredRating || rating)
                        ? "fill-primary text-primary"
                        : "text-muted"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 self-center text-sm text-muted-foreground">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder={
                isPrivate
                  ? "Be candid — this review is only visible to other " +
                    (fromRole === "clinic" ? "premium clinics" : "workers") +
                    "..."
                  : "Share your honest experience working with " + toName + "..."
              }
            />
          </div>

          {/* Privacy Toggle */}
          {canWritePrivate && (
            <div className="space-y-2">
              <Label>Visibility</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={`flex-1 flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                    !isPrivate
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  <div className="text-left">
                    <p className="font-medium">Public</p>
                    <p className="text-xs text-muted-foreground">Visible to everyone</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={`flex-1 flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                    isPrivate
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  <div className="text-left">
                    <p className="font-medium">Private</p>
                    <p className="text-xs text-muted-foreground">
                      {fromRole === "clinic"
                        ? "Only premium clinics can see"
                        : "Only other workers can see"}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function PrivateBadge() {
  return (
    <Badge variant="outline" className="text-[10px] gap-0.5">
      <Lock className="h-2.5 w-2.5" />
      Private
    </Badge>
  );
}
