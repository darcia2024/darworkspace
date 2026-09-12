import React, { useState } from 'react';
import {
  Check,
  Clock,
  Flame,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Zap,
  CheckCircle2,
  X,
  ArrowUpRight
} from 'lucide-react';
import { TodayBlock, ProjectCard } from '../types';
import { soundManager } from '../utils/audio';
import { parseProjectTitle } from '../utils/selectors';
import confetti from 'canvas-confetti';

interface TodaySuperSmallViewProps {
  todayBlocks: TodayBlock[];
  projects?: ProjectCard[];
  onToggleBlock: (id: string) => void;
  onStartFocus: (block: TodayBlock) => void;
  onAddBlock?: (block: Omit<TodayBlock, 'id'>) => void;
  onDeleteBlock?: (id: string) => void;
  onPullProject?: (project: ProjectCard) => void;
  onStartMultiFocus?: (blocks: TodayBlock[]) => void;
}

export const TodaySuperSmallView: React.FC<TodaySuperSmallViewProps> = ({
  todayBlocks,
  projects = [],
  onToggleBlock,
  onStartFocus,
  onAddBlock,
  onDeleteBlock,
  onPullProject,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newTimebox, setNewTimebox] = useState<number>(45);
  const [newRule, setNewRule] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  // Split into unfinished & completed tasks
  const unfinishedBlocks = todayBlocks.filter((b) => !b.isDone);
  const completedBlocks = todayBlocks.filter((b) => b.isDone);

  // Format today's date in friendly Indonesian
  const todayDateString = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Find active projects from Kanban board that are NOT yet in today's unfinished list
  const activeUnscheduledProjects = projects.filter((p) => {
    if (p.boardColumn !== 'DOING' && p.boardColumn !== 'QUEUE') return false;
    const alreadyInToday = unfinishedBlocks.some((b) => {
      if (b.projectId && b.projectId === p.id) return true;
      return b.projectName.trim().toLowerCase() === p.name.trim().toLowerCase();
    });
    return !alreadyInToday;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newAction.trim()) return;

    soundManager.playClick();
    onAddBlock?.({
      projectName: newProjectName.trim(),
      action: newAction.trim(),
      timeboxMinutes: newTimebox || 45,
      isDone: false,
      blockType: 'Deep Work 1',
      rule: newRule.trim() || 'Fokus eksekusi tugas ini sampai selesai.',
    });

    setNewProjectName('');
    setNewAction('');
    setNewTimebox(45);
    setNewRule('');
    setIsAdding(false);
  };

  const handlePullFromBoard = (project: ProjectCard) => {
    soundManager.playClick();
    if (onPullProject) {
      onPullProject(project);
    } else if (onAddBlock) {
      onAddBlock({
        projectId: project.id,
        projectName: project.name,
        action: project.nextAction || project.currentGoal || 'Eksekusi deliverable utama',
        timeboxMinutes: 45,
        isDone: false,
        blockType: project.lane === 'maintenance' ? 'Admin/Maintenance' : 'Deep Work 1',
        rule: project.rule || 'Fokus tuntaskan langkah konkrit ini.',
      });
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto animate-fade-in pb-12">
      {/* 1. TOP HEADER: CALM, EDITORIAL, & INFORMATIVE */}
      <header className="border-b border-zinc-200/80 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500">
              {todayDateString} · SIKAT HARI INI
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight mt-0.5">
              Kerjaan Hari Ini
            </h1>
            <div className="flex items-center gap-2.5 mt-2 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/80 text-amber-900 font-bold border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {unfinishedBlocks.length} Belum Selesai
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium border border-zinc-200">
                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                {completedBlocks.length} Selesai
              </span>
            </div>
          </div>

          {/* Quick Add Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setIsAdding((prev) => !prev);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111111] hover:bg-zinc-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isAdding ? 'Tutup Form' : 'Tambah Kerjaan'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. INLINE ADD FORM (SIMPLE & INTUITIVE) */}
      {isAdding && (
        <form
          onSubmit={handleCreateTask}
          className="bg-white border border-zinc-300/90 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700">
              // INPUT KERJAAN BARU HARI INI
            </h3>
            <span className="text-[11px] text-zinc-400 font-mono">Tekan Simpan setelah selesai</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-zinc-700 block">
                Nama Project / Klien
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Umi Elly - LMS Azhariyah"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-50/70 border border-zinc-200 rounded-xl text-zinc-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 block">
                Estimasi Waktu (Menit)
              </label>
              <input
                type="number"
                min="5"
                max="240"
                step="5"
                value={newTimebox}
                onChange={(e) => setNewTimebox(Number(e.target.value) || 45)}
                className="w-full px-3 py-2 text-sm bg-zinc-50/70 border border-zinc-200 rounded-xl text-zinc-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 block">
              Apa yang Harus Dilakukan Sekarang? (Aksi Konkrit)
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Selesaikan coding modul autentikasi dan review rilis live"
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-zinc-50/70 border border-zinc-200 rounded-xl text-zinc-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 block">
              Catatan / Aturan Khusus (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Matikan tab sosmed, fokus 45 menit penuh"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-zinc-50/70 border border-zinc-200 rounded-xl text-zinc-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#111111] hover:bg-zinc-800 text-white transition-all shadow-xs active:scale-95"
            >
              Simpan ke Kerjaan Hari Ini
            </button>
          </div>
        </form>
      )}

      {/* 3. SECTION UTAMA: DAFTAR KERJAAN BELUM SELESAI */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>TUGAS YANG HARUS DIKERJAKAN HARI INI ({unfinishedBlocks.length})</span>
          </h2>
          <span className="text-[11px] font-mono text-zinc-500">
            Klik tombol Mulai untuk masuk Kamar Fokus
          </span>
        </div>

        {/* JIKA TIDAK ADA TUGAS BELUM SELESAI */}
        {unfinishedBlocks.length === 0 && (
          <div className="bg-white border border-dashed border-zinc-300 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900">
                Semua Kerjaan Hari Ini Beres! 🎉
              </h3>
              <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
                Nggak ada tanggungan tugas hari ini bro. Lo bebas istirahat atau bisa tarik kerjaan baru dari papan project di bawah.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111111] hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kerjaan Baru</span>
              </button>
            </div>
          </div>
        )}

        {/* LIST KARTU TUGAS BELUM SELESAI */}
        <div className="space-y-3.5">
          {unfinishedBlocks.map((block) => {
            const parsed = parseProjectTitle(block.projectName);

            return (
              <div
                key={block.id}
                className="bg-white border border-zinc-200/90 hover:border-zinc-300 rounded-2xl p-5 sm:p-6 transition-all shadow-2xs space-y-3.5"
              >
                {/* Baris Atas: Kategori / Klien + Timebox */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {parsed.client ? (
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200/70">
                        {parsed.client}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200/70">
                        {block.blockType || 'DEEP WORK'}
                      </span>
                    )}

                    {parsed.detail && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-50 text-zinc-500 border border-zinc-200/50">
                        {parsed.detail}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-mono font-semibold text-zinc-600 flex items-center gap-1 bg-zinc-50 px-2.5 py-0.5 rounded-full border border-zinc-200/70">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>{block.timeboxMinutes || 45} Menit</span>
                  </span>
                </div>

                {/* Judul Project */}
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight leading-snug">
                    {parsed.title}
                  </h3>
                </div>

                {/* KOTAK UTAMA: HARUS NGAPAIN SEKARANG (PROMINENT & HIGH VISIBILITY) */}
                <div className="p-3.5 rounded-xl bg-[#fefce8]/70 border border-[#fef08a] space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#854d0e] uppercase tracking-wider">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>HARUS NGAPAIN SEKARANG:</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-[#111111] font-sans leading-relaxed">
                    {block.action}
                  </p>
                </div>

                {/* Catatan / Rule Singkat Bila Ada */}
                {block.rule && (
                  <div className="text-xs font-mono text-zinc-500 flex items-center gap-1.5 px-1">
                    <span className="text-emerald-700 font-bold">// CATATAN:</span>
                    <span className="text-zinc-700">{block.rule}</span>
                  </div>
                )}

                {/* Baris Tombol Aksi Langsung */}
                <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Primary CTA: Langsung Bawa ke Kamar Fokus */}
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        onStartFocus(block);
                      }}
                      className="h-9 px-4 rounded-xl bg-[#111111] hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs active:scale-95 group/btn"
                      title="Mulai sesi deep work timer untuk tugas ini"
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 group-hover/btn:scale-110 transition-transform" />
                      <span>Mulai di Kamar Fokus</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-white" />
                    </button>

                    {/* Secondary Action: Tandai Beres */}
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        soundManager.playCompletionChime();
                        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
                        onToggleBlock(block.id);
                      }}
                      className="h-9 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                      title="Tandai tugas ini sudah selesai"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                      <span>Tandai Beres</span>
                    </button>
                  </div>

                  {/* Tombol Hapus / Singkirkan dari Hari Ini */}
                  {onDeleteBlock && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus tugas "${block.projectName}" dari daftar hari ini?`)) {
                          soundManager.playClick();
                          onDeleteBlock(block.id);
                        }
                      }}
                      className="w-8 h-8 rounded-lg hover:bg-rose-50 text-zinc-400 hover:text-rose-600 flex items-center justify-center transition-colors"
                      title="Hapus dari daftar kerjaan hari ini"
                      aria-label="Hapus tugas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. TARIK CEPAT DARI PROJECT KANBAN (JIKA ADA PROJECT AKTIF BELUM DIJADWALKAN) */}
      {activeUnscheduledProjects.length > 0 && (
        <section className="bg-zinc-50/80 border border-zinc-200/80 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
              // TARIK CEPAT DARI PROJECT BERJALAN:
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              {activeUnscheduledProjects.length} Project Aktif
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeUnscheduledProjects.slice(0, 6).map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => handlePullFromBoard(project)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-semibold border border-zinc-200/90 flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
                title={`Tambahkan "${project.name}" ke tugas hari ini`}
              >
                <Plus className="w-3 h-3 text-zinc-500" />
                <span>{project.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 5. SECTION KERJAAN SUDAH SELESAI (COLLAPSIBLE, CLEAN, NO DISTRACTION) */}
      {completedBlocks.length > 0 && (
        <section className="pt-2 border-t border-zinc-200/70">
          <button
            type="button"
            onClick={() => setShowCompleted((prev) => !prev)}
            className="w-full flex items-center justify-between py-2 text-xs font-mono font-bold text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              {showCompleted ? (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              )}
              <span>SUDAH SELESAI HARI INI ({completedBlocks.length})</span>
            </div>
            <span className="text-[11px] text-zinc-400">
              {showCompleted ? 'Tutup' : 'Lihat'}
            </span>
          </button>

          {showCompleted && (
            <div className="mt-2 space-y-2 animate-fade-in">
              {completedBlocks.map((block) => (
                <div
                  key={block.id}
                  className="bg-zinc-50/80 border border-zinc-200/70 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-zinc-700 line-through truncate">
                        {block.projectName}
                      </h4>
                      <p className="text-[11px] text-zinc-500 line-through line-clamp-1">
                        {block.action}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        onToggleBlock(block.id);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-zinc-600 hover:text-black bg-white hover:bg-zinc-100 border border-zinc-200 flex items-center gap-1 transition-colors"
                      title="Kembalikan ke belum selesai"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Batal Selesai</span>
                    </button>

                    {onDeleteBlock && (
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          onDeleteBlock(block.id);
                        }}
                        className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus permanen dari daftar"
                        aria-label="Hapus tugas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
