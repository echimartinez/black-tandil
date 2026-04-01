import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    // NextAuth v5 usa __Secure- prefix en producción (https), sin prefix en dev (http)
    const token =
      (await getToken({
        req,
        secret: process.env.AUTH_SECRET,
        cookieName: "__Secure-authjs.session-token",
        salt: "__Secure-authjs.session-token",
      })) ??
      (await getToken({
        req,
        secret: process.env.AUTH_SECRET,
        cookieName: "authjs.session-token",
        salt: "authjs.session-token",
      }));

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};