import { useState } from 'react';
import { useTracker } from '../TrackerContext';
import { BookOpen, CheckSquare, Square, ChevronDown } from 'lucide-react';

const CHECKBOX_KEYS = ['catatan', 'latsol1', 'latsol2', 'latsol3', 'recall'];

const UNDERSTANDING_LEVELS = [
  {
    value: 'Tidak paham',
    badge: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20',
  },
  {
    value: 'Kurang paham',
    badge: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20',
  },
  {
    value: 'Cukup paham',
    badge: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20',
  },
  {
    value: 'Paham',
    badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
  },
  {
    value: 'Sangat Paham',
    badge: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20',
  },
];

function getBadgeClasses(value) {
  const level = UNDERSTANDING_LEVELS.find((l) => l.value === value);
  return level ? level.badge : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800';
}

function getStatusBadge(percent) {
  if (percent === 0) return null;
  if (percent >= 1 && percent <= 59) {
    return {
      text: 'Ayo kerjain lagi!',
      classes: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20',
    };
  }
  if (percent >= 60 && percent <= 99) {
    return {
      text: 'Ayo sedikit lagi!',
      classes: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20',
    };
  }
  return {
    text: 'Selesai!',
    classes: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
  };
}

export default function SubjectTable({ subject }) {
  const { topics, toggleCheck, setUnderstanding } = useTracker();
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

  const rows = topics[subject] || [];

  const totalChecks = rows.length * CHECKBOX_KEYS.length;
  const checkedCount = rows.reduce((sum, row) => {
    return sum + CHECKBOX_KEYS.filter((k) => row[k]).length;
  }, 0);
  const overallPercent = totalChecks > 0 ? Math.round((checkedCount / totalChecks) * 100) : 0;

  return (
    <div className="overflow-visible">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white">
            <BookOpen size={20} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {subject}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {checkedCount} / {totalChecks} selesai ({overallPercent}%)
            </p>
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {overallPercent}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/70 text-left">
                <th className="w-44 px-4 py-3 font-medium text-slate-600 dark:text-slate-400">
                  Tingkat Pemahaman
                </th>
                <th className="min-w-[200px] px-4 py-3 font-medium text-slate-600 dark:text-slate-400">
                  Materi
                </th>
                <th className="w-20 px-4 py-3 font-medium text-slate-600 dark:text-slate-400 text-center">
                  Catatan
                </th>
                <th className="w-20 px-4 py-3 font-medium text-slate-600 dark:text-slate-400 text-center">
                  Latsol I
                </th>
                <th className="w-20 px-4 py-3 font-medium text-slate-600 dark:text-slate-400 text-center">
                  Latsol II
                </th>
                <th className="w-20 px-4 py-3 font-medium text-slate-600 dark:text-slate-400 text-center">
                  Latsol III
                </th>
                <th className="w-20 px-4 py-3 font-medium text-slate-600 dark:text-slate-400 text-center">
                  Recall
                </th>
                <th className="w-32 px-4 py-3 font-medium text-slate-600 dark:text-slate-400">
                  Progress
                </th>
                <th className="w-36 px-4 py-3 font-medium text-slate-600 dark:text-slate-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {rows.map((row, idx) => {
                const rowChecked = CHECKBOX_KEYS.filter((k) => row[k]).length;
                const rowPercent = rowChecked * 20;
                const status = getStatusBadge(rowPercent);

                return (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Tingkat Pemahaman */}
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() =>
                          setOpenDropdownIndex(openDropdownIndex === idx ? null : idx)
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${getBadgeClasses(row.understanding)}`}
                      >
                        {row.understanding || 'Pilih'}
                        <ChevronDown size={12} />
                      </button>

                      {openDropdownIndex === idx && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenDropdownIndex(null)}
                          />
                          <div className="absolute left-4 mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 py-1.5">
                            {UNDERSTANDING_LEVELS.map((level) => (
                              <button
                                key={level.value}
                                onClick={() => {
                                  setUnderstanding(subject, idx, level.value);
                                  setOpenDropdownIndex(null);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                              >
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${level.badge}`}
                                >
                                  {level.value}
                                </span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </td>

                    {/* Materi */}
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                      {row.topic}
                    </td>

                    {/* Checkboxes */}
                    {CHECKBOX_KEYS.map((key) => (
                      <td key={key} className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleCheck(subject, idx, key)}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          {row[key] ? (
                            <CheckSquare
                              size={20}
                              className="text-blue-600 dark:text-blue-500 mx-auto"
                            />
                          ) : (
                            <Square
                              size={20}
                              className="text-slate-300 dark:text-slate-600 mx-auto"
                            />
                          )}
                        </button>
                      </td>
                    ))}

                    {/* Progress */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${rowPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-slate-600 dark:text-slate-400 w-8 text-right">
                          {rowPercent}%
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {status && (
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${status.classes}`}
                        >
                          {status.text}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="h-16" />
      </div>
    </div>
  );
}
