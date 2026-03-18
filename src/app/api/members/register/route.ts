import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, firstName, lastName, phone, locationSlug } = body;

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.member.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const member = await prisma.member.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      phone: phone || null,
      locationSlug: locationSlug || null,
    },
  });

  return NextResponse.json(
    { message: "Registration successful. Please wait for admin approval.", id: member.id },
    { status: 201 }
  );
}
