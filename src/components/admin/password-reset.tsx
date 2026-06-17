"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle2, AlertTriangle } from "lucide-react";
import { adminSendPasswordReset } from "@/lib/db/admin-actions";

export function AdminPasswordReset() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setResult(null);

    const res = await adminSendPasswordReset(email.trim());
    setResult(res);
    setSending(false);

    if (res.success) {
      setEmail("");
      setTimeout(() => setResult(null), 5000);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Send Password Reset
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSend} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="resetEmail">User Email</Label>
            <div className="flex gap-2">
              <Input
                id="resetEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
              <Button type="submit" size="sm" disabled={sending} className="shrink-0">
                {sending ? "Sending..." : "Send Reset"}
              </Button>
            </div>
          </div>
          {result?.success && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Password reset email sent successfully.
            </div>
          )}
          {result?.error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {result.error}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
