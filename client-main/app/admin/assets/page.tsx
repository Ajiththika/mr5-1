"use client";

export const dynamic = "force-dynamic";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GANESHA_CREDIT_MANDATORY } from "@/lib/3d/model-registry";
import { getAssetRegistry } from "@/lib/3d/model-registry";
import { resolveModelUrl } from "@/lib/3d/aws-assets";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Box, ExternalLink, Shield } from "lucide-react";

/**
 * Admin 3D Asset Manager — read-only registry view (MVP).
 * Upload/replace flows → AWS S3 + Power Admin in Phase 2.
 */
export default function AdminAssetsPage() {
  const registry = getAssetRegistry();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="3D Asset Manager"
        description="Licensed models, CDN paths, and attribution records for MR5 School."
      />

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" />
            License Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{GANESHA_CREDIT_MANDATORY}</p>
          <p>
            Attribution is shown on every page, in the 3D classroom loader, and on the About page.
            License files live in <code className="text-xs">/public/licenses/</code>.
          </p>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Path / CDN</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registry.assets.map((asset) => {
              const resolvedUrl = asset.cdnPathEnv
                ? resolveModelUrl(
                    asset.localPath,
                    asset.cdnPathEnv as "NEXT_PUBLIC_CDN_GANESHA_MODEL",
                  )
                : asset.localPath;

              return (
                <TableRow key={asset.id}>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <Box className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">{asset.author}</p>
                        {asset.attributionRequired && (
                          <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                            Attribution required
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline">{asset.license}</Badge>
                      {asset.licenseFile && (
                        <Link
                          href={asset.licenseFile}
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                          target="_blank"
                        >
                          License file <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate font-mono text-xs">{resolvedUrl}</p>
                    <p className="text-xs text-muted-foreground">
                      ~{asset.estimatedSizeMb}MB · {asset.format}
                      {asset.lazyLoad ? " · lazy" : ""}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge>{asset.status}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
