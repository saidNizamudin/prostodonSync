"use client";

import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetClose, SheetContent } from "@/components/sheet";
import { PopoverPortalProvider } from "@/components/popover";
import {
  PanelBody,
  PanelFooter,
  PanelForm,
  PanelHeader,
} from "@/components/panel-chrome";

interface FormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function FormDrawer({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  className,
}: FormDrawerProps) {
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const side = isMobile ? "bottom" : "right";
  const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        ref={setContentNode}
        side={side}
        hideClose
        className={cn(
          "flex flex-col gap-0 p-0",
          side === "bottom" ? "h-auto" : "h-full",
          className,
        )}
      >
        <PopoverPortalProvider container={contentNode}>
          <PanelHeader
            title={title}
            description={description}
            closeButton={
              <SheetClose className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </SheetClose>
            }
          />
          <PanelBody>
            <PanelForm>{children}</PanelForm>
          </PanelBody>
          {footer ? <PanelFooter>{footer}</PanelFooter> : null}
        </PopoverPortalProvider>
      </SheetContent>
    </Sheet>
  );
}
