import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function getSessionRole(request: NextRequest) {
  const hint = request.cookies.get("hyreme_session")?.value;
  return hint?.split(":")[0] ?? null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = getSessionRole(request);

  if (pathname.startsWith("/candidate")) {
    if (role !== "candidate") {
      return NextResponse.redirect(new URL("/login?role=candidate", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/recruiter") && pathname !== "/recruiter/login") {
    if (role !== "recruiter") {
      return NextResponse.redirect(new URL("/login?role=recruiter", request.url));
    }
    return NextResponse.next();
  }

  if ((pathname === "/login" || pathname === "/signup") && role === "candidate") {
    return NextResponse.redirect(new URL("/candidate", request.url));
  }

  if ((pathname === "/login" || pathname === "/signup") && role === "recruiter") {
    return NextResponse.redirect(new URL("/recruiter", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/candidate/:path*", "/recruiter/:path*", "/login", "/signup"],
};
