"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, FileText, ExternalLink } from "lucide-react";
import { verifyCredential } from "@/lib/db/admin-actions";

interface CredentialData {
  id: string;
  type: string;
  name: string;
  fileUrl: string | null;
  fileName: string | null;
  number: string | null;
  issuedBy: string | null;
  expiresAt: Date | null;
  verified: boolean;
  createdAt: Date;
  worker: {
    firstName: string;
    lastName: string;
    specialty: string;
    email: string;
  };
}

export function AdminCredentialList({ credentials }: { credentials: CredentialData[] }) {
  const [credList, setCredList] = useState(credentials);
  const [verifying, setVerifying] = useState<string | null>(null);

  async function handleVerify(credId: string) {
    setVerifying(credId);
    await verifyCredential(credId);
    setCredList((prev) =>
      prev.filter((c) => c.id !== credId),
    );
    setVerifying(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Pending Credential Verification
          {credList.length > 0 && (
            <Badge variant="destructive" className="text-[9px]">{credList.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {credList.map((cred) => (
            <div key={cred.id} className="flex items-center justify-between rounded-lg border p-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{cred.name}</p>
                  <Badge variant="outline" className="text-[9px]">{cred.type.replace(/_/g, " ")}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {cred.worker.firstName} {cred.worker.lastName} ({cred.worker.specialty})
                </p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  {cred.number && <span>#{cred.number}</span>}
                  {cred.issuedBy && <span>By: {cred.issuedBy}</span>}
                  {cred.expiresAt && <span>Exp: {new Date(cred.expiresAt).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {cred.fileUrl && (
                  <a
                    href={cred.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-0.5"
                  >
                    <FileText className="h-3 w-3" />
                    View
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
                <Button
                  size="sm"
                  className="text-[10px] h-7"
                  disabled={verifying === cred.id}
                  onClick={() => handleVerify(cred.id)}
                >
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {verifying === cred.id ? "..." : "Verify"}
                </Button>
              </div>
            </div>
          ))}
          {credList.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No credentials pending verification.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
