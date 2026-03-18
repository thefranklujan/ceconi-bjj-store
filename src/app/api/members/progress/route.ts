import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "member" && session.user.role !== "admin")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberId = session.user.memberId;
  if (!memberId) {
    return NextResponse.json({ error: "No member ID" }, { status: 400 });
  }

  const progress = await prisma.beltProgress.findMany({
    where: { memberId },
    orderBy: { awardedAt: "desc" },
  });

  return NextResponse.json(progress);
}
