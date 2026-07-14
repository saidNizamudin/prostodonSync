export default function ScheduleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="mx-auto flex w-full flex-col">{children}</div>;
}
