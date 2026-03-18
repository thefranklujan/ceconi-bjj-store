import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "member" && session.user.role !== "admin")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const memberId = session.user.memberId;
  if (!memberId) {
    return NextResponse.json({ error: "No member profile" }, { status: 403 });
  }

  const { classDate, classType, locationSlug } = await request.json();
  if (!classDate || !classType || !locationSlug) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const commitment = await prisma.scheduleCommitment.upsert({
    where: {
      memberId_classDate_classType: {
        memberId,
        classDate: new Date(classDate),
        classType,
      },
    },
    update: {},
    create: {
      memberId,
      classDate: new Date(classDate),
      classType,
      locationSlug,
    },
  });

  return NextResponse.json(commitment, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "member" && session.user.role !== "admin")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const memberId = session.user.memberId;
  if (!memberId) {
    return NextResponse.json({ error: "No member profile" }, { status: 403 });
  }

  const { classDate, classType } = await request.json();

  await prisma.scheduleCommitment.deleteMany({
    where: {
      memberId,
      classDate: new Date(classDate),
      classType,
    },
  });

  return NextResponse.json({ ok: true });
}
