import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      beltHistory: { orderBy: { awardedAt: "desc" } },
    },
  });

  if (!member) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const attendanceCount = await prisma.attendance.count({
    where: { memberId: id },
  });

  return NextResponse.json({ ...member, attendanceCount });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (typeof body.approved === "boolean") data.approved = body.approved;
  if (typeof body.active === "boolean") data.active = body.active;
  if (body.beltRank) data.beltRank = body.beltRank;
  if (typeof body.stripes === "number") data.stripes = body.stripes;

  const member = await prisma.member.update({
    where: { id },
    data,
  });

  return NextResponse.json(member);
}
