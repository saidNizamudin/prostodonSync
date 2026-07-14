import { notFound } from "next/navigation";
import { isScheduleTypeSlug } from "@/lib/schedule-type";

export default async function AdminScheduleTypeLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ type: string }>;
}>) {
  const { type } = await params;

  if (!isScheduleTypeSlug(type)) {
    notFound();
  }

  return <div className="mx-auto flex w-full flex-col">{children}</div>;
}
