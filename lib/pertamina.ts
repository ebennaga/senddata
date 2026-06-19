import type { OrbcommField } from './orbcomm';

function printFloatWithLeadingZeros(
  num: number,
  precision: number = 1,
  leadingZeros: number = 3
): string {
  const decimalSeparator = '.';
  const totalWidth = leadingZeros + decimalSeparator.length + precision;
  return num.toFixed(precision).padStart(totalWidth, '0');
}

function ddToNme(dd: string): number {
  const value = parseFloat(dd);
  const absValue = Math.abs(value);
  const brk = dd.indexOf('.');
  const degrees = parseInt(dd.slice(0, brk < 0 ? 0 : brk), 10);
  const minutes = (absValue - Math.abs(degrees)) * 60;
  const minutesStr = printFloatWithLeadingZeros(minutes, 4, 2);
  const degreesStr = String(Math.abs(degrees)).padStart(2, '0');
  const sign = value < 0 ? -1 : 1;
  return sign * parseFloat(degreesStr + minutesStr);
}

export interface ShipInfo {
  callSign: string | null;
  name: string;
}

export function buildPertaminaContent(
  fields: OrbcommField[],
  ship: ShipInfo,
  messageUtc: string
): string {
  let latitude = '';
  let longitude = '';
  let speed = '';
  let heading = '';

  for (const field of fields) {
    const name = field.Name.toLowerCase();
    if (name === 'latitude') latitude = field.Value;
    if (name === 'longitude') longitude = field.Value;
    if (name === 'speed') speed = field.Value;
    if (name === 'heading') heading = field.Value;
  }

  const utcDate = new Date(messageUtc);

  const hhmmss = [
    String(utcDate.getUTCHours()).padStart(2, '0'),
    String(utcDate.getUTCMinutes()).padStart(2, '0'),
    String(utcDate.getUTCSeconds()).padStart(2, '0'),
  ].join('');

  const ddmmyy = [
    String(utcDate.getUTCDate()).padStart(2, '0'),
    String(utcDate.getUTCMonth() + 1).padStart(2, '0'),
    String(utcDate.getUTCFullYear()).slice(-2),
  ].join('');

  const latNme = printFloatWithLeadingZeros(Math.abs(ddToNme(latitude)), 4, 4) + ',S';
  const lonNme = printFloatWithLeadingZeros(Math.abs(ddToNme(longitude)), 4, 4) + ',E';
  const callSign = ship.callSign ?? 'null';

  const nmea = `$SKYSATU,${hhmmss},A,${latNme},${lonNme},${printFloatWithLeadingZeros(parseFloat(speed))},${printFloatWithLeadingZeros(parseFloat(heading))},${ddmmyy},000.0,E*68`;

  return `"${callSign}","${ship.name}","${nmea}"`;
}

export function buildSubject(shipName: string, messageUtc: string): string {
  const d = new Date(messageUtc);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  return `${shipName}-${dd}${mm}${yyyy}-${hh}${min}`;
}
