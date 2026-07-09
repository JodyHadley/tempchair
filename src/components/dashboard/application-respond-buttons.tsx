"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle } from "lucide-react";
import { respondToApplication } from "@/lib/db/actions";

export function ApplicationRespondButtons({
  applicationId,
  clinicId,
  workerName,
  jobTitle,
  jobDates,
  onDone,
  size = "sm",
  compact = false,
}: {
  applicationId: string;
  clinicId: string;
  workerName: string;
  jobTitle: string;
  jobDates: string;
  onDone?: () => void;
  size?: "sm" | "default";
  compact?: boolean;
}) {
  const [confirm, setConfirm] = useState<"accepted" | "rejected" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    if (!confirm) return;
    setLoading(true);
    setError("");
    try {
      const result = await respondToApplication({
        applicationId,
        clinicId,
        decision: confirm,
      });
      if (!result.success) {
        setError(result.error || "Something went wrong.");
        setLoading(false);
        return;
      }
      setConfirm(null);
      onDone?.();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className={`flex gap-2 ${compact ? "flex-wrap" : ""}`}>
        <Button
          size={size}
          variant="outline"
          disabled={loading}
          onClick={() => setConfirm("rejected")}
        >
          <XCircle className="h-3.5 w-3.5 mr-1" />
          Decline
        </Button>
        <Button size={size} disabled={loading} onClick={() => setConfirm("accepted")}>
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          Accept
        </Button>
      </div>

      <Dialog open={!!confirm} onOpenChange={(open) => !open && !loading && setConfirm(null)}>
        <DialogContent className="sm:max-w-md" showCloseButton={!loading}>
          <DialogHeader>
            <DialogTitle>
              {confirm === "accepted" ? "Accept applicant?" : "Decline applicant?"}
            </DialogTitle>
            <DialogDescription>
              {confirm === "accepted" ? (
                <>
                  Accept <strong>{workerName}</strong> for <strong>{jobTitle}</strong> ({jobDates})?
                  They will be notified by email.
                </>
              ) : (
                <>
                  Decline <strong>{workerName}</strong> for <strong>{jobTitle}</strong>? They will be
                  notified. This cannot be undone from their side.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => setConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant={confirm === "rejected" ? "destructive" : "default"}
              disabled={loading}
              onClick={handleConfirm}
            >
              {loading
                ? "Saving..."
                : confirm === "accepted"
                  ? "Yes, Accept"
                  : "Yes, Decline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
