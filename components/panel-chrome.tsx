"use client";

import { cn } from "@/lib/utils";
import { DialogDescription, DialogTitle } from "@/components/dialog";

interface PanelHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  closeButton?: React.ReactNode;
  className?: string;
}

export function PanelHeader({
  title,
  description,
  closeButton,
  className,
}: PanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <DialogTitle className="text-lg font-semibold leading-snug tracking-normal text-gray-900">
          {title}
        </DialogTitle>
        {description ? (
          <DialogDescription className="mt-0.5 text-sm text-gray-500">
            {description}
          </DialogDescription>
        ) : null}
      </div>
      {closeButton && (
        <div className="flex shrink-0 items-center">{closeButton}</div>
      )}
    </div>
  );
}

export function PanelBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto p-2", className)}>
      {children}
    </div>
  );
}

export function PanelForm({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-4", className)}>{children}</div>;
}

export function PanelFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-auto shrink-0 border-t border-gray-200 bg-white",
        className,
      )}
    >
      <div className="p-1">
        <PanelFooterActions>{children}</PanelFooterActions>
      </div>
    </div>
  );
}

export function PanelFooterActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        "[&>button]:h-10 [&>button]:w-full [&>button]:shrink-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
