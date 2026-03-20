import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import MemberSidebar from "@/components/layout/MemberSidebar";
import MemberMobileNav from "@/components/layout/MemberMobileNav";
import AutoRefreshIndicator from "@/components/members/AutoRefreshIndicator";

export default async function MemberShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "member" && session.user.role !== "admin")) {
    redirect("/members/login");
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      <MemberSidebar />
      <div className="flex-1">
        <MemberMobileNav />
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
      <AutoRefreshIndicator />
    </div>
  );
}
