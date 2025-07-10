// /app/api/save-history/route.js

import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; // ✅ needed
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry(fn, retries = 3, delay = 1000) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.warn(`Retry ${i + 1} failed:`, err.message);
      await sleep(delay);
    }
  }
  throw lastError;
}

export async function POST(req) {
  const session = await getServerSession(authOptions); // ✅ fix

  try {
    const body = await req.json();
    const { bust, waist, hips, shoulders, result } = body;

    // ✅ Basic validation (still needed)
    if (
      !bust || !waist || !hips || !shoulders || !result ||
      [bust, waist, hips, shoulders].some(val => isNaN(parseFloat(val)))
    ) {
      return NextResponse.json({ error: 'Invalid or missing fields' }, { status: 400 });
    }

    await sleep(200 + Math.random() * 300); // ⏱ optional delay

    const saved = await withRetry(() =>
      prisma.history.create({
        data: {
          bust: parseFloat(bust),
          waist: parseFloat(waist),
          hips: parseFloat(hips),
          shoulders: parseFloat(shoulders),
          result,
          userEmail: session.user.email,
          userId: session.user.id,
        },
      })
    );

    return NextResponse.json(saved, { status: 201 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
