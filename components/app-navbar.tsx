"use client";

import Link from "next/link";
import { AdminNavLinks } from "@/components/admin-nav-links";

export default function AppNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-md sm:px-6">
      <Link href="/" className="text-lg font-semibold text-gray-900">
        FKG Schedule Race
      </Link>
      <div className="flex items-center gap-4 sm:gap-6">
        <Link href="/" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
          Home
        </Link>
        <AdminNavLinks />
      </div>
    </nav>
  );
}
