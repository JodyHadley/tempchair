"use client";

import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle2, AlertTriangle } from "lucide-react";
import { AdminDataTable } from "./admin-data-table";

type Transaction = {
  id: string;
  amount: number;
  description: string;
  status: string;
  date: string;
  dateFormatted: string;
  email: string;
  receiptUrl: string;
};

export function RevenueTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <AdminDataTable
      data={transactions}
      getKey={(t) => t.id}
      searchKeys={["description", "email"]}
      searchPlaceholder="Search by description or email..."
      filters={[
        {
          key: "status",
          label: "Status",
          options: [
            { value: "succeeded", label: "Succeeded" },
            { value: "pending", label: "Pending" },
            { value: "failed", label: "Failed" },
          ],
        },
      ]}
      columns={[
        {
          key: "dateFormatted",
          label: "Date",
          sortable: true,
          render: (t) => <span className="text-xs">{t.dateFormatted}</span>,
        },
        {
          key: "description",
          label: "Description",
          render: (t) => <span className="text-xs font-medium">{t.description}</span>,
        },
        {
          key: "email",
          label: "Customer",
          render: (t) => <span className="text-xs text-muted-foreground">{t.email || "—"}</span>,
        },
        {
          key: "amount",
          label: "Amount",
          sortable: true,
          render: (t) => <span className="text-sm font-bold">${(t.amount / 100).toFixed(2)}</span>,
        },
        {
          key: "status",
          label: "Status",
          sortable: true,
          render: (t) => (
            t.status === "succeeded" ? (
              <Badge variant="outline" className="text-[10px] text-green-600"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Paid</Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-amber-600"><AlertTriangle className="h-2.5 w-2.5 mr-0.5" />{t.status}</Badge>
            )
          ),
        },
      ]}
      actions={(t) => (
        t.receiptUrl ? (
          <a href={t.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-0.5">
            Receipt <ExternalLink className="h-2.5 w-2.5" />
          </a>
        ) : null
      )}
    />
  );
}
