export const dynamic = "force-dynamic";

import { getAllTransactions } from "@/lib/db/admin-view-actions";
import { RevenueTable } from "@/components/admin/revenue-table";

export default async function AdminRevenuePage() {
  const transactions = await getAllTransactions();
  const total = transactions.filter((t) => t.status === "succeeded").reduce((s, t) => s + t.amount, 0);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Revenue</h1>
        <p className="text-lg font-bold text-primary">${(total / 100).toFixed(2)} total</p>
      </div>
      <RevenueTable transactions={transactions} />
    </div>
  );
}
