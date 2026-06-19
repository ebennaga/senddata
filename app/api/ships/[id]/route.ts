import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readStore, writeStore } from '@/lib/ships';

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/ships/[id]'>) {
  const { id } = await ctx.params;
  const mobileId = decodeURIComponent(id);

  const body = await request.json() as {
    name?: string;
    callSign?: string;
    enabled?: boolean;
  };

  const store = await readStore();
  const current = store[mobileId] ?? {
    name: '',
    callSign: '',
    enabled: false,
    lastSentAt: null,
    lastSentStatus: null,
    lastSentTo: null,
  };

  if (typeof body.name === 'string') current.name = body.name;
  if (typeof body.callSign === 'string') current.callSign = body.callSign;
  if (typeof body.enabled === 'boolean') current.enabled = body.enabled;

  store[mobileId] = current;
  await writeStore(store);

  return NextResponse.json(current);
}
