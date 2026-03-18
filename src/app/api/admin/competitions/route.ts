import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results = await prisma.competitionResult.findMany({
    include: { member: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { memberId, competitionName, date, placement, division, notes } = body;

  if (!memberId || !competitionName || !date || !placement) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await prisma.competitionResult.create({
    data: {
      memberId,
      competitionName,
      date: new Date(date),
      placement,
      division: division || null,
      notes: notes || null,
    },
  });

  return NextResponse.json(result, { status: 201 });
}
