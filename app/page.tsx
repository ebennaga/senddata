'use client';

import { useEffect, useState, useRef } from 'react';
import { logout } from '@/app/actions/auth';

interface Ship {
  rowId: number;
  mobileId: string;
  name: string;
  owner: string;
  callSign: string;
  enabled: boolean;
  lastSentAt: string | null;
  lastSentStatus: 'delivered' | 'failed' | null;
  lastSentTo: string | null;
  lastRegistrationUTC: string;
}

function formatDate(iso: string | null) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
}

function StatusBadge({ status }: { status: 'delivered' | 'failed' | null }) {
  if (!status) return <span className="text-gray-400 text-xs">-</span>;
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
        status === 'delivered'
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      {status === 'delivered' ? 'Delivered' : 'Failed'}
    </span>
  );
}

function CallSignCell({
  mobileId,
  name,
  value,
  onChange,
}: {
  mobileId: string;
  name: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(value), [value]);

  async function save() {
    if (draft === value) return;
    setSaving(true);
    await fetch(`/api/ships/${encodeURIComponent(mobileId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callSign: draft, name }),
    });
    onChange(draft);
    setSaving(false);
  }

  return (
    <input
      className="w-28 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
      value={draft}
      onChange={(e) => setDraft(e.target.value.toUpperCase())}
      onBlur={save}
      onKeyDown={(e) => e.key === 'Enter' && save()}
      disabled={saving}
      placeholder="XXXXXX"
    />
  );
}

function ToggleButton({
  mobileId,
  name,
  callSign,
  enabled,
  onChange,
}: {
  mobileId: string;
  name: string;
  callSign: string;
  enabled: boolean;
  onChange: (val: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!enabled && !callSign.trim()) {
      alert('Isi Call Sign terlebih dahulu sebelum mengaktifkan kirim ke Pertamina.');
      return;
    }
    setLoading(true);
    await fetch(`/api/ships/${encodeURIComponent(mobileId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !enabled, name }),
    });
    onChange(!enabled);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
        enabled
          ? 'bg-green-500 text-white hover:bg-green-600'
          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
      }`}
    >
      {loading ? '...' : enabled ? 'Enabled' : 'Disabled'}
    </button>
  );
}

export default function Home() {
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ processed: number; results: { ship: string; status: string }[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function loadShips() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ships');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setShips(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadShips(); }, []);

  async function handleSend() {
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/trigger-send', { method: 'POST' });
      const data = await res.json();
      setSendResult(data);
      loadShips();
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } finally {
      setSending(false);
    }
  }

  function updateShip(mobileId: string, patch: Partial<Ship>) {
    setShips((prev) => prev.map((s) => s.mobileId === mobileId ? { ...s, ...patch } : s));
  }

  const enabledCount = ships.filter((s) => s.enabled).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-screen-xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">GPS Skysatu</h1>
            <p className="text-sm text-gray-500">Manajemen Laporan Pertamina</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {enabledCount} kapal aktif dari {ships.length}
            </span>
            <button
              onClick={loadShips}
              disabled={loading}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Memuat...' : 'Refresh'}
            </button>
            <button
              onClick={handleSend}
              disabled={sending || enabledCount === 0}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? 'Mengirim...' : 'Kirim ke Pertamina'}
            </button>
            <form action={logout}>
              <button
                type="submit"
                className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>

        {/* Send result */}
        {sendResult && (
          <div ref={resultRef} className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
            <p className="font-semibold text-blue-800">
              Hasil pengiriman: {sendResult.processed} pesan diproses
            </p>
            {sendResult.processed === 0 && (
              <p className="mt-1 text-blue-600">
                Tidak ada pesan baru dari ORBCOMM dalam 1 jam terakhir.
              </p>
            )}
            {sendResult.results?.length > 0 && (
              <ul className="mt-2 space-y-1">
                {sendResult.results.map((r, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                        r.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {r.status}
                    </span>
                    <span className="text-gray-700">{r.ship}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-3 py-3 text-right w-10">#</th>
                <th className="px-3 py-3 text-left">Terminal ID</th>
                <th className="px-3 py-3 text-left">Nama Kapal</th>
                <th className="px-3 py-3 text-left">Call Sign</th>
                <th className="px-3 py-3 text-center">Send to Pertamina</th>
                <th className="px-3 py-3 text-left">Owner</th>
                <th className="px-3 py-3 text-left">Last Sent</th>
                <th className="px-3 py-3 text-left">Destination</th>
                <th className="px-3 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                    Memuat data dari ORBCOMM...
                  </td>
                </tr>
              ) : ships.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                    Tidak ada kapal ditemukan
                  </td>
                </tr>
              ) : (
                ships.map((ship) => (
                  <tr key={ship.mobileId} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-right text-gray-400">{ship.rowId}</td>
                    <td className="px-3 py-3 font-mono text-xs text-gray-600">{ship.mobileId}</td>
                    <td className="px-3 py-3 font-medium text-gray-800">{ship.name}</td>
                    <td className="px-3 py-3">
                      <CallSignCell
                        mobileId={ship.mobileId}
                        name={ship.name}
                        value={ship.callSign}
                        onChange={(val) => updateShip(ship.mobileId, { callSign: val })}
                      />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <ToggleButton
                        mobileId={ship.mobileId}
                        name={ship.name}
                        callSign={ship.callSign}
                        enabled={ship.enabled}
                        onChange={(val) => updateShip(ship.mobileId, { enabled: val })}
                      />
                    </td>
                    <td className="px-3 py-3 text-gray-600">{ship.owner || '-'}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(ship.lastSentAt)}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500 max-w-[160px] truncate">
                      {ship.lastSentTo || '-'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <StatusBadge status={ship.lastSentStatus} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-gray-400">
          Call Sign: klik field lalu tekan Enter atau klik di luar untuk menyimpan.
          Toggle Enable hanya bisa diaktifkan jika Call Sign sudah diisi.
        </p>
      </div>
    </div>
  );
}
