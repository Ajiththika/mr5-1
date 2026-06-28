import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Award, CheckCircle2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyCertificateServer } from "@/services/identity.service";

type PageProps = {
	params: Promise<{ certificateId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { certificateId } = await params;
	try {
		const cert = await verifyCertificateServer(certificateId);
		return {
			title: `${cert.title} | MR5 Certificate`,
			description: `Verify MR5 certificate ${cert.verificationId}.`,
		};
	} catch {
		return { title: "Certificate Verification | MR5" };
	}
}

export default async function CertificateVerificationPage({ params }: PageProps) {
	const { certificateId } = await params;

	try {
		const cert = await verifyCertificateServer(certificateId);

		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<main id="main-content">
			<div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-10 md:px-6">
				<Card className="w-full overflow-hidden border-primary/20 shadow-lg">
					<div className="bg-gradient-to-r from-primary/15 via-purple-500/10 to-blue-500/15 px-6 py-8">
						<div className="flex items-center gap-3">
							<div className="rounded-full bg-primary/15 p-3 text-primary">
								<ShieldCheck className="h-6 w-6" aria-hidden />
							</div>
							<div>
								<p className="text-sm font-medium uppercase tracking-wide text-primary">
									MR5 Certificate Verification
								</p>
								<h1 className="text-2xl font-bold">{cert.title}</h1>
							</div>
						</div>
					</div>

					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden />
							Verified credential
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-3 sm:grid-cols-2">
							<div className="rounded-lg border border-border p-4">
								<p className="text-xs uppercase tracking-wide text-muted-foreground">
									Verification ID
								</p>
								<p className="mt-1 font-mono text-sm">{cert.verificationId}</p>
							</div>
							<div className="rounded-lg border border-border p-4">
								<p className="text-xs uppercase tracking-wide text-muted-foreground">Issued</p>
								<p className="mt-1 text-sm">
									{new Date(cert.issuedAt).toLocaleDateString(undefined, {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</p>
							</div>
						</div>

						<div className="rounded-lg border border-border p-4">
							<p className="text-xs uppercase tracking-wide text-muted-foreground">Recipient</p>
							<p className="mt-1 text-lg font-semibold">{cert.recipient.name}</p>
							<div className="mt-2 flex flex-wrap items-center gap-2">
								<Badge variant="secondary">{cert.recipient.roleLabel}</Badge>
								<Badge variant="outline">{cert.recipient.uid}</Badge>
							</div>
							<Link
								href={cert.recipient.profileHref}
								className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
							>
								View public profile
							</Link>
						</div>

						<div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
							<Award className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
							<p>
								This page confirms the certificate exists in MR5 records. Email, phone, payment
								data, and internal database IDs are never shown on verification pages.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
				</main>
				<Footer />
			</div>
		);
	} catch {
		notFound();
	}
}
