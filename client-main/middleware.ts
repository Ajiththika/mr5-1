import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isLocaleCode, stripLocalePrefix } from "@/lib/i18n/config";

const PUBLIC_PATHS = [
    "/login",
    "/register",
    "/",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/refresh",
    "/about",
    "/contact",
    "/courses",
    "/course",
    "/shop",
    "/pricing",
    "/instructors",
    "/terms",
    "/privacy",
    "/accessibility",
    "/ai-assistant",
    "/offline",
    "/sitemap.xml",
    "/robots.txt",
    "/legal/accept",
    "/u",
    "/certificate",
];

const CONSENT_PROTECTED_PREFIXES = [
    "/dashboard",
    "/profile",
    "/student",
    "/admin",
    "/onboarding",
    "/payment",
    "/avatar",
    "/avatar-shop",
    "/inventory",
    "/apps",
];

function isConsentProtectedPath(pathname: string) {
    if (CONSENT_PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
        return true;
    }
    return /\/course\/[^/]+\/room\//.test(pathname);
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const segments = pathname.split("/").filter(Boolean);
    const localeCandidate = segments[0];
    const hasLocalePrefix = Boolean(localeCandidate && isLocaleCode(localeCandidate));
    const effectivePathname = hasLocalePrefix ? stripLocalePrefix(pathname) : pathname;

    const isPublicPath = PUBLIC_PATHS.some((path) => {
        if (path === "/") return effectivePathname === "/";
        return effectivePathname.startsWith(path);
    });

    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/assets") ||
        pathname.startsWith("/images") ||
        pathname.startsWith("/favicon.ico") ||
        pathname.endsWith(".png") ||
        pathname.endsWith(".jpg") ||
        pathname.endsWith(".svg") ||
        pathname.endsWith(".ico") ||
        pathname.includes("manifest") ||
        pathname === "/sitemap.xml" ||
        pathname === "/robots.txt"
    ) {
        return NextResponse.next();
    }

    const token =
        request.cookies.get("access_token")?.value ||
        request.cookies.get("refresh_token")?.value;

    if (!token && !isPublicPath) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", effectivePathname);
        return NextResponse.redirect(loginUrl);
    }

    if (token && (effectivePathname === "/login" || effectivePathname === "/register")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (
        token &&
        isConsentProtectedPath(effectivePathname) &&
        effectivePathname !== "/legal/accept" &&
        !request.cookies.get("mr5_consent_ok")?.value
    ) {
        const acceptUrl = new URL("/legal/accept", request.url);
        acceptUrl.searchParams.set("redirect", effectivePathname);
        return NextResponse.redirect(acceptUrl);
    }

    const isDevOnlyPath =
        effectivePathname.startsWith("/nebula") || effectivePathname.startsWith("/demo");

    if (isDevOnlyPath && process.env.NODE_ENV === "production") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (hasLocalePrefix) {
        const response = NextResponse.rewrite(new URL(effectivePathname, request.url));
        response.cookies.set("mr5-locale", localeCandidate, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
            sameSite: "lax",
        });
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
