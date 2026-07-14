import AdminAuthGate from "@/components/admin-auth-gate";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminAuthGate>
      <div className="mx-auto flex w-full flex-col">{children}</div>
    </AdminAuthGate>
  );
}
