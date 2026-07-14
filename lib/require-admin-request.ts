import { ADMIN_VERIFIED_COOKIE } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export function isAdminRequest(req: NextRequest): boolean {
  return req.cookies.get(ADMIN_VERIFIED_COOKIE)?.value === "1";
}

export function unauthorizedAdminResponse() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}
