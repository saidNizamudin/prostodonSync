"use client";

import AppCard from "@/components/app-card";
import AppDashboard, { AppDashboardHeader } from "@/components/app-dashboard";

const fieldOptions = [
  {
    slug: "prosthodontist",
    title: "Prostodonsia",
    description: "Manage prosthodontist schedules and categories.",
  },
  {
    slug: "maksilofasial",
    title: "Bedah Mulut",
    description: "Manage oral surgery schedules and categories.",
  },
] as const;

export default function AdminSchedulePickerPage() {
  return (
    <AppDashboard
      header={
        <AppDashboardHeader
          title="Schedules"
          subtitle="Choose a field to manage schedules"
          backLink={{ href: "/admin", label: "Admin home" }}
        />
      }
    >
      <div className="mx-auto grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {fieldOptions.map((field) => (
          <AppCard
            key={field.slug}
            href={`/admin/schedule/${field.slug}`}
            className="border-gray-200 shadow-md transition duration-300 ease-in-out hover:border-green-500 hover:shadow-lg"
            ribbonLabel={field.slug.toUpperCase()}
            ribbonVariant="open"
            title={field.title}
            description={field.description}
          />
        ))}
      </div>
    </AppDashboard>
  );
}
