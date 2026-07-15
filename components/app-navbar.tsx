"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AdminNavLinks } from "@/components/admin-nav-links";
import { Button } from "@/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/sheet";

const desktopLinkClass =
  "text-sm font-medium text-gray-600 transition-colors hover:text-gray-900";

const mobileLinkClass =
  "block rounded-lg px-3 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-100";

export default function AppNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-md sm:px-6">
      <Link
        href="/"
        className="min-w-0 truncate text-base font-semibold text-gray-900 sm:text-lg"
      >
        FKG Schedule Race
      </Link>

      <div className="hidden items-center gap-4 md:flex md:gap-6">
        <Link href="/" className={desktopLinkClass}>
          Home
        </Link>
        <AdminNavLinks className="flex items-center gap-4 md:gap-6" />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          hideClose
          className="flex w-[min(100vw,20rem)] flex-col gap-0 p-0 sm:max-w-xs"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
            <SheetTitle className="text-base font-semibold text-gray-900">
              Menu
            </SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close menu">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
          <nav className="flex flex-col gap-1 p-3">
            <Link
              href="/"
              className={mobileLinkClass}
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <AdminNavLinks
              className="flex flex-col gap-1"
              linkClassName={mobileLinkClass}
              onNavigate={closeMobileMenu}
            />
          </nav>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
