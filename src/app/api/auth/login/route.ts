import { NextResponse } from "next/server";

import {
  SITE_ACCESS_COOKIE,
  SITE_ACCESS_MAX_AGE_SECONDS,
  getSitePassword,
  hashSitePassword,
  isValidAccessToken,
} from "@/lib/siteAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const configured = getSitePassword();
  if (!configured) {
    return NextResponse.json(
      { error: "Site password is not configured (SITE_PASSWORD)." },
      { status: 400 },
    );
  }

  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!password) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  const token = await hashSitePassword(password);
  if (!(await isValidAccessToken(token))) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SITE_ACCESS_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SITE_ACCESS_MAX_AGE_SECONDS,
  });
  return response;
}
