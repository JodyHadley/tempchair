"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, X, CheckCircle2, Lock, Globe } from "lucide-react";
import { updateReview } from "@/lib/db/actions";

interface EditReviewProps {
  reviewId: string;
  currentRating: number;
  currentComment: string;
  currentIsPrivate: boolean;
  canTogglePrivate: boolean;
  targetName: string;
  fromRole: "worker" | "clinic";
  onClose: () => void;
  onSaved: () => void;
}

export function ReviewEditForm({
  reviewId,
  currentRating,
  currentComment,
  currentIsPrivate,
  canTogglePrivate,
  targetName,
  fromRole,
  onClose,
  onSaved,
}: EditReviewProps) {
  const [rating, setRating] = useState(currentRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(currentComment);
  const [isPrivate, setIsPrivate] = useState(currentIsPrivate);
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
      await updateReview(reviewId, {
        rating,
        comment: comment.trim(),
        isPrivate,
      });
      setSaved(true);
      setTimeout(onSaved, 1200);
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
          <h3 className="mt-3 text-base font-semibold">Review Updated!</h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Edit Review for {targetName}</CardTitle>
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
                    className={`h-6 w-6 ${
                      star <= (hoveredRating || rating)
                        ? "fill-primary text-primary"
                        : "text-muted"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 self-center text-sm text-muted-foreground">{rating}/5</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editComment">Comment</Label>
            <Textarea
              id="editComment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          {canTogglePrivate && (
            <div className="space-y-2">
              <Label>Visibility</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={`flex-1 flex items-center gap-2 rounded-lg border p-2.5 text-xs transition-colors ${
                    !isPrivate ? "border-primary bg-primary/5" : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span className="font-medium">Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={`flex-1 flex items-center gap-2 rounded-lg border p-2.5 text-xs transition-colors ${
                    isPrivate ? "border-primary bg-primary/5" : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span className="font-medium">Private</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
