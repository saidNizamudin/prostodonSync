import Link from "next/link";
import { cn } from "@/lib/utils";
import Ribbon, { type RibbonVariant } from "@/components/ribbon";
import {
  Card,
  CardActions,
  CardContent,
  CardFooter,
  cardGridClass,
} from "@/components/card";

export { cardGridClass };

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
  href?: string;
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
  href,
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

  const card = (
    <Card className={className} onClick={href ? undefined : onClick}>
      {ribbonLabel && <Ribbon variant={ribbonVariant}>{ribbonLabel}</Ribbon>}
      <CardContent className={contentClassName}>
        <div className="flex min-w-0 shrink-0 flex-col gap-0">
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
        {children && <div className="shrink-0">{children}</div>}
        {footer && <CardFooter>{footer}</CardFooter>}
        {actions && (
          <CardActions className={actionsClassName}>{actions}</CardActions>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block w-full min-w-0">
        {card}
      </Link>
    );
  }

  return card;
}
