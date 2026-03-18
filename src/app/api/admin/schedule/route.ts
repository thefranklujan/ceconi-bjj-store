import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const entries = await prisma.classSchedule.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { dayOfWeek, startTime, endTime, classType, instructor, locationSlug } = body;

  if (
    typeof dayOfWeek !== "number" ||
    !startTime ||
    !endTime ||
    !classType ||
    !instructor ||
    !locationSlug
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const entry = await prisma.classSchedule.create({
    data: {
      dayOfWeek,
      startTime,
      endTime,
      classType,
      instructor,
      locationSlug,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
