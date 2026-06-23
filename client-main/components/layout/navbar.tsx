"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth/login-modal";
import { SignupModal } from "@/components/auth/signup-modal";
import Image from "next/image";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { RealTimeNotifications } from "@/components/notifications/RealTimeNotifications";
import { LogOut, Sparkles } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeCustomizer } from "@/components/theme-customizer";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";

export function Navbar() {
	const { user, logout } = useEnhancedUser();
	const { t } = useTranslation();
	const [showLogin, setShowLogin] = useState(false);
	const [showSignup, setShowSignup] = useState(false);

	return (
		<>
			<nav className="sticky top-0 z-50 border-b border-border bg-card/95 shadow-[0_1px_0_oklch(var(--border)),0_4px_16px_oklch(var(--shadow-color)/0.04)] backdrop-blur-md transition-all duration-300">
				<div className="container mx-auto px-4 py-3 flex items-center justify-between">
					{/* Logo with Animation */}
					<Link href="/" className="group relative ml-1 flex -translate-y-0.5 items-center gap-2.5">
						<div className="absolute -inset-2 rounded-xl bg-primary/15 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
						<div className="relative h-11 w-11 shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 sm:h-12 sm:w-12">
							<Image
								src="/assets/mr5-logo-neon.png"
								alt="MR5 School Logo"
								fill
								sizes="(max-width: 640px) 44px, 48px"
								className="object-contain drop-shadow-[0_0_12px_rgba(0,184,255,0.35)] dark:drop-shadow-[0_0_14px_rgba(0,184,255,0.5)]"
								priority
							/>
						</div>
						<div className="flex flex-col relative">
							<span className="text-xl font-bold text-foreground tracking-tight">
								MR5 School
							</span>
							<span className="text-[10px] text-muted-foreground/80 tracking-widest font-mono uppercase">
								{t("nav.tagline")}
							</span>
						</div>
					</Link>

					{/* Navigation Links */}
					<div className="hidden md:flex items-center gap-1 rounded-full border border-border bg-muted/80 p-1 shadow-inner">
						<Link
							href="/courses"
							className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-card hover:text-foreground hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							{t("nav.library")}
						</Link>
						<Link
							href="/pricing"
							className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-card hover:text-foreground hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							{t("nav.pricing")}
						</Link>
						<Link
							href="/about"
							className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-card hover:text-foreground hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							{t("nav.manifesto")}
						</Link>
						<Link
							href="/contact"
							className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-card hover:text-foreground hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							{t("nav.connect")}
						</Link>
						{user?.role === 'student' && (
							<Link
								href="/apps/avatar-creator"
								className="px-4 py-1.5 text-sm text-primary font-bold hover:text-primary-foreground hover:bg-primary rounded-full transition-all duration-300 flex items-center gap-1.5 group"
							>
								<Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
								{t("nav.avatarStudio")}
							</Link>
						)}
					</div>

					{/* Auth Buttons */}
					<div className="flex items-center gap-3">
						<div className="hidden sm:block">
							<LanguageSelector compact />
						</div>
						<ThemeCustomizer />
						<RealTimeNotifications />
						{user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="relative h-9 w-9 rounded-full ring-2 ring-border hover:ring-primary/50 transition-all duration-300 p-0 overflow-hidden"
									>
										<div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary/5 opacity-60" />
										<div className="flex h-full w-full items-center justify-center bg-muted/80 backdrop-blur-sm">
											<span className="text-sm font-bold text-primary">{user.name?.[0]?.toUpperCase() || "U"}</span>
										</div>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56 bg-popover/95 backdrop-blur-xl border border-border text-foreground" align="end" forceMount>
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium leading-none text-foreground">
												{user.name}
											</p>
											<p className="text-xs leading-none text-muted-foreground">
												{user.email}
											</p>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator className="bg-border" />
									<DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-foreground cursor-pointer">
										<Link href={`/${user.role}`}>{user.role}</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-foreground cursor-pointer">
										<Link href="/profile">{t("nav.profile")}</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator className="bg-border" />
									<DropdownMenuItem onClick={logout} className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer">
										<LogOut className="mr-2 h-4 w-4" />
										{t("nav.logout")}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									onClick={() => setShowLogin(true)}
									className="text-muted-foreground hover:text-foreground"
								>
									{t("nav.signIn")}
								</Button>
								<Button
									data-testid="nav-start-learning"
									onClick={() => setShowSignup(true)}
									size="lg"
									className="rounded-full border-2 border-primary/50 !bg-primary px-5 !text-white shadow-[0_4px_14px_oklch(var(--primary)/0.4)] transition-all duration-300 hover:!bg-primary/90 hover:!text-white hover:shadow-[0_6px_18px_oklch(var(--primary)/0.45)] active:scale-[0.98]"
								>
									{t("nav.startLearning")}
								</Button>
							</div>
						)}
					</div>

					{/* Mobile Menu */}
					<div className="md:hidden flex items-center ml-2">
						<Sheet>
							<SheetTrigger asChild>
								<Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
									<Menu className="w-6 h-6" />
								</Button>
							</SheetTrigger>
							<SheetContent side="right" className="bg-background/95 backdrop-blur-xl border-border w-[300px]">
								<SheetHeader>
									<SheetTitle className="text-left text-lg font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">{t("nav.menu")}</SheetTitle>
								</SheetHeader>
								<div className="flex flex-col gap-6 mt-10">
									<div className="sm:hidden px-2">
										<LanguageSelector />
									</div>
									<div className="flex flex-col gap-2">
										<h3 className="text-sm font-medium text-muted-foreground mb-2 px-2 uppercase tracking-wider">{t("nav.menu")}</h3>
										<Link
											href="/"
											className="px-4 py-3 text-lg font-medium hover:bg-muted rounded-lg transition-colors flex items-center justify-between group"
										>
											{t("nav.home")}
											<span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
										</Link>
										<Link
											href="/courses"
											className="px-4 py-3 text-lg font-medium hover:bg-muted rounded-lg transition-colors flex items-center justify-between group"
										>
											{t("nav.library")}
											<span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
										</Link>
										<Link
											href="/pricing"
											className="px-4 py-3 text-lg font-medium hover:bg-muted rounded-lg transition-colors flex items-center justify-between group"
										>
											{t("nav.pricing")}
											<span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
										</Link>
										<Link
											href="/about"
											className="px-4 py-3 text-lg font-medium hover:bg-muted rounded-lg transition-colors flex items-center justify-between group"
										>
											{t("nav.manifesto")}
											<span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
										</Link>
										<Link
											href="/contact"
											className="px-4 py-3 text-lg font-medium hover:bg-muted rounded-lg transition-colors flex items-center justify-between group"
										>
											{t("nav.connect")}
											<span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
										</Link>
										<Link
											href="/apps/avatar-creator"
											className="px-4 py-3 text-lg font-medium text-primary hover:bg-muted rounded-lg transition-colors flex items-center justify-between group"
										>
											{t("nav.avatarStudio")}
											<span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
										</Link>
									</div>

									{!user && (
										<div className="flex flex-col gap-3 mt-4 px-2">
											<Button onClick={() => setShowLogin(true)} variant="secondary" className="w-full justify-center">
												{t("nav.signIn")}
											</Button>
											<Button onClick={() => setShowSignup(true)} className="w-full justify-center rounded-full font-semibold !text-white">
												{t("nav.startLearning")}
											</Button>
										</div>
									)}
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</nav>

			<LoginModal _open={showLogin} onOpenChange={setShowLogin} />
			<SignupModal _open={showSignup} onOpenChange={setShowSignup} />
		</>
	);
}

