import { getReturnMessages, processSimpleReportFields } from './orbcomm';
import { buildPertaminaContent, buildSubject } from './pertamina';
import { sendPertaminaMail } from './mailer';
import { readStore, writeStore } from './ships';

const PERTAMINA_EMAILS = (process.env.PERTAMINA_EMAIL_DESTINATIONS ?? '')
  .split(';')
  .map((e) => e.trim())
  .filter(Boolean);

export interface SendResult {
  id: number;
  ship: string;
  status: 'delivered' | 'failed';
}

export async function runSendPertamina(): Promise<{ processed: number; results: SendResult[] }> {
  const [messages, store] = await Promise.all([getReturnMessages(), readStore()]);
  const results: SendResult[] = [];

  for (const message of messages) {
    if (message.Payload.Name !== 'simpleReport') continue;
    if (message.Payload.MIN !== 1 || message.SIN !== 19) continue;

    const meta = store[message.MobileID];
    if (!meta?.enabled || !meta.callSign) continue;

    const fields = processSimpleReportFields(message.Payload.Fields);
    const subject = buildSubject(meta.name, message.MessageUTC);
    const content = buildPertaminaContent(
      fields,
      { name: meta.name, callSign: meta.callSign },
      message.MessageUTC
    );
    const filename = `${subject}.chr`;

    const sent = await sendPertaminaMail({
      to: PERTAMINA_EMAILS,
      subject,
      filename,
      content,
    });

    const status = sent ? 'delivered' : 'failed';

    store[message.MobileID] = {
      ...meta,
      lastSentAt: new Date().toISOString(),
      lastSentStatus: status,
      lastSentTo: PERTAMINA_EMAILS.join('; '),
    };

    results.push({ id: message.ID, ship: meta.name, status });
  }

  if (results.length > 0) {
    await writeStore(store);
  }

  return { processed: results.length, results };
}
