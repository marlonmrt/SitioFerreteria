import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user as { id?: string; type?: string } | undefined;

  if (!user || user.type !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}