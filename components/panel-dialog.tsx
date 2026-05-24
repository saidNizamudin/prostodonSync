"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
} from "@/components/dialog";
import {
  PanelBody,
  PanelFooter,
  PanelForm,
  PanelHeader,
} from "@/components/panel-chrome";

interface PanelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function PanelDialog({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  className,
  contentClassName,
}: PanelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className={cn(
          "flex max-h-[min(90dvh,720px)] w-[min(100vw-2rem,48rem)] max-w-none translate-x-[-50%] translate-y-[-50%] flex-col gap-0 overflow-hidden p-0 sm:rounded-xl",
          className,
        )}
      >
        <PanelHeader
          title={title}
          description={description}
          closeButton={
            <DialogClose className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          }
        />
        <PanelBody className={contentClassName}>
          <PanelForm>{children}</PanelForm>
        </PanelBody>
        {footer ? <PanelFooter>{footer}</PanelFooter> : null}
      </DialogContent>
    </Dialog>
  );
}
