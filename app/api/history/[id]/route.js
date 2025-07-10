// app/api/history/[id]/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function DELETE( request, context ) {
  const { params } = context;

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const historyId = parseInt(params.id, 10);
  const userId = session.user.id;

  if (isNaN(historyId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const item = await prisma.history.findUnique({ where: { id: historyId } });

    if (!item || item.userId !== userId) {
      return NextResponse.json({ error: 'Not found or not allowed' }, { status: 403 });
    }

    await prisma.history.delete({ where: { id: historyId } });

    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
