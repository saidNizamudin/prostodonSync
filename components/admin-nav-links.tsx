"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ADMIN_VERIFIED_EVENT,
  readAdminVerifiedFromStorage,
} from "@/lib/admin-auth";

const navLinkClass =
  "text-sm font-medium text-gray-600 transition-colors hover:text-gray-900";

type AdminNavLinksProps = {
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
};

export function AdminNavLinks({
  className,
  linkClassName = navLinkClass,
  onNavigate,
}: AdminNavLinksProps = {}) {
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

  const linkProps = onNavigate ? { onClick: onNavigate } : undefined;

  return (
    <div className={className}>
      {isVerified ? (
        <>
          <Link href="/admin/schedule" className={linkClassName} {...linkProps}>
            Manage Schedule
          </Link>
          <Link href="/admin/instructor" className={linkClassName} {...linkProps}>
            Manage Instructor
          </Link>
        </>
      ) : (
        <Link href="/admin" className={linkClassName} {...linkProps}>
          Admin
        </Link>
      )}
    </div>
  );
}
