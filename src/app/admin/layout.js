import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayoutWrapper from "@/components/DashboardLayoutWrapper";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <DashboardLayoutWrapper user={session}>
      {children}
    </DashboardLayoutWrapper>
  );
}
