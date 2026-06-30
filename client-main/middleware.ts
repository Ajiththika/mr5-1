import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

    const isPublicPath = PUBLIC_PATHS.some((path) => {
        if (path === "/") return pathname === "/";
        return pathname.startsWith(path);
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
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (token && (pathname === "/login" || pathname === "/register")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (
        token &&
        isConsentProtectedPath(pathname) &&
        pathname !== "/legal/accept" &&
        !request.cookies.get("mr5_consent_ok")?.value
    ) {
        const acceptUrl = new URL("/legal/accept", request.url);
        acceptUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(acceptUrl);
    }

    const isDevOnlyPath =
        pathname.startsWith("/nebula") || pathname.startsWith("/demo");

    if (isDevOnlyPath && process.env.NODE_ENV === "production") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
