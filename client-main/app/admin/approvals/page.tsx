"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/power-admin/EmptyState";
import { StatusBadge } from "@/components/power-admin/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { powerAdminService } from "@/services/power-admin.service";
import type { ContentApprovalItem } from "@/lib/power-admin/types";
import { CheckCircle2, XCircle, Upload } from "lucide-react";
import { toast } from "sonner";

export default function ApprovalsPage() {
  const [items, setItems] = useState<ContentApprovalItem[]>([]);
  const [status, setStatus] = useState("pending_review");

  const load = async () => {
    try {
      const res = await powerAdminService.getApprovals({ status });
      setItems(res.data);
    } catch {
      toast.error("Failed to load approvals");
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const approve = async (id: string) => {
    try {
      await powerAdminService.approveContent(id);
      toast.success("Approved");
      load();
    } catch {
      toast.error("Approve failed");
    }
  };

  const reject = async (id: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    try {
      await powerAdminService.rejectContent(id, reason);
      toast.success("Rejected");
      load();
    } catch {
      toast.error("Reject failed");
    }
  };

  const publish = async (id: string) => {
    try {
      await powerAdminService.publishContent(id);
      toast.success("Published");
      load();
    } catch {
      toast.error("Publish failed");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Approval Queue"
        description="Review lessons and courses before they go live. Human approval required."
        actions={
          <div className="flex gap-2">
            {["pending_review", "approved", "published", "rejected", "all"].map((s) => (
              <Button
                key={s}
                size="sm"
                variant={status === s ? "default" : "outline"}
                onClick={() => setStatus(s)}
                className="capitalize"
              >
                {s.replace(/_/g, " ")}
              </Button>
            ))}
          </div>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Queue is clear"
          description="No content waiting for review. Submit drafts from the Course Factory."
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="capitalize">{item.contentType}</TableCell>
                  <TableCell>{item.submittedBy?.name || "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {item.status === "pending_review" && (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => approve(item.id)} title="Approve">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => reject(item.id)} title="Reject">
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      {item.status === "approved" && (
                        <Button size="icon" variant="ghost" onClick={() => publish(item.id)} title="Publish">
                          <Upload className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
