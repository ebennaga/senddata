export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const cron = await import('node-cron');
    const { runSendPertamina } = await import('./lib/sendLogic');

    const schedule = process.env.CRON_SCHEDULE ?? '0 * * * *';

    cron.schedule(schedule, async () => {
      const now = new Date().toISOString();
      console.log(`[cron] ${now} — menjalankan kirim Pertamina...`);
      try {
        const result = await runSendPertamina();
        console.log(`[cron] Selesai: ${result.processed} pesan dikirim`);
        if (result.results.length > 0) {
          result.results.forEach((r) =>
            console.log(`[cron]  → ${r.ship}: ${r.status}`)
          );
        }
      } catch (error) {
        console.error('[cron] Error:', error);
      }
    });

    console.log(`[cron] Jadwal aktif: "${schedule}"`);
  }
}
