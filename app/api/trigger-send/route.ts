import { NextResponse } from 'next/server';
import { runSendPertamina } from '@/lib/sendLogic';

export async function POST() {
  try {
    const result = await runSendPertamina();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
