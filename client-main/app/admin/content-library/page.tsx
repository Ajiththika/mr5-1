"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
import { Library } from "lucide-react";
import { toast } from "sonner";

export default function ContentLibraryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState<string | undefined>();

  const load = async () => {
    try {
      const res = await powerAdminService.getContentLibrary({ status, limit: 50 });
      setItems(res.data);
    } catch {
      toast.error("Failed to load content library");
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  return (
    <div>
      <AdminPageHeader
        title="Content Library"
        description="All courses and learning content across draft, review, and published states."
        actions={
          <div className="flex gap-2">
            {[undefined, "draft", "pending_review", "published"].map((s) => (
              <Button
                key={s || "all"}
                size="sm"
                variant={status === s ? "default" : "outline"}
                onClick={() => setStatus(s)}
                className="capitalize"
              >
                {s ? s.replace(/_/g, " ") : "All"}
              </Button>
            ))}
          </div>
        }
      />

      <div className="rounded-xl border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Library className="h-4 w-4 text-primary" />
                    <span className="font-medium">{c.title}</span>
                  </div>
                </TableCell>
                <TableCell>{c.category || "—"}</TableCell>
                <TableCell>{c.level || "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={c.publishStatus || "draft"} />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/course-factory/${c.id}`}>Open</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
