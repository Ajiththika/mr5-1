import type { Metadata } from "next";
import "./globals.css";
import { EnhancedUserProvider } from "@/contexts/EnhancedUserContext";
import "@/lib/suppress-auth-errors";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeColorProvider } from "@/contexts/ThemeColorContext";
import { UIPreferencesProvider } from "@/contexts/UIPreferencesContext";
import { RegionalSettingsProvider } from "@/contexts/RegionalSettingsContext";
import { DashboardContextProvider } from "@/contexts/DashboardContext";
import { Toaster } from "@/components/ui/sonner";
import { generateMetadata as genMeta, generateStructuredData } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AccessibilityPreferencesSync } from "@/components/accessibility/AccessibilityPreferencesSync";
import { ConsentFeaturesBootstrap } from "@/components/legal/ConsentFeaturesBootstrap";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AudioProvider } from "@/contexts/AudioContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeMetaSync } from "@/components/theme/ThemeMetaSync";
import type { ReactNode } from "react";
import { LicenseAttributionBar } from "@/components/legal/LicenseAttributionBar";
import { UniversalDeviceProvider } from "@/components/responsive/UniversalDeviceProvider";
import { ActiveTeacherProvider } from "@/contexts/ActiveTeacherContext";

export const metadata: Metadata = genMeta({
	title: "3D Virtual Classroom & AI Teachers",
	description:
		"Learn inside a live 3D virtual classroom with MR5 School. AI teachers remember your level, voice-enabled chat, immersive lessons, and personalized online education for students worldwide.",
	keywords: [
		"MR5 School",
		"3D virtual classroom",
		"AI teacher",
		"online learning platform",
		"immersive education",
		"interactive classroom",
		"personalized learning",
		"AI tutor",
		"virtual school",
		"student learning app",
		"360 classroom view",
		"voice enabled learning",
		"e-learning",
		"online courses",
	],
	url: "/",
	type: "website",
});

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	const organizationData = generateStructuredData("Organization");
	const websiteData = generateStructuredData("WebSite");
	const educationalData = generateStructuredData("EducationalOrganization");

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<StructuredData data={[organizationData, websiteData, educationalData]} />
				<link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || "https://mr5school.com"} />
				<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
				<meta name="theme-color" content="#18181b" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<link rel="manifest" href="/manifest.webmanifest" />
				<link rel="apple-touch-icon" href="/icon.png" />
				<meta name="apple-mobile-web-app-title" content="MR5 School" />
				<meta name="application-name" content="MR5 School" />
				<meta name="msapplication-TileColor" content="#18181b" />
				<meta name="msapplication-config" content="/browserconfig.xml" />
				<meta name="format-detection" content="telephone=no" />

				{/* 
					FIXED: Aggressive Kill Switch for Service Worker (fixing 503 errors).
					We place this in <head> to run as early as possible.
				*/}
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								if ('serviceWorker' in navigator) {
									navigator.serviceWorker.getRegistrations().then(function(registrations) {
										for (var i = 0; i < registrations.length; i++) {
											registrations[i].unregister();
										}
									});
								}
								if ('caches' in window) {
									caches.keys().then(function(names) {
										names.forEach(function(name) { caches.delete(name); });
									});
								}
							})();
						`,
					}}
				/>
			</head>
			<body className={`${inter.className} mr5-app-shell bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary`} suppressHydrationWarning>
				<a href="#main-content" className="skip-to-content">
					Skip to main content
				</a>
				<div className="noise-bg watch-hide" aria-hidden />

				<UniversalDeviceProvider>
				<LanguageProvider>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<ThemeColorProvider>
						<UIPreferencesProvider>
							<RegionalSettingsProvider>
								<ErrorBoundary>
									<EnhancedUserProvider>
										<ActiveTeacherProvider>
										<NotificationProvider>
										<ThemeMetaSync />
										<AccessibilityPreferencesSync />
										<ConsentFeaturesBootstrap />
										<DashboardContextProvider>
											<AudioProvider>
												{children}
												<LicenseAttributionBar />
												<Toaster />
												<PerformanceMonitor />
											</AudioProvider>
										</DashboardContextProvider>
										</NotificationProvider>
										</ActiveTeacherProvider>
									</EnhancedUserProvider>
								</ErrorBoundary>
							</RegionalSettingsProvider>
						</UIPreferencesProvider>
					</ThemeColorProvider>
				</ThemeProvider>
				</LanguageProvider>
				</UniversalDeviceProvider>
			</body>
		</html>
	);
}

