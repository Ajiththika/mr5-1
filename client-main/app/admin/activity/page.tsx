"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ActivityFeed } from "@/components/power-admin/ActivityFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { powerAdminService } from "@/services/power-admin.service";
import type { ActivityLogItem } from "@/lib/power-admin/types";

export default function ActivityPage() {
  const [items, setItems] = useState<ActivityLogItem[]>([]);

  useEffect(() => {
    powerAdminService.getActivity(50).then(setItems);
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Activity Logs"
        description="Audit trail of admin actions across the learning platform."
      />
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed items={items} />
        </CardContent>
      </Card>
    </div>
  );
}
