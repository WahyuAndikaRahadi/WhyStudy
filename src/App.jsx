import React, { useState, useEffect } from 'react';
import { TrackerProvider, useTracker, ALL_PILIHAN_SUBJECTS } from './TrackerContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import CountdownTimer from './components/CountdownTimer';
import PomodoroWidget from './components/PomodoroWidget';
import TryoutTracker from './components/TryoutTracker';
import SubjectTable from './components/SubjectTable';
import DashboardAnalytics from './components/DashboardAnalytics';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Wrench,
  Sun, Moon, ChevronRight, SlidersHorizontal,
  Clock, ClipboardList, CheckSquare, Square,
  Menu, X
} from 'lucide-react';

const WAJIB_SUBJECTS = ['Matematika Wajib', 'Bahasa Indonesia', 'Bahasa Inggris'];

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 }
};

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const { activeOptionalSubjects, toggleSubjectActivation } = useTracker();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('Beranda');
  const [category, setCategory] = useState('TKA Wajib');
  const [subject, setSubject] = useState('Matematika Wajib');
  const [showConfig, setShowConfig] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (category === 'TKA Wajib') {
      if (!WAJIB_SUBJECTS.includes(subject)) setSubject('Matematika Wajib');
    } else {
      if (!activeOptionalSubjects.includes(subject)) {
        setSubject(activeOptionalSubjects[0] || 'Matematika Lanjut');
      }
    }
  }, [category, activeOptionalSubjects, subject]);

  const navItems = [
    { id: 'Beranda', label: 'Beranda', icon: LayoutDashboard },
    { id: 'Belajar', label: 'Belajar', icon: BookOpen },
    { id: 'Alat Bantu', label: 'Alat Bantu', icon: Wrench }
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

      {/* ═══════════ NAVBAR ═══════════ */}
      <header className={`border-b sticky top-0 z-30 backdrop-blur-md transition-colors duration-200 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex flex-col select-none cursor-pointer" onClick={() => { setActiveTab('Beranda'); setActiveTool(null); setIsMenuOpen(false); }}>
            <h1 className="font-extrabold text-xl tracking-tight leading-none text-blue-600 dark:text-blue-500">WhyStudy</h1>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-550'} mt-0.5`}>TKA Progress Tracker</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => { setActiveTab(id); if (id !== 'Alat Bantu') setActiveTool(null); }}
                className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === id ? 'bg-blue-600 text-white shadow-sm' : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                <Icon className="w-4 h-4" /><span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className={`p-2.5 rounded-xl transition-all cursor-pointer border ${isDark ? 'border-slate-800 hover:bg-slate-800 text-amber-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'}`}
              title={isDark ? 'Light Mode' : 'Dark Mode'}>
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Mobile Hamburger Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className={`md:hidden p-2.5 rounded-xl border transition-all cursor-pointer ${isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'}`}
              title="Menu">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`md:hidden border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button key={id} 
                    onClick={() => { 
                      setActiveTab(id); 
                      if (id !== 'Alat Bantu') setActiveTool(null); 
                      setIsMenuOpen(false); 
                    }}
                    className={`flex items-center gap-2.5 w-full py-3 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === id ? 'bg-blue-600 text-white' : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ═══════════ MAIN ═══════════ */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <AnimatePresence mode="wait">

          {/* ── PAGE A: BERANDA ── */}
          {activeTab === 'Beranda' && (
            <motion.div key="beranda" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="flex flex-col gap-8 w-full">
              <CountdownTimer />
              <DashboardAnalytics />
            </motion.div>
          )}

          {/* ── PAGE B: BELAJAR ── */}
          {activeTab === 'Belajar' && (
            <motion.div key="belajar" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="flex flex-col gap-6 w-full">
              {/* Selector Bar */}
              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-end gap-4 transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex flex-col gap-1.5 w-full sm:w-1/3">
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>Kategori TKA</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className={`border rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-blue-600 w-full cursor-pointer ${isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                    <option value="TKA Wajib">TKA Wajib</option>
                    <option value="TKA Pilihan">TKA Pilihan</option>
                  </select>
                </div>
                <div className="hidden sm:flex items-center pb-2.5"><ChevronRight className={`w-5 h-5 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} /></div>
                <div className="flex flex-col gap-1.5 w-full sm:flex-1">
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-655'}`}>Mata Pelajaran</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)}
                    className={`border rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-blue-600 w-full cursor-pointer ${isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                    {category === 'TKA Wajib'
                      ? WAJIB_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)
                      : activeOptionalSubjects.map(s => <option key={s} value={s}>{s}</option>)
                    }
                  </select>
                </div>
                <button onClick={() => setShowConfig(!showConfig)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer whitespace-nowrap ${showConfig ? 'bg-blue-600 border-blue-600 text-white' : isDark ? 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                  <SlidersHorizontal className="w-4 h-4" /> Atur Subjek
                </button>
              </div>

              {/* Subject Config Panel */}
              <AnimatePresence>
                {showConfig && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className={`p-6 rounded-2xl border transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <h4 className={`text-sm font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Konfigurasi TKA Pilihan Aktif</h4>
                      <p className={`text-xs font-medium mt-1 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Pilih subjek pilihan yang Anda ambil. Subjek nonaktif tidak dihitung dalam progress dashboard.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {ALL_PILIHAN_SUBJECTS.map(subj => {
                          const isActive = activeOptionalSubjects.includes(subj);
                          return (
                            <button key={subj} onClick={() => toggleSubjectActivation(subj)}
                              className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${isActive ? 'bg-blue-600/10 border-blue-500/30 text-blue-600 dark:text-blue-400' : isDark ? 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'}`}>
                              {isActive ? <CheckSquare className="w-4 h-4 flex-shrink-0" /> : <Square className="w-4 h-4 flex-shrink-0" />}
                              <span className="truncate">{subj}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <SubjectTable subject={subject} />
            </motion.div>
          )}

          {/* ── PAGE C: ALAT BANTU ── */}
          {activeTab === 'Alat Bantu' && (
            <motion.div key="alatbantu" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="w-full">
              <AnimatePresence mode="wait">
                {activeTool === null && (
                  <motion.div key="tools-dir" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto flex flex-col gap-6">
                    <div>
                      <h2 className={`text-xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Direktori Alat Bantu</h2>
                      <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Pilih alat bantu untuk menunjang aktivitas belajar Anda.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Pomodoro Card */}
                      <button onClick={() => setActiveTool('pomodoro')}
                        className={`w-full text-left p-6 rounded-2xl border flex flex-col gap-3 transition-all cursor-pointer ${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                        <div className="p-3 bg-blue-600/10 rounded-xl text-blue-600 dark:text-blue-500 w-fit"><Clock className="w-6 h-6" /></div>
                        <h3 className={`font-extrabold text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Asisten Pomodoro</h3>
                        <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Kelola fokus belajar terstruktur Anda dengan teknik Pomodoro yang dapat dikustomisasi.</p>
                      </button>
                      {/* Tryout Card */}
                      <button onClick={() => setActiveTool('tryout')}
                        className={`w-full text-left p-6 rounded-2xl border flex flex-col gap-3 transition-all cursor-pointer ${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                        <div className="p-3 bg-amber-600/10 rounded-xl text-amber-600 dark:text-amber-500 w-fit"><ClipboardList className="w-6 h-6" /></div>
                        <h3 className={`font-extrabold text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Tracker Tryout</h3>
                        <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Catat dan pantau perkembangan skor tryout TKA Anda secara sistematis.</p>
                      </button>
                    </div>
                  </motion.div>
                )}
                {activeTool === 'pomodoro' && (
                  <motion.div key="pomo-ws" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <PomodoroWidget onBack={() => setActiveTool(null)} />
                  </motion.div>
                )}
                {activeTool === 'tryout' && (
                  <motion.div key="tryout-ws" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <TryoutTracker onBack={() => setActiveTool(null)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className={`border-t py-6 text-center text-xs select-none transition-colors ${isDark ? 'border-slate-900 bg-slate-900/30 text-slate-500' : 'border-slate-200 bg-slate-100/50 text-slate-500'}`}>
        <p>WhyStudy &copy; 2026 &mdash; Dibuat oleh Wahyu Andika Rahadi</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TrackerProvider>
        <AppContent />
      </TrackerProvider>
    </ThemeProvider>
  );
}
