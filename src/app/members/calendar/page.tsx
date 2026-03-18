import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MemberShell from "@/components/members/MemberShell";
import CalendarFilters from "./CalendarFilters";
import CalendarGrid from "./CalendarGrid";

export const dynamic = "force-dynamic";

export default async function MemberCalendarPage() {
  const session = await getServerSession(authOptions);
  const memberId = session?.user?.memberId;

  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const [schedule, attendance, events] = await Promise.all([
    prisma.classSchedule.findMany({
      where: { active: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    memberId
      ? prisma.attendance.findMany({
          where: {
            memberId,
            classDate: { gte: startOfMonth, lte: endOfMonth },
          },
          orderBy: { classDate: "asc" },
        })
      : [],
    prisma.event.findMany({
      where: {
        active: true,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  return (
    <MemberShell>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider mb-6">
          Calendar
        </h1>
        <CalendarFilters />
        <CalendarGrid
          initialSchedule={JSON.parse(JSON.stringify(schedule))}
          initialAttendance={JSON.parse(JSON.stringify(attendance))}
          initialEvents={JSON.parse(JSON.stringify(events))}
          initialMonth={month}
          initialYear={year}
        />
      </div>
    </MemberShell>
  );
}
