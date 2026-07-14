"use client";

import AppCard from "@/components/app-card";
import AppDashboard, { AppDashboardHeader } from "@/components/app-dashboard";

const fieldOptions = [
  {
    slug: "prosthodontist",
    title: "Prostodonsia",
    description: "Browse and register for prosthodontist schedules.",
  },
  {
    slug: "maksilofasial",
    title: "Bedah Mulut",
    description: "Browse and register for oral surgery schedules.",
  },
] as const;

export default function HomePage() {
  return (
    <AppDashboard
      header={
        <AppDashboardHeader
          title="FKG Schedule Race"
          subtitle="Choose your field to continue"
        />
      }
    >
      <div className={"w-full mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4"}>
        {fieldOptions.map((field) => (
          <AppCard
            key={field.slug}
            href={`/${field.slug}`}
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
