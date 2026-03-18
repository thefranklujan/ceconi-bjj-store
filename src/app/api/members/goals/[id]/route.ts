import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "member" && session.user.role !== "admin")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const memberId = session.user.memberId;
  const { id } = await params;

  const goal = await prisma.personalGoal.findUnique({ where: { id } });
  if (!goal || goal.memberId !== memberId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const data: Record<string, unknown> = {};

  if (body.currentValue !== undefined) {
    data.currentValue = parseInt(body.currentValue, 10);
  }
  if (body.completed !== undefined) {
    data.completed = Boolean(body.completed);
  }

  const updated = await prisma.personalGoal.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "member" && session.user.role !== "admin")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const memberId = session.user.memberId;
  const { id } = await params;

  const goal = await prisma.personalGoal.findUnique({ where: { id } });
  if (!goal || goal.memberId !== memberId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.personalGoal.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
