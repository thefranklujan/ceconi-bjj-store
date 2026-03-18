import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "member" && session.user.role !== "admin")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const classType = searchParams.get("classType");

  const where: Record<string, unknown> = { published: true };
  if (classType) {
    where.classType = classType;
  }

  const videos = await prisma.video.findMany({
    where,
    orderBy: { classDate: "desc" },
  });

  return NextResponse.json(videos);
}
