const BASE_URL = process.env.ORBCOMM_BASE_URL!;
const ACCESS_ID = process.env.ORBCOMM_ACCESS_ID!;
const PASSWORD = process.env.ORBCOMM_PASSWORD!;

export interface OrbcommField {
  Name: string;
  Value: string;
}

export interface OrbcommPayload {
  Name: string;
  MIN?: number;
  Fields: OrbcommField[];
}

export interface OrbcommMessage {
  ID: number;
  MobileID: string;
  SIN: number;
  RegionName: string;
  MessageUTC: string;
  ReceiveUTC: string;
  OTAMessageSize: number;
  Payload: OrbcommPayload;
}

export interface OrbcommMobile {
  ID: string;
  Description?: string;
  RegionName?: string;
  LastRegistrationUTC?: string;
}

async function get<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(endpoint, BASE_URL);
  url.searchParams.set('access_id', ACCESS_ID);
  url.searchParams.set('password', PASSWORD);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`ORBCOMM request failed: ${res.status} ${res.statusText}`);
  return res.json();
}

async function getInfoUtcTime(): Promise<string> {
  const data = await get<string>('info_utc_time.json/');
  return typeof data === 'string' ? data.replace(/"/g, '') : String(data);
}

async function getSubAccounts(): Promise<string[]> {
  const data = await get<{ ErrorID: number; Subaccounts: { AccountID: string }[] }>(
    'get_subaccount_infos.json/'
  );
  if (data.ErrorID !== 0) return [];
  return data.Subaccounts.map((s) => s.AccountID);
}

export async function getMobilesPaged(): Promise<OrbcommMobile[]> {
  const subAccounts = await getSubAccounts();
  const mobiles: OrbcommMobile[] = [];

  for (const subAccountId of subAccounts) {
    const data = await get<{ ErrorID: number; Mobiles: OrbcommMobile[] }>(
      'get_mobiles_paged.json/',
      { page_size: '100', subaccount_id: subAccountId }
    );
    if (data.ErrorID === 0 && data.Mobiles) {
      mobiles.push(...data.Mobiles);
    }
  }

  return mobiles;
}

export async function getReturnMessages(): Promise<OrbcommMessage[]> {
  const [utcTime, subAccounts] = await Promise.all([getInfoUtcTime(), getSubAccounts()]);

  const sinceUtc = new Date(new Date(utcTime).getTime() - 60 * 60 * 1000)
    .toISOString()
    .replace('T', ' ')
    .slice(0, 19);

  const messages: OrbcommMessage[] = [];

  for (const subAccountId of subAccounts) {
    const data = await get<{ ErrorID: number; Messages: OrbcommMessage[] | null }>(
      'get_return_messages.json/',
      { start_utc: sinceUtc, sub_account_id: subAccountId }
    );
    if (data.ErrorID === 0 && data.Messages) {
      messages.push(...data.Messages);
    }
  }

  return messages;
}

export function processSimpleReportFields(fields: OrbcommField[]): OrbcommField[] {
  return fields.map((field) => {
    const name = field.Name.toLowerCase();
    let value = field.Value;

    if (name === 'latitude' || name === 'longitude') {
      value = String((parseFloat(value) / 6) * 0.0001);
    } else if (name === 'speed' || name === 'heading') {
      value = String(parseFloat(value) * 0.1);
    }

    return { Name: name, Value: value };
  });
}
