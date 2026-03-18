import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { beltRank, stripes, note } = body;

  if (!beltRank || typeof stripes !== "number") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Create belt progress record
  const beltProgress = await prisma.beltProgress.create({
    data: {
      memberId: id,
      beltRank,
      stripes,
      note: note || null,
      awardedBy: session.user?.email || "admin",
    },
  });

  // Update the member's current belt and stripes
  await prisma.member.update({
    where: { id },
    data: { beltRank, stripes },
  });

  return NextResponse.json(beltProgress, { status: 201 });
}
