'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, undefined);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      }}
    >
      {/* Decorative circles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #7dd3fc, transparent)' }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 border border-white/20 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-13l-.87.5M4.21 17.5l-.87.5M20.66 17.5l-.87-.5M4.21 6.5l-.87-.5M21 12h-1M4 12H3m15.36-6.36l-.7.7M6.34 17.66l-.7.7M17.66 17.66l-.7-.7M6.34 6.34l-.7-.7" />
              <circle cx="12" cy="12" r="4" strokeWidth={1.5} />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">GPS Skysatu</h1>
          <p className="text-sky-300 text-sm mt-1">Sistem Laporan Pertamina</p>
        </div>

        {/* Card */}
        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
          <h2 className="text-base font-semibold text-white mb-6">Masuk ke Sistem</h2>

          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-medium text-sky-200 mb-1.5">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-sky-400 focus:outline-none focus:bg-white/15 transition-colors"
                placeholder="Masukkan username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-sky-200 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-sky-400 focus:outline-none focus:bg-white/15 transition-colors"
                placeholder="Masukkan password"
              />
            </div>

            {error && (
              <p className="text-xs text-red-300 bg-red-500/20 border border-red-400/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-colors mt-2"
            >
              {pending ? 'Memverifikasi...' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          &copy; {new Date().getFullYear()} Skysatu VMS
        </p>
      </div>
    </div>
  );
}
