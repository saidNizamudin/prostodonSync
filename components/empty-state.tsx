import { type LucideIcon, PlusCircle } from "lucide-react";
import { Button } from "@/components/button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaIcon?: LucideIcon;
  onCtaClick?: () => void;
}

export default function EmptyState({
  icon: Icon = PlusCircle,
  title,
  description,
  ctaLabel,
  ctaIcon: CtaIcon = PlusCircle,
  onCtaClick,
}: EmptyStateProps) {
  const showCta = Boolean(ctaLabel && onCtaClick);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-600 bg-white py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full border border-dashed border-gray-600 text-black">
        <Icon className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      {showCta && (
        <Button
          variant="outline"
          size="lg"
          className="gap-1.5"
          onClick={onCtaClick}
        >
          <CtaIcon className="size-4" />
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
