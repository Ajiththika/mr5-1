"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/power-admin/EmptyState";
import { StatusBadge } from "@/components/power-admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { powerAdminService } from "@/services/power-admin.service";
import type { TeacherProfile } from "@/lib/power-admin/types";
import { Bot, Copy, Search, Sparkles, Archive } from "lucide-react";
import { toast } from "sonner";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await powerAdminService.getTeachers({ search: search || undefined });
      setTeachers(res.data);
    } catch {
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleClone = async (id: string) => {
    try {
      await powerAdminService.cloneTeacher(id);
      toast.success("Teacher cloned");
      load();
    } catch {
      toast.error("Clone failed");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await powerAdminService.archiveTeacher(id);
      toast.success("Teacher archived");
      load();
    } catch {
      toast.error("Archive failed");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Teacher Database"
        description="Manage 3D AI teachers, profiles, assignments, and studio settings."
        actions={
          <Button asChild>
            <Link href="/admin/teacher-studio">
              <Sparkles className="mr-2 h-4 w-4" />
              Open Studio
            </Link>
          </Button>
        }
      />

      <div className="mb-6 flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
        </div>
        <Button variant="outline" onClick={load}>
          Search
        </Button>
      </div>

      {!loading && teachers.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No teachers yet"
          description="Create teacher profiles from the Teacher Studio or approve AI-TEACHER registrations."
          action={
            <Button asChild>
              <Link href="/admin/teacher-studio">Go to Studio</Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div>
                      <Link
                        href={`/admin/teachers/${t.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {t.displayName || t.user?.name || "Unnamed"}
                      </Link>
                      <p className="text-xs text-muted-foreground">{t.user?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{t.specialization}</TableCell>
                  <TableCell>
                    <StatusBadge status={t.status || "active"} />
                  </TableCell>
                  <TableCell>{t.rating?.toFixed(1) ?? "0.0"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleClone(t.id)} title="Clone">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleArchive(t.id)} title="Archive">
                        <Archive className="h-4 w-4" />
                      </Button>
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
