import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "member" && session.user.role !== "admin")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const memberId = session.user.memberId;

  const { searchParams } = request.nextUrl;
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const location = searchParams.get("location") || "";
  const classType = searchParams.get("classType") || "";
  const eventType = searchParams.get("eventType") || "";

  // Build schedule filter
  const scheduleWhere: Record<string, unknown> = { active: true };
  if (location) scheduleWhere.locationSlug = location;
  if (classType) scheduleWhere.classType = classType;

  // Build event filter
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const eventWhere: Record<string, unknown> = {
    active: true,
    date: { gte: startOfMonth, lte: endOfMonth },
  };
  if (location) eventWhere.locationSlug = location;
  if (eventType) eventWhere.eventType = eventType;

  // Build attendance filter
  const attendanceWhere: Record<string, unknown> = {
    classDate: { gte: startOfMonth, lte: endOfMonth },
  };
  if (memberId) attendanceWhere.memberId = memberId;

  const [schedule, attendance, events] = await Promise.all([
    prisma.classSchedule.findMany({
      where: scheduleWhere,
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    memberId
      ? prisma.attendance.findMany({
          where: attendanceWhere,
          orderBy: { classDate: "asc" },
        })
      : Promise.resolve([]),
    prisma.event.findMany({
      where: eventWhere,
      orderBy: { date: "asc" },
    }),
  ]);

  return NextResponse.json({ schedule, attendance, events });
}
