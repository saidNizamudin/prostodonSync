"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ADMIN_VERIFIED_EVENT,
  readAdminVerifiedFromStorage,
} from "@/lib/admin-auth";

const navLinkClass =
  "text-sm font-medium text-gray-600 transition-colors hover:text-gray-900";

export function AdminNavLinks() {
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const syncVerified = () => {
      setIsVerified(readAdminVerifiedFromStorage());
    };

    syncVerified();
    window.addEventListener(ADMIN_VERIFIED_EVENT, syncVerified);
    window.addEventListener("storage", syncVerified);

    return () => {
      window.removeEventListener(ADMIN_VERIFIED_EVENT, syncVerified);
      window.removeEventListener("storage", syncVerified);
    };
  }, []);

  return isVerified ? (
    <>
      <Link href="/admin/schedule" className={navLinkClass}>
        Manage Schedule
      </Link>
      <Link href="/admin/instructor" className={navLinkClass}>
        Manage Instructor
      </Link>
    </>
  ) : (
    <Link href="/admin" className={navLinkClass}>
      Admin
    </Link>
  );
}
