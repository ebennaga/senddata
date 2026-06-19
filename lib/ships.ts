import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'ships.json');

export interface ShipMeta {
  name: string;
  callSign: string;
  enabled: boolean;
  lastSentAt: string | null;
  lastSentStatus: 'delivered' | 'failed' | null;
  lastSentTo: string | null;
}

export type ShipStore = Record<string, ShipMeta>;

export async function readStore(): Promise<ShipStore> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw) as ShipStore;
  } catch {
    return {};
  }
}

export async function writeStore(store: ShipStore): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

export function parseDescription(description: string = ''): { name: string; owner: string } {
  const idx = description.indexOf(' - ');
  if (idx === -1) return { name: description.trim(), owner: '' };
  return {
    name: description.slice(0, idx).trim(),
    owner: description.slice(idx + 3).trim(),
  };
}
