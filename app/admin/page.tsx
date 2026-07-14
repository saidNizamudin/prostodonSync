"use client";

import AppCard from "@/components/app-card";
import AppDashboard, { AppDashboardHeader } from "@/components/app-dashboard";

const adminOptions = [
  {
    href: "/admin/schedule",
    title: "Manage Schedules",
    description: "Create and manage events and their categories.",
    ribbonLabel: "SCHEDULES",
  },
  {
    href: "/admin/instructor",
    title: "Manage Instructors",
    description: "Manage instructor names for category suggestions.",
    ribbonLabel: "INSTRUCTORS",
  },
] as const;

export default function AdminHomePage() {
  return (
    <AppDashboard
      header={
        <AppDashboardHeader
          title="Admin"
          subtitle="Choose what you want to manage"
        />
      }
    >
      <div className="mx-auto grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {adminOptions.map((option) => (
          <AppCard
            key={option.href}
            href={option.href}
            className="border-gray-200 shadow-md transition duration-300 ease-in-out hover:border-green-500 hover:shadow-lg"
            ribbonLabel={option.ribbonLabel}
            ribbonVariant="open"
            title={option.title}
            description={option.description}
          />
        ))}
      </div>
    </AppDashboard>
  );
}
