import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeaderSkeleton } from "@/components/skeleton";

const headerBoxClass =
  "rounded-xl border border-gray-300 bg-white p-4 shadow-md";

const headerBoxRowClass =
  "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between";

interface AppDashboardProps {
  children?: React.ReactNode;
  header?: React.ReactNode;
  isHeaderLoading?: boolean;
  headerLoadingShowBackLink?: boolean;
  filter?: React.ReactNode;
  beforeContent?: React.ReactNode;
  className?: string;
}

export default function AppDashboard({
  children,
  header,
  isHeaderLoading,
  headerLoadingShowBackLink,
  filter,
  beforeContent,
  className,
}: AppDashboardProps) {
  return (
    <div className={cn("relative flex w-full flex-col gap-5 py-2", className)}>
      {isHeaderLoading ? (
        <PageHeaderSkeleton showBackLink={headerLoadingShowBackLink} />
      ) : (
        header
      )}
      {filter && (
        <div className="flex flex-wrap items-center gap-2">{filter}</div>
      )}
      {beforeContent}
      {children}
    </div>
  );
}

interface AppDashboardHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  backLink?: { href: string; label: string };
  meta?: React.ReactNode;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  simple?: boolean;
  className?: string;
}

export function AppDashboardHeader({
  title,
  subtitle,
  backLink,
  meta,
  badges,
  actions,
  children,
  simple = false,
  className,
}: AppDashboardHeaderProps) {
  if (simple) {
    return (
      <header className={cn(headerBoxClass, className)}>
        <h1 className="text-lg font-semibold leading-snug text-gray-900 sm:text-xl">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </header>
    );
  }

  return (
    <header className={cn(headerBoxClass, headerBoxRowClass, className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {backLink && (
          <Link
            href={backLink.href}
            className="inline-flex w-fit items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
          >
            <ArrowLeft className="size-4" />
            {backLink.label}
          </Link>
        )}
        {children ?? (
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold leading-snug text-gray-900 sm:text-xl">
                {title}
              </h1>
              {badges}
            </div>
            {subtitle && (
              <p className="text-sm text-gray-500 line-clamp-2">{subtitle}</p>
            )}
            {meta && <p className="text-xs text-gray-600">{meta}</p>}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}
