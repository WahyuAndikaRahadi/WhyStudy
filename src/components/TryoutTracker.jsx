import React, { useState } from 'react';
import { useTracker } from '../TrackerContext';
import { useTheme } from '../ThemeContext';
import Swal from 'sweetalert2';
import { ArrowLeft, ClipboardList, Plus, Trash2, X, Check } from 'lucide-react';

export default function TryoutTracker({ onBack }) {
  const { tryoutEntries, addTryoutEntry, deleteTryoutEntry } = useTracker();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [platform, setPlatform] = useState('');
  const [nilaiMtk, setNilaiMtk] = useState('');
  const [nilaiBindo, setNilaiBindo] = useState('');
  const [nilaiInggris, setNilaiInggris] = useState('');
  const [nilaiPilihan1, setNilaiPilihan1] = useState('');
  const [nilaiPilihan2, setNilaiPilihan2] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!platform.trim()) {
      Swal.fire({
        title: 'Platform Kosong',
        text: 'Silakan isi nama platform penyelenggara tryout.',
        icon: 'warning',
        confirmButtonColor: '#2563eb',
        background: isDark ? '#0f172a' : '#ffffff',
        color: isDark ? '#f8fafc' : '#0f172a'
      });
      return;
    }

    const mtk = parseFloat(nilaiMtk) || 0;
    const bindo = parseFloat(nilaiBindo) || 0;
    const inggris = parseFloat(nilaiInggris) || 0;
    const pil1 = parseFloat(nilaiPilihan1) || 0;
    const pil2 = parseFloat(nilaiPilihan2) || 0;

    const scores = [mtk, bindo, inggris, pil1, pil2];
    const nonZeroScores = scores.filter(s => s > 0);
    
    if (scores.some(s => s > 100)) {
      Swal.fire({
        title: 'Nilai Tidak Valid',
        text: 'Nilai maksimal untuk setiap subjek adalah 100.',
        icon: 'error',
        confirmButtonColor: '#2563eb',
        background: isDark ? '#0f172a' : '#ffffff',
        color: isDark ? '#f8fafc' : '#0f172a'
      });
      return;
    }

    if (nonZeroScores.length === 0) {
      Swal.fire({
        title: 'Nilai Kosong',
        text: 'Masukkan minimal satu nilai mata pelajaran untuk disimpan.',
        icon: 'warning',
        confirmButtonColor: '#2563eb',
        background: isDark ? '#0f172a' : '#ffffff',
        color: isDark ? '#f8fafc' : '#0f172a'
      });
      return;
    }

    const rataRata = Math.round(nonZeroScores.reduce((a, b) => a + b, 0) / nonZeroScores.length);
    const id = Date.now().toString();

    addTryoutEntry({
      id,
      date,
      platform,
      nilaiMtk: mtk,
      nilaiBindo: bindo,
      nilaiInggris: inggris,
      nilaiPilihan1: pil1,
      nilaiPilihan2: pil2,
      rataRata
    });

    // Reset Form
    setPlatform('');
    setNilaiMtk('');
    setNilaiBindo('');
    setNilaiInggris('');
    setNilaiPilihan1('');
    setNilaiPilihan2('');
    setShowForm(false);

    Swal.fire({
      title: 'Berhasil!',
      text: 'Data tryout berhasil ditambahkan.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#f8fafc' : '#0f172a'
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Data Tryout?',
      text: 'Data yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#475569',
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#f8fafc' : '#0f172a'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTryoutEntry(id);
        Swal.fire({
          title: 'Terhapus!',
          text: 'Data tryout berhasil dihapus.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: isDark ? '#0f172a' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a'
        });
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Header and Back Button */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 transition-all cursor-pointer mr-1"
              title="Kembali ke Alat Bantu"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          <div className="p-3 bg-amber-600/10 rounded-xl text-amber-600 dark:text-amber-500">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-slate-200 font-extrabold text-lg sm:text-xl">Tracker Tryout</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">Catat dan pantau perkembangan skor tryout Anda</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm cursor-pointer transition-all self-start sm:self-center"
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" /> Batal
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Tambah Skor
            </>
          )}
        </button>
      </div>

      {/* Form Card (Inline Above) */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-5 transition-colors">
          <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">Input Data Tryout Baru</h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tanggal</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Platform Penyelenggara</label>
              <input
                type="text"
                required
                placeholder="misal: Ruangguru, Zenius"
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Nilai Matematika</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0 - 100"
                value={nilaiMtk}
                onChange={e => setNilaiMtk(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Nilai Bahasa Indonesia</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0 - 100"
                value={nilaiBindo}
                onChange={e => setNilaiBindo(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Nilai Bahasa Inggris</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0 - 100"
                value={nilaiInggris}
                onChange={e => setNilaiInggris(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Nilai Pilihan 1</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0 - 100"
                value={nilaiPilihan1}
                onChange={e => setNilaiPilihan1(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Nilai Pilihan 2</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0 - 100"
                value={nilaiPilihan2}
                onChange={e => setNilaiPilihan2(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-600"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2 px-4 rounded-xl cursor-pointer shadow-sm transition-all h-9.5 w-full"
            >
              <Check className="w-4 h-4" /> Simpan Data
            </button>
          </form>
        </div>
      )}

      {/* Tryout Scores Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-left font-bold text-slate-600 dark:text-slate-400 select-none">
                <th className="py-4 px-4 w-16 text-center">No</th>
                <th className="py-4 px-4">Tanggal</th>
                <th className="py-4 px-4">Platform</th>
                <th className="py-4 px-4 text-center">Nilai MTK</th>
                <th className="py-4 px-4 text-center">Nilai B.Indo</th>
                <th className="py-4 px-4 text-center">Nilai B.Inggris</th>
                <th className="py-4 px-4 text-center">Nilai Pilihan 1</th>
                <th className="py-4 px-4 text-center">Nilai Pilihan 2</th>
                <th className="py-4 px-4 text-center font-extrabold text-blue-600 dark:text-blue-500">Rata-Rata</th>
                <th className="py-4 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {tryoutEntries.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                    Belum ada data tryout. Mulai catat skor tryout pertama Anda.
                  </td>
                </tr>
              ) : (
                tryoutEntries.map((entry, index) => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-500 dark:text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {new Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">{entry.platform}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700 dark:text-slate-300">{entry.nilaiMtk || '-'}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700 dark:text-slate-300">{entry.nilaiBindo || '-'}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700 dark:text-slate-300">{entry.nilaiInggris || '-'}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700 dark:text-slate-300">{entry.nilaiPilihan1 || '-'}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700 dark:text-slate-300">{entry.nilaiPilihan2 || '-'}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-extrabold text-blue-600 dark:text-blue-500">{entry.rataRata}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 rounded-lg border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-650 dark:text-red-400 transition-all cursor-pointer"
                        title="Hapus Data Tryout"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
