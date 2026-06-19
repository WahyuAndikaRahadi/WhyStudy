import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const TARGET_DATE = new Date('2026-11-01T00:00:00').getTime();

function getTimeLeft() {
  const now = Date.now();
  const diff = Math.max(0, TARGET_DATE - now);
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownTimer() {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(getTimeLeft());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: 'Hari', value: time.days, accent: false },
    { label: 'Jam', value: time.hours, accent: false },
    { label: 'Menit', value: time.minutes, accent: false },
    { label: 'Detik', value: time.seconds, accent: true },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl bg-blue-600 text-white">
          <Clock size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Countdown Menuju TKA
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Target: 1 November 2026
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center gap-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-2"
          >
            <span
              className={`text-3xl sm:text-4xl font-mono font-bold tabular-nums ${
                unit.accent
                  ? 'text-blue-600 dark:text-blue-500'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
