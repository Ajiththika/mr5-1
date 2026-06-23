"use client";

export const dynamic = "force-dynamic";

import { PowerHubDashboard } from "@/components/power-admin/PowerHubDashboard";
import AdminApprovalsTable from "@/components/admin/approvals-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <PowerHubDashboard />
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Pending Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminApprovalsTable />
        </CardContent>
      </Card>
    </div>
  );
}
