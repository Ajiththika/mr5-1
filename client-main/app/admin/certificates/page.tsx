"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { certificateService, CertificateRequest, CertificateStats } from "@/services/certificate.service";
import { CheckCircle2, XCircle, Award, Globe, Clock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AdminCertificatesPage() {
  const [items, setItems] = useState<CertificateRequest[]>([]);
  const [stats, setStats] = useState<CertificateStats | null>(null);
  const [status, setStatus] = useState("pending_admin");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        certificateService.getPendingCertificates({ status }),
        certificateService.getCertificateStats()
      ]);
      setItems(res.certificates || []);
      setStats(statsRes);
    } catch {
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const approve = async (id: string) => {
    try {
      await certificateService.adminApprove(id);
      toast.success("Certificate issued successfully");
      loadData();
    } catch {
      toast.error("Approve failed");
    }
  };

  const reject = async (id: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    try {
      await certificateService.rejectCertificate(id, reason);
      toast.success("Certificate rejected");
      loadData();
    } catch {
      toast.error("Reject failed");
    }
  };

  const formatStatus = (s: string) => {
    switch (s) {
      case "pending_admin": return "Pending";
      case "pending_instructor": return "Needs Instructor";
      case "issued": return "Issued";
      case "rejected": return "Rejected";
      case "revoked": return "Revoked";
      default: return s;
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Certificate Administration"
        description="Review and officially issue academic certificates to students."
      />

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issued</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.issued}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Admin Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Global Reach</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byCountry?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Countries issued to</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {["pending_admin", "pending_instructor", "issued", "rejected"].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "default" : "outline"}
            onClick={() => setStatus(s)}
          >
            {formatStatus(s)}
          </Button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Queue is clear"
          description={`No certificates found for status: ${formatStatus(status)}.`}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Score & Grade</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const studentName = typeof item.student === 'object' ? item.student.name : item.studentName;
                const studentCountry = typeof item.student === 'object' ? item.student.country : item.country;
                const courseTitle = typeof item.course === 'object' ? item.course.title : item.courseName;

                return (
                <TableRow key={item.certificateId || item._id}>
                  <TableCell>
                    <div className="font-medium">{studentName}</div>
                    <div className="text-xs text-muted-foreground font-mono">{item.certificationId}</div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={courseTitle}>
                    {courseTitle}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.grade}</div>
                    <div className="text-xs text-muted-foreground">{item.finalScore}%</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-mono uppercase">
                      {studentCountry || "GL"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {item.status === "pending_admin" && (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => approve(item.certificateId || item._id)} title="Approve & Issue">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => reject(item.certificateId || item._id)} title="Reject">
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
