"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  ShieldCheck,
  Plus,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  X,
  Clock,
} from "lucide-react";
import {
  addCredential,
  deleteCredential,
  uploadCredentialFile,
} from "@/lib/db/credential-actions";

const CREDENTIAL_TYPES = [
  { value: "STATE_LICENSE", label: "State Dental License", roles: ["Hygienist", "Assistant", "Dentist"] },
  { value: "DEA_REGISTRATION", label: "DEA Registration", roles: ["Dentist"] },
  { value: "NPI_NUMBER", label: "NPI Number", roles: ["Dentist", "Hygienist"] },
  { value: "MALPRACTICE_INSURANCE", label: "Malpractice Insurance", roles: ["Dentist", "Hygienist"] },
  { value: "CPR_BLS", label: "CPR/BLS Certification", roles: ["Hygienist", "Assistant", "Dentist"] },
  { value: "LOCAL_ANESTHESIA", label: "Local Anesthesia Certification", roles: ["Hygienist"] },
  { value: "NITROUS_OXIDE", label: "Nitrous Oxide Certification", roles: ["Hygienist", "Dentist"] },
  { value: "RADIOLOGY", label: "Radiology Certification", roles: ["Hygienist", "Assistant"] },
  { value: "CDA_CERTIFICATION", label: "CDA Certification (DANB)", roles: ["Assistant"] },
  { value: "OSHA_HIPAA", label: "OSHA/HIPAA Training", roles: ["Hygienist", "Assistant", "Dentist"] },
  { value: "DENTAL_DEGREE", label: "Dental Degree (DDS/DMD)", roles: ["Dentist"] },
  { value: "SPECIALTY_CERT", label: "Specialty Certificate", roles: ["Dentist"] },
  { value: "BACKGROUND_CHECK", label: "Background Check", roles: ["Hygienist", "Assistant", "Dentist"] },
  { value: "OTHER", label: "Other", roles: ["Hygienist", "Assistant", "Dentist"] },
];

interface CredentialData {
  id: string;
  type: string;
  name: string;
  number: string | null;
  issuedBy: string | null;
  fileUrl: string | null;
  fileName: string | null;
  expiresAt: Date | null;
  verified: boolean;
}

