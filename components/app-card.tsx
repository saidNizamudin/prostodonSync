import { cn } from "@/lib/utils";
import Ribbon, { type RibbonVariant } from "@/components/ribbon";
import { Card, CardActions, CardContent, CardFooter } from "@/components/card";

export interface AppCardProps {
  ribbonLabel?: string;
  ribbonVariant?: RibbonVariant;
  title?: string;
  subtitle?: string;
  description?: string;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  error?: string;
  className?: string;
  contentClassName?: string;
  actionsClassName?: string;
  onClick?: () => void;
}

export function CategorySlotMeta({
  slotLeft,
  slot,
}: {
  slotLeft: number;
  slot: number;
}) {
  if (slotLeft > 0) {
    return (
      <p className="text-xs text-gray-700 font-medium">
        {slotLeft}/{slot} slots left
      </p>
    );
  }

  return (
    <p className=" text-xs font-medium text-destructive">
      Full from {slot} slots
    </p>
  );
}

export default function AppCard({
  ribbonLabel,
  ribbonVariant = "active",
  title,
  subtitle,
  description,
  footer,
  actions,
  children,
  error,
  className,
  contentClassName,
  actionsClassName,
  onClick,
}: AppCardProps) {
  if (error) {
    return (
      <Card
        className={cn("min-h-[200px] items-center justify-center", className)}
      >
        <CardContent className="items-center justify-center text-center">
          <span className="text-sm font-semibold leading-tight">{error}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full", className)} onClick={onClick}>
      {ribbonLabel && <Ribbon variant={ribbonVariant}>{ribbonLabel}</Ribbon>}
      <CardContent className={cn("h-full flex-1", contentClassName)}>
        <div className="flex min-w-0 flex-col gap-0 mb-auto">
          {title && (
            <h3 className="text-md font-semibold leading-snug line-clamp-2">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs font-medium text-gray-700">{subtitle}</p>
          )}
          {description && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-3">
              {description}
            </p>
          )}
        </div>
        {children}
        {footer && <CardFooter>{footer}</CardFooter>}
        {actions && (
          <CardActions className={actionsClassName}>{actions}</CardActions>
        )}
      </CardContent>
    </Card>
  );
}
