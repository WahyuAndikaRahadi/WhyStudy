import { useTracker } from '../TrackerContext';
import { useTheme } from '../ThemeContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import { Award, Layers } from 'lucide-react';

const CHECKBOX_KEYS = ['catatan', 'latsol1', 'latsol2', 'latsol3', 'recall'];

function getSubjectStats(topics, subject) {
  const rows = topics[subject] || [];
  const total = rows.length * CHECKBOX_KEYS.length;
  const checked = rows.reduce(
    (sum, row) => sum + CHECKBOX_KEYS.filter((k) => row[k]).length,
    0
  );
  const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
  return { checked, total, percent };
}

function shortenName(name) {
  if (name.length <= 12) return name;
  return name.slice(0, 10) + '...';
}

export default function DashboardAnalytics() {
  const { topics, WAJIB_SUBJECTS, activeOptionalSubjects, tryoutEntries } = useTracker();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const activeSubjects = [
    ...WAJIB_SUBJECTS.map((s) => ({ name: s, category: 'TKA Wajib' })),
    ...activeOptionalSubjects.map((s) => ({ name: s, category: 'TKA Pilihan' })),
  ];

  const subjectData = activeSubjects.map((s) => ({
    ...s,
    ...getSubjectStats(topics, s.name),
  }));

  const barData = subjectData.map((s) => ({
    name: shortenName(s.name),
    fullName: s.name,
    percent: s.percent,
    category: s.category,
  }));

  const lineData = (tryoutEntries || []).map((entry) => ({
    date: entry.date,
    average: entry.rataRata,
  }));

  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const labelColor = isDark ? '#64748b' : '#475569';
  const tooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: isDark ? '#1e293b' : '#e2e8f0',
    color: isDark ? '#f1f5f9' : '#0f172a',
    borderRadius: '12px',
    fontSize: '12px',
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Subject Progress Cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layers size={20} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Progress Subjek Aktif
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectData.map((s) => {
            const isWajib = s.category === 'TKA Wajib';
            const accentBar = isWajib ? 'bg-blue-600' : 'bg-amber-500';
            const accentText = isWajib
              ? 'text-blue-600 dark:text-blue-500'
              : 'text-amber-600 dark:text-amber-500';
            const categoryBadge = isWajib
              ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
              : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20';

            return (
              <div
                key={s.name}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      {s.name}
                    </h3>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium ${categoryBadge}`}
                    >
                      {s.category}
                    </span>
                  </div>
                  <span className={`text-2xl font-bold font-mono ${accentText}`}>
                    {s.percent}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full ${accentBar} rounded-full transition-all duration-300`}
                    style={{ width: `${s.percent}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {s.checked} / {s.total} selesai
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart A: Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-[380px]">
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-blue-600" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Perbandingan Subjek Aktif
            </h3>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="name"
                tick={{ fill: labelColor, fontSize: 11 }}
                axisLine={{ stroke: gridColor }}
                tickLine={{ stroke: gridColor }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: labelColor, fontSize: 11 }}
                axisLine={{ stroke: gridColor }}
                tickLine={{ stroke: gridColor }}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="percent" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {barData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.category === 'TKA Wajib' ? '#2563eb' : '#d97706'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart B: Line Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-[380px]">
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-blue-600" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Grafik Perkembangan Tryout (Rata-rata)
            </h3>
          </div>
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={lineData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: labelColor, fontSize: 11 }}
                  axisLine={{ stroke: gridColor }}
                  tickLine={{ stroke: gridColor }}
                />
                <YAxis
                  tick={{ fill: labelColor, fontSize: 11 }}
                  axisLine={{ stroke: gridColor }}
                  tickLine={{ stroke: gridColor }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px', color: labelColor }} />
                <Line
                  type="monotone"
                  dataKey="average"
                  name="Rata-rata"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#2563eb' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[85%]">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Belum ada data tryout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
