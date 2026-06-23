"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { powerAdminService } from "@/services/power-admin.service";
import { ROLE_LABELS } from "@/lib/power-admin/permissions";
import { Shield } from "lucide-react";
import { toast } from "sonner";

export default function RolesPage() {
  const [data, setData] = useState<any>(null);

  const load = async () => {
    try {
      const res = await powerAdminService.getRoles();
      setData(res);
    } catch {
      toast.error("Failed to load roles");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const assign = async (userId: string, adminRole: string) => {
    try {
      await powerAdminService.assignRole(userId, adminRole);
      toast.success("Role updated");
      load();
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Roles & Permissions"
        description="Control who can manage teachers, courses, classrooms, and approvals."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-primary" />
              Hub Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(data?.roles || []).map((role: any) => (
              <div key={role.id} className="rounded-lg border border-border/60 p-3">
                <p className="font-medium">{role.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {role.permissions.length} permissions
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Hub Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.adminUsers || []).map((u: any) => (
                  <TableRow key={u._id}>
                    <TableCell>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.adminRole || "super_admin"}
                        onValueChange={(v) => assign(u._id, v)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_LABELS).map(([id, label]) => (
                            <SelectItem key={id} value={id}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
