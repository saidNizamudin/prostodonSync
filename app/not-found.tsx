import Link from "next/link";
import AppDashboard, { AppDashboardHeader } from "@/components/app-dashboard";
import { Button } from "@/components/button";

export default function NotFound() {
  return (
    <AppDashboard
      header={
        <AppDashboardHeader
          title="Page not found"
          subtitle="The page you're looking for doesn't exist or may have been moved."
          simple
        />
      }
    >
      <div className="flex flex-col items-center justify-center gap-6 py-16">
        <p className="text-7xl font-bold tracking-tight text-gray-300">404</p>
        <Button asChild size="lg">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </AppDashboard>
  );
}
