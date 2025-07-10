import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { fullName, birthdate, location, phone } = body;

  try {
    const existing = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    const profile = existing
      ? await prisma.profile.update({
          where: { userId: session.user.id },
          data: { fullName, birthdate: new Date(birthdate), location, phone },
        })
      : await prisma.profile.create({
          data: {
            fullName,
            birthdate: new Date(birthdate),
            location,
            phone,
            userId: session.user.id,
          },
        });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
