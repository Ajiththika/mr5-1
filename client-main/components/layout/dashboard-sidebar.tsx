"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationItem,
  NavigationSection,
  LegacyNavigationItem,
} from "@/data/navigation";

interface DashboardSidebarProps {
  navigation: NavigationItem[] | NavigationSection[] | LegacyNavigationItem[];
  className?: string;
  variant?: "grouped" | "flat";
  onNavigate?: () => void;
}

function isFlatNavigation(
  navigation: NavigationItem[] | NavigationSection[] | LegacyNavigationItem[],
): navigation is NavigationItem[] {
  if (!navigation.length) return false;
  const first = navigation[0];
  return "href" in first && typeof first.href === "string" && !("items" in first);
}

function isSectionNavigation(
  navigation: NavigationItem[] | NavigationSection[] | LegacyNavigationItem[],
): navigation is NavigationSection[] {
  if (!navigation.length) return false;
  return "items" in navigation[0] && Array.isArray((navigation[0] as NavigationSection).items);
}

export function isNavActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  if (href === "/student/portal") {
    return pathname === "/student/portal" || pathname === "/student";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function findActiveSection(
  sections: NavigationSection[],
  pathname: string,
): string | null {
  for (const section of sections) {
    if (section.items.some((item) => isNavActive(pathname, item.href))) {
      return section.title;
    }
  }
  return null;
}

export function DashboardSidebar({
  navigation,
  className,
  variant = "grouped",
  onNavigate,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  if (variant === "flat" && isFlatNavigation(navigation)) {
    return (
      <nav className={cn("w-full", className)} aria-label="Dashboard">
        <div className="space-y-1 px-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(pathname, item.href);

            return (
              <Button
                key={item.href}
                variant={active ? "secondary" : "ghost"}
                className={cn(
                  "h-10 w-full justify-start rounded-lg px-3 font-medium",
                  active && "bg-primary/15 text-primary hover:bg-primary/20",
                )}
                asChild
              >
                <Link href={item.href} onClick={onNavigate}>
                  {Icon && <Icon className="mr-3 h-4 w-4 shrink-0" />}
                  <span>{item.title}</span>
                  {item.label && (
                    <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {item.label}
                    </span>
                  )}
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>
    );
  }

  if (isSectionNavigation(navigation)) {
    const activeSection = findActiveSection(navigation, pathname);

    return (
      <nav className={cn("w-full", className)} aria-label="Admin navigation">
        <div className="space-y-6 px-1">
          {navigation.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isNavActive(pathname, item.href);

                  return (
                    <Button
                      key={item.href}
                      variant={active ? "secondary" : "ghost"}
                      className={cn(
                        "h-9 w-full justify-start rounded-lg px-3 text-sm font-medium",
                        active &&
                          "bg-primary/15 text-primary shadow-sm hover:bg-primary/20",
                        !active && "text-muted-foreground hover:text-foreground",
                        activeSection === section.title &&
                          !active &&
                          "hover:bg-muted/60",
                      )}
                      asChild
                    >
                      <Link href={item.href} onClick={onNavigate}>
                        {Icon && (
                          <Icon
                            className={cn(
                              "mr-3 h-4 w-4 shrink-0",
                              active ? "text-primary" : "opacity-70",
                            )}
                          />
                        )}
                        <span>{item.title}</span>
                        {item.label && (
                          <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
    );
  }

  return null;
}
