"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/power-admin/EmptyState";
import { StatusBadge } from "@/components/power-admin/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { ClassroomConfig } from "@/lib/power-admin/types";
import { Plus, School } from "lucide-react";
import { toast } from "sonner";

const MODES = [
  "normal",
  "demo",
  "discussion",
  "quiz",
  "exam",
  "revision",
  "live_interaction",
];

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<ClassroomConfig[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", theme: "modern", mode: "normal" });

  const load = async () => {
    try {
      const res = await powerAdminService.getClassrooms();
      setClassrooms(res.data);
    } catch {
      toast.error("Failed to load classrooms");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await powerAdminService.createClassroom(form);
      toast.success("Classroom created");
      setOpen(false);
      setForm({ name: "", description: "", theme: "modern", mode: "normal" });
      load();
    } catch {
      toast.error("Create failed");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Classroom Builder"
        description="Create immersive classrooms with themes, panels, and learning modes."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Classroom
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Classroom</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mode</Label>
                  <Select value={form.mode} onValueChange={(v) => setForm((f) => ({ ...f, mode: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODES.map((m) => (
                        <SelectItem key={m} value={m} className="capitalize">
                          {m.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={create}>
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {classrooms.length === 0 ? (
        <EmptyState
          icon={School}
          title="No classrooms configured"
          description="Build your first custom classroom and link it to a course and 3D teacher."
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Classroom</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classrooms.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.course?.title || "—"}</TableCell>
                  <TableCell>
                    {c.teacher?.displayName || c.teacher?.specialization || "—"}
                  </TableCell>
                  <TableCell className="capitalize">{c.mode?.replace(/_/g, " ")}</TableCell>
                  <TableCell>
                    <StatusBadge status={c.status || "draft"} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/classrooms/${c.id}`}>Configure</Link>
                    </Button>
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
