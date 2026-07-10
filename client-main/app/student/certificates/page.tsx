"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { certificateService, CertificateRequest } from "@/services/certificate.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Award, CheckCircle2, Clock, Download, ExternalLink, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificateService
      .getMyCertificates()
      .then((response) => setCertificates(response.certificates || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "issued":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Issued</Badge>;
      case "pending_instructor":
      case "pending_admin":
        return <Badge variant="secondary" className="text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> Pending Approval</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20"><ShieldAlert className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status.replace("_", " ")}</Badge>;
    }
  };

  return (
    <>
      <StudentPageHeader
        title="My Certificates"
        description="View and manage your academic achievements and earned certificates."
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {certificates.map((cert, index) => {
            const courseTitle = typeof cert.course === 'object' ? cert.course.title : cert.courseName;
            
            return (
            <motion.div
              key={cert.certificateId || cert._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Card className="h-full flex flex-col border-border/50 hover:border-primary/50 transition-colors overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-primary/10 via-muted to-background relative flex items-center justify-center border-b border-border/50">
                  <Award className="w-16 h-16 text-primary/40" />
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(cert.status)}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg leading-tight">
                    {cert.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-1">
                    {courseTitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Date</p>
                      <p className="font-medium mt-0.5">
                        {new Date(cert.completionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Grade</p>
                      <p className="font-medium mt-0.5">{cert.grade}</p>
                    </div>
                    {cert.certificateId && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground text-xs uppercase tracking-wider">Certificate ID</p>
                        <p className="font-mono text-xs mt-0.5 opacity-80">{cert.certificateId}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 flex justify-between gap-2 border-t border-border/50 py-3">
                  {cert.status === "issued" ? (
                    <>
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/certificate/${cert.certificateId || cert.verificationHash}`} target="_blank">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Verify
                        </Link>
                      </Button>
                      <Button size="sm" asChild className="flex-1">
                        <Link href={certificateService.getDownloadUrl(cert.certificateId || cert._id)} target="_blank" download>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <Button variant="secondary" size="sm" className="w-full" disabled>
                      <Clock className="w-4 h-4 mr-2" />
                      Awaiting Approval
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          )})}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <Award className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">No certificates yet</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
            Complete your enrolled courses and meet the graduation requirements to earn your first certificate.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/student/courses">Go to My Courses</Link>
          </Button>
        </div>
      )}
    </>
  );
}