function daysUntilExpiry(date: Date | null): number | null {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function ExpiryBadge({ expiresAt }: { expiresAt: Date | null }) {
  const days = daysUntilExpiry(expiresAt);
  if (days === null) return null;
  if (days < 0) return <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="h-2.5 w-2.5 mr-0.5" />Expired</Badge>;
  if (days <= 30) return <Badge variant="destructive" className="text-[10px]"><Clock className="h-2.5 w-2.5 mr-0.5" />Expires in {days}d</Badge>;
  if (days <= 90) return <Badge variant="outline" className="text-[10px] text-amber-600"><Clock className="h-2.5 w-2.5 mr-0.5" />{days}d left</Badge>;
  return <Badge variant="outline" className="text-[10px] text-green-600"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Valid</Badge>;
}

export function CredentialVault({
  credentials,
  workerId,
  specialty,
  onRefresh,
}: {
  credentials: CredentialData[];
  workerId: string;
  specialty: string;
  onRefresh?: () => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState("");
  const [addName, setAddName] = useState("");
  const [addNumber, setAddNumber] = useState("");
  const [addIssuedBy, setAddIssuedBy] = useState("");
  const [addExpires, setAddExpires] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const relevantTypes = CREDENTIAL_TYPES.filter((t) => t.roles.includes(specialty));
  const existingTypes = new Set(credentials.map((c) => c.type));
  const missingRequired = relevantTypes
    .filter((t) => !existingTypes.has(t.value) && t.value !== "OTHER" && t.value !== "SPECIALTY_CERT")
    .slice(0, 3);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addType) { setError("Please select a credential type."); return; }
    setSaving(true);
    setError("");
    try {
      await addCredential({
        workerId,
        type: addType,
        name: addName || CREDENTIAL_TYPES.find((t) => t.value === addType)?.label || addType,
        number: addNumber,
        issuedBy: addIssuedBy,
        expiresAt: addExpires,
      });
      setShowAdd(false);
      setAddType(""); setAddName(""); setAddNumber(""); setAddIssuedBy(""); setAddExpires("");
      onRefresh?.();
    } catch {
      setError("Failed to add credential.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(credId: string, file: File) {
    setUploadingId(credId);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await uploadCredentialFile(credId, workerId, formData);
      onRefresh?.();
    } catch {
      // Silent fail — could add error UI
    } finally {
      setUploadingId(null);
    }
  }

  async function handleDelete(credId: string) {
    await deleteCredential(credId, workerId);
    onRefresh?.();
  }

  const expiringSoon = credentials.filter((c) => {
    const days = daysUntilExpiry(c.expiresAt);
    return days !== null && days <= 30;
  });

  return (
    <div className="space-y-4">
      {/* Alerts for expiring credentials */}
      {expiringSoon.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Credentials Expiring Soon</p>
                <ul className="mt-1 space-y-0.5">
                  {expiringSoon.map((c) => (
                    <li key={c.id} className="text-xs text-muted-foreground">
                      {c.name} — {daysUntilExpiry(c.expiresAt)! < 0 ? "expired" : `expires in ${daysUntilExpiry(c.expiresAt)} days`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missing credentials suggestion */}
      {missingRequired.length > 0 && (
        <div className="rounded-lg bg-muted/50 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Suggested:</span> Add your{" "}
            {missingRequired.map((t) => t.label).join(", ")} to make your profile stand out.
          </p>
        </div>
      )}

      {/* Add credential form */}
      {showAdd ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Add Credential</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAdd(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-3">
              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
              )}
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={addType} onValueChange={(v) => {
                  if (v) {
                    setAddType(v);
                    setAddName(CREDENTIAL_TYPES.find((t) => t.value === v)?.label || "");
                  }
                }}>
                  <SelectTrigger><SelectValue placeholder="Select credential type..." /></SelectTrigger>
                  <SelectContent>
                    {relevantTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g., Idaho RDH License" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>License/Cert Number</Label>
                  <Input value={addNumber} onChange={(e) => setAddNumber(e.target.value)} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label>Issued By</Label>
                  <Input value={addIssuedBy} onChange={(e) => setAddIssuedBy(e.target.value)} placeholder="e.g., Idaho Board" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Expiration Date</Label>
                <Input type="date" value={addExpires} onChange={(e) => setAddExpires(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Adding..." : "Add Credential"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Credential
        </Button>
      )}

      {/* Credential list */}
      {credentials.length === 0 && !showAdd && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">No Credentials Yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add your licenses, certifications, and insurance to build trust with clinics.
            </p>
          </CardContent>
        </Card>
      )}

      {credentials.map((cred) => (
        <Card key={cred.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{cred.name}</p>
                  {cred.verified && (
                    <Badge variant="default" className="text-[10px]">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Verified
                    </Badge>
                  )}
                  <ExpiryBadge expiresAt={cred.expiresAt} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {cred.number && <span>#{cred.number}</span>}
                  {cred.issuedBy && <span>Issued by: {cred.issuedBy}</span>}
                  {cred.expiresAt && (
                    <span>Expires: {new Date(cred.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  )}
                </div>

                {/* File upload/display */}
                <div className="mt-2">
                  {cred.fileUrl ? (
                    <div className="flex items-center gap-2 text-xs">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      <span className="text-muted-foreground truncate">{cred.fileName || "Document uploaded"}</span>
                      <label className="cursor-pointer text-primary hover:underline">
                        Replace
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileUpload(cred.id, f);
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-primary hover:underline">
                      <Upload className="h-3 w-3" />
                      {uploadingId === cred.id ? "Uploading..." : "Upload document (PDF, JPG, PNG)"}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        disabled={uploadingId === cred.id}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFileUpload(cred.id, f);
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(cred.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
