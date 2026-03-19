import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: memberId } = await params;
  const { techniqueId } = await request.json();

  if (!techniqueId) {
    return NextResponse.json({ error: "techniqueId required" }, { status: 400 });
  }

  const record = await prisma.techniqueProgress.upsert({
    where: {
      memberId_techniqueId: { memberId, techniqueId },
    },
    update: {},
    create: {
      memberId,
      techniqueId,
      verifiedBy: session.user.email || "admin",
    },
  });

  return NextResponse.json(record, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: memberId } = await params;
  const { techniqueId } = await request.json();

  await prisma.techniqueProgress.deleteMany({
    where: { memberId, techniqueId },
  });

  return NextResponse.json({ ok: true });
}
