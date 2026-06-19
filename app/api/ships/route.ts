import { NextResponse } from 'next/server';
import { getMobilesPaged } from '@/lib/orbcomm';
import { readStore, parseDescription } from '@/lib/ships';

export async function GET() {
  const [mobiles, store] = await Promise.all([getMobilesPaged(), readStore()]);

  const ships = mobiles.map((m, idx) => {
    const { name, owner } = parseDescription(m.Description);
    const meta = store[m.ID] ?? {
      name,
      callSign: '',
      enabled: false,
      lastSentAt: null,
      lastSentStatus: null,
      lastSentTo: null,
    };

    return {
      rowId: idx + 1,
      mobileId: m.ID,
      name: meta.name || name,
      owner,
      callSign: meta.callSign,
      enabled: meta.enabled,
      lastSentAt: meta.lastSentAt,
      lastSentStatus: meta.lastSentStatus,
      lastSentTo: meta.lastSentTo,
      lastRegistrationUTC: m.LastRegistrationUTC,
    };
  });

  return NextResponse.json(ships);
}
