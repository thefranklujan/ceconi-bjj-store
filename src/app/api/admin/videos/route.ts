import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const videos = await prisma.video.findMany({
    orderBy: { classDate: "desc" },
  });

  return NextResponse.json(videos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, embedUrl, description, classType, classDate, published } = body;

  if (!title || !embedUrl || !classType || !classDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const video = await prisma.video.create({
    data: {
      title,
      embedUrl,
      description: description || null,
      classType,
      classDate: new Date(classDate),
      published: published !== false,
    },
  });

  return NextResponse.json(video, { status: 201 });
}
