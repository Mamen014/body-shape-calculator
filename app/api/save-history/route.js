import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Utility to sleep for ms milliseconds
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry wrapper function
async function withRetry(fn, retries = 3, delay = 1000) {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn(); // success
    } catch (err) {
      lastError = err;
      console.warn(`Retry ${i + 1} failed:`, err.message);
      await sleep(delay); // wait before retrying
    }
  }

  throw lastError; // throw the final error after all retries fail
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { bust, waist, hips, shoulders, result, userEmail, userId } = body;

    if (!bust || !waist || !hips || !shoulders || !result || !userEmail || !userId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const saved = await withRetry(() =>
      prisma.history.create({
        data: {
          bust: parseFloat(bust),
          waist: parseFloat(waist),
          hips: parseFloat(hips),
          shoulders: parseFloat(shoulders),
          result,
          userEmail,
          userId,
        },
      })
    );

    return NextResponse.json(saved, { status: 201 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
