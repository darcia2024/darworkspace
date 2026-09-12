import React, { useState } from 'react';
import {
  Flame,
  Clock,
  Check,
  CheckCircle2,
  Zap,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Hourglass,
  PauseCircle,
  Sparkles,
  ArrowLeft,
  BarChart3,
  FileText
} from 'lucide-react';
import { TodayBlock, ProjectCard } from '../types';
import { soundManager } from '../utils/audio';
import { parseProjectTitle } from '../utils/selectors';
import confetti from 'canvas-confetti';

interface TodaySuperSmallViewProps {
  todayBlocks: TodayBlock[];
  projects: ProjectCard[];
  onToggleBlock: (id: string) => void;
  onStartFocus: (block: TodayBlock) => void;
  onUpdateProject?: (project: ProjectCard) => void;
  onSetTodayBlock?: (block: TodayBlock) => void;
  onCompleteWork?: (blockOrProjectId: string) => void;
  onAddProject?: (project: Omit<ProjectCard, 'id'>) => void;
  onAddBlock?: (block: Omit<TodayBlock, 'id'>) => void;
  onDeleteBlock?: (id: string) => void;
  onPullProject?: (project: ProjectCard) => void;
}

type StandupStep =
  | 'overview'
  | 'select_project'
  | 'ask_status'
  | 'ask_action'
  | 'ask_blocker'
  | 'completed_done'
  | 'new_project'
  | 'summary';

export const TodaySuperSmallView: React.FC<TodaySuperSmallViewProps> = ({
  todayBlocks,
  projects = [],
  onToggleBlock,
  onStartFocus,
  onUpdateProject,
  onSetTodayBlock,
  onCompleteWork,
  onAddProject,
}) => {
  // Find current active (unfinished) today block if available
  const activeTodayBlock = todayBlocks.find((b) => !b.isDone) || null;

  // Standup navigation state: default to 'overview' if there's already an active focus, else 'select_project'
  const [currentStep, setCurrentStep] = useState<StandupStep>(() => {
    return activeTodayBlock ? 'overview' : 'select_project';
  });

  // Selected project for the questionnaire
  const [selectedProject, setSelectedProject] = useState<ProjectCard | null>(null);

  // Completed item details for the sync & rekap confirmation screen
  const [completedItem, setCompletedItem] = useState<{
    title: string;
    client?: string;
    action?: string;
  } | null>(null);

  // Form states for the questions
  const [actionInput, setActionInput] = useState('');
  const [timeboxMinutes, setTimeboxMinutes] = useState<number>(45);
  const [ruleInput, setRuleInput] = useState('');
  const [blockerReason, setBlockerReason] = useState('');

  // Form states for adding brand-new project
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectAction, setNewProjectAction] = useState('');
  const [newProjectTimebox, setNewProjectTimebox] = useState<number>(45);

  // Today's date in friendly Indonesian format
  const todayDateString = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Active projects in DOING or QUEUE
  const activeProjects = projects.filter(
    (p) => p.boardColumn === 'DOING' || p.boardColumn === 'QUEUE'
  );

  // STEP HANDLERS
  const handleSelectProject = (project: ProjectCard) => {
    soundManager.playClick();
    setSelectedProject(project);
    setActionInput(project.nextAction || project.currentGoal || '');
    setRuleInput(project.rule || '');
    setCurrentStep('ask_status');
  };

  const handleChooseGaspol = () => {
    soundManager.playClick();
    setCurrentStep('ask_action');
  };

  // Complete project from questionnaire
  const handleChooseDone = () => {
    if (!selectedProject) return;
    soundManager.playClick();
    soundManager.playCompletionChime();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

    const parsed = parseProjectTitle(selectedProject.name);
    setCompletedItem({
      title: parsed.title,
      client: parsed.client,
      action: selectedProject.nextAction || selectedProject.currentGoal || 'Pekerjaan deliverable',
    });

    if (onCompleteWork) {
      onCompleteWork(selectedProject.id);
    } else if (onUpdateProject) {
      const updated: ProjectCard = {
        ...selectedProject,
        boardColumn: 'DONE',
        status: 'Done',
        nextAction: 'Project telah selesai 100%! ✓',
      };
      onUpdateProject(updated);
    }

    setCurrentStep('completed_done');
  };

  // Quick complete directly from the project list
  const handleQuickCompleteProject = (project: ProjectCard) => {
    soundManager.playClick();
    soundManager.playCompletionChime();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

    const parsed = parseProjectTitle(project.name);
    setCompletedItem({
      title: parsed.title,
      client: parsed.client,
      action: project.nextAction || project.currentGoal || 'Pekerjaan deliverable',
    });

    if (onCompleteWork) {
      onCompleteWork(project.id);
    } else if (onUpdateProject) {
      const updated: ProjectCard = {
        ...project,
        boardColumn: 'DONE',
        status: 'Done',
        nextAction: 'Project telah selesai 100%! ✓',
      };
      onUpdateProject(updated);
    }

    setCurrentStep('completed_done');
  };

  // Complete currently active today block
  const handleCompleteCurrentBlock = () => {
    const blockToComplete = activeTodayBlock || todayBlocks[0];
    if (!blockToComplete) return;

    soundManager.playClick();
    soundManager.playCompletionChime();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

    const parsed = parseProjectTitle(blockToComplete.projectName);
    setCompletedItem({
      title: parsed.title,
      client: parsed.client,
      action: blockToComplete.action,
    });

    if (onCompleteWork) {
      onCompleteWork(blockToComplete.id);
    } else if (onToggleBlock) {
      onToggleBlock(blockToComplete.id);
    }

    setCurrentStep('completed_done');
  };

  const handleChooseWaiting = () => {
    soundManager.playClick();
    setBlockerReason(selectedProject?.blocker || 'Menunggu konfirmasi / respons klien');
    setCurrentStep('ask_blocker');
  };

  const handleChooseParked = () => {
    if (!selectedProject) return;
    soundManager.playClick();

    const updated: ProjectCard = {
      ...selectedProject,
      boardColumn: 'PARKED',
      status: 'Parked',
    };
    onUpdateProject?.(updated);
    setSelectedProject(null);
    setCurrentStep('select_project');
  };

  const handleSaveBlocker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    soundManager.playClick();
    const updated: ProjectCard = {
      ...selectedProject,
      boardColumn: 'WAITING',
      status: 'Waiting Client',
      blocker: blockerReason.trim() || 'Menunggu konfirmasi klien',
      nextAction: `Follow-up: ${blockerReason.trim() || 'Menunggu konfirmasi klien'}`,
    };
    onUpdateProject?.(updated);

    setSelectedProject(null);
    setCurrentStep('select_project');
  };

  const handleSaveActionAndLock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !actionInput.trim()) return;

    soundManager.playClick();

    // 1. Update project nextAction & ensure boardColumn is DOING
    const updatedProject: ProjectCard = {
      ...selectedProject,
      boardColumn: 'DOING',
      status: 'Doing',
      nextAction: actionInput.trim(),
      rule: ruleInput.trim() || selectedProject.rule,
    };
    onUpdateProject?.(updatedProject);

    // 2. Lock as active today block
    const newBlock: TodayBlock = {
      id: `tb-${Date.now()}`,
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      action: actionInput.trim(),
      timeboxMinutes: timeboxMinutes || 45,
      isDone: false,
      blockType: selectedProject.lane === 'maintenance' ? 'Admin/Maintenance' : 'Deep Work 1',
      rule: ruleInput.trim() || 'Fokus eksekusi tugas ini sampai selesai.',
    };

    onSetTodayBlock?.(newBlock);
    setCurrentStep('summary');
  };

  const handleCreateNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newProjectAction.trim()) return;

    soundManager.playClick();
    const newProj: Omit<ProjectCard, 'id'> = {
      name: newProjectName.trim(),
      lane: 'client_delivery',
      boardColumn: 'DOING',
      status: 'Doing',
      paymentStatus: 'Expected',
      valueText: 'Proyek Baru',
      nominalNumeric: 0,
      paidNumeric: 0,
      unpaidNumeric: 0,
      priority: 'P1',
      currentGoal: newProjectAction.trim(),
      nextAction: newProjectAction.trim(),
    };

    onAddProject?.(newProj);

    const newBlock: TodayBlock = {
      id: `tb-${Date.now()}`,
      projectName: newProjectName.trim(),
      action: newProjectAction.trim(),
      timeboxMinutes: newProjectTimebox || 45,
      isDone: false,
      blockType: 'Deep Work 1',
      rule: 'Fokus tuntaskan langkah awal ini.',
    };

    onSetTodayBlock?.(newBlock);
    setCurrentStep('summary');
  };

  // Get active focus block for summary / overview
  const displayedBlock = activeTodayBlock || todayBlocks[0];
  const displayedParsed = displayedBlock ? parseProjectTitle(displayedBlock.projectName) : null;

  return (
    <div className="w-full max-w-xl mx-auto py-4 sm:py-8 font-sans animate-fade-in">
      {/* 1. COMPACT STANDUP BRANDING & DATE */}
      <div className="text-center space-y-1 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[11px] font-mono font-bold uppercase tracking-wider border border-zinc-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>DAILY STANDUP · {todayDateString}</span>
        </div>
        <p className="text-xs text-zinc-500">
          Update fokus & status kerjaan lo biar arah eksekusi hari ini jelas dan rekap selalu tersinkron.
        </p>
      </div>

      {/* =========================================================================
          SCREEN: OVERVIEW WITH THE DIRECT COMPLETION QUESTION
          ========================================================================= */}
      {currentStep === 'overview' && displayedBlock && (
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in text-center">
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/70 inline-block">
              ⚡ PEKERJAAN HARI INI
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
              {displayedParsed?.title}
            </h2>
            {displayedParsed?.client && (
              <span className="text-xs font-mono font-bold text-zinc-500 block uppercase">
                // KLIEN: {displayedParsed.client}
              </span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-left space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
              TARGET PEKERJAAN:
            </span>
            <p className="text-sm sm:text-base font-bold text-[#111111] leading-relaxed">
              {displayedBlock.action}
            </p>
            <div className="flex items-center gap-1 text-xs font-mono text-zinc-500 pt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Timebox: {displayedBlock.timeboxMinutes} Menit</span>
            </div>
          </div>

          {/* THE CORE QUESTION */}
          <div className="py-3 px-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-center space-y-1">
            <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
              PERTANYAAN UPDATE HARI INI
            </span>
            <h3 className="text-lg sm:text-xl font-black text-emerald-950">
              Apakah pekerjaan ini sudah selesai bro?
            </h3>
          </div>

          {/* PRIMARY BUTTON: YES, IT'S DONE! */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleCompleteCurrentBlock}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg active:scale-98 group"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
              <span>✓ Ya, Pekerjaan Ini Sudah Selesai 100%!</span>
            </button>

            {/* SECONDARY OPTIONS IF NOT FINISHED */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onStartFocus(displayedBlock);
                }}
                className="w-full h-11 rounded-2xl bg-[#111111] hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98"
              >
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Belum, Sikat di Kamar Fokus</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  const p = projects.find(
                    (proj) =>
                      proj.id === displayedBlock.projectId ||
                      proj.name === displayedBlock.projectName
                  );
                  if (p) setSelectedProject(p);
                  handleChooseWaiting();
                }}
                className="w-full h-11 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Hourglass className="w-4 h-4 text-amber-600" />
                <span>Belum, Lagi Nunggu Klien</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setCurrentStep('select_project');
              }}
              className="w-full h-11 rounded-2xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 font-semibold text-xs transition-all active:scale-98"
            >
              🔄 Cek / Update Kerjaan Lain
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          QUESTION 1: PILIH PROJECT YANG MAU DI-UPDATE
          ========================================================================= */}
      {currentStep === 'select_project' && (
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              UPDATE KERJAAN
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
              Gimana bro, ada pekerjaan yang sudah selesai hari ini?
            </h2>
            <p className="text-xs text-zinc-500">
              Klik &quot;Selesai&quot; untuk langsung sinkronkan ke board &amp; rekap, atau pilih kartu untuk update status:
            </p>
          </div>

          {/* List of active projects */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {activeProjects.map((project) => {
              const parsed = parseProjectTitle(project.name);

              return (
                <div
                  key={project.id}
                  onClick={() => handleSelectProject(project)}
                  className="w-full text-left p-4 rounded-2xl border border-zinc-200/80 hover:border-black hover:bg-zinc-50/80 transition-all shadow-2xs group flex items-start justify-between gap-3 cursor-pointer active:scale-99"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {parsed.client && (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200/60">
                          {parsed.client}
                        </span>
                      )}
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
                        {project.boardColumn}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-zinc-900 group-hover:text-black leading-snug truncate">
                      {parsed.title}
                    </h3>

                    <p className="text-xs text-zinc-500 line-clamp-1 font-mono">
                      Next: {project.nextAction || 'Belum ditentukan'}
                    </p>
                  </div>

                  {/* QUICK COMPLETE BUTTON */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    <button
                      type="button"
                      title="Tandai pekerjaan ini selesai 100%"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickCompleteProject(project);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 text-[11px] font-bold font-mono transition-all flex items-center gap-1 active:scale-95 shadow-2xs"
                    >
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>Selesai</span>
                    </button>
                    <div className="w-7 h-7 rounded-full bg-zinc-100 group-hover:bg-[#111111] group-hover:text-white flex items-center justify-center text-zinc-400 shrink-0 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}

            {activeProjects.length === 0 && (
              <div className="p-8 text-center space-y-3 border border-dashed border-emerald-300 bg-emerald-50/50 rounded-3xl">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h3 className="text-lg font-bold text-emerald-950">Semua Kerjaan Beres Bro! 🎉</h3>
                <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                  Tidak ada kerjaan aktif yang menggantung. Mau santai sejenak atau mulai kerjaan baru?
                </p>
              </div>
            )}
          </div>

          {/* Button: Ketik Kerjaan Baru */}
          <div className="pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setCurrentStep('new_project');
              }}
              className="w-full py-3 rounded-2xl border border-dashed border-zinc-300 hover:border-black text-xs font-bold text-zinc-700 hover:text-black flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ketik Kerjaan / Klien Baru</span>
            </button>
          </div>

          {activeTodayBlock && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setCurrentStep('overview')}
                className="text-xs text-zinc-500 hover:text-black underline font-mono"
              >
                ← Kembali ke pertanyaan fokus hari ini
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          QUESTION 2: STATUS PROJECT INI SEKARANG
          ========================================================================= */}
      {currentStep === 'ask_status' && selectedProject && (
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep('select_project')}
              className="text-xs font-mono text-zinc-500 hover:text-black flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ganti Project</span>
            </button>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              UPDATE STATUS
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-mono font-bold uppercase text-zinc-500">
              PROJECT: {selectedProject.name}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
              Apakah pekerjaan ini sudah selesai bro?
            </h2>
            <p className="text-xs text-zinc-500">
              Pilih status untuk otomatis memperbarui papan dan rekap pekerjaan lo:
            </p>
          </div>

          {/* 4 Status Option Cards */}
          <div className="space-y-3">
            {/* 1. Udah Selesai 100% (PRIMARY / PROMINENT) */}
            <button
              type="button"
              onClick={handleChooseDone}
              className="w-full text-left p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-950 transition-all flex items-center justify-between group active:scale-98 shadow-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-extrabold">✓ Ya, Udah Selesai 100%! 🎉</span>
                </div>
                <p className="text-xs text-emerald-700">
                  Deliverable tuntas &amp; langsung tersinkron ke Papan Board, Target, dan Rekap Laporan.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-200/80 px-2.5 py-1 rounded-full shrink-0">
                Pindah ke DONE
              </span>
            </button>

            {/* 2. Mau Gaspol Hari Ini */}
            <button
              type="button"
              onClick={handleChooseGaspol}
              className="w-full text-left p-4 rounded-2xl border border-zinc-900 bg-zinc-900 text-white hover:bg-black transition-all flex items-center justify-between group active:scale-98 shadow-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold">Belum, Mau Gaspol Hari Ini!</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Tentukan langkah konkrit dan lanjut eksekusi di Kamar Fokus.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white" />
            </button>

            {/* 3. Lagi Nunggu Klien */}
            <button
              type="button"
              onClick={handleChooseWaiting}
              className="w-full text-left p-4 rounded-2xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 text-amber-950 transition-all flex items-center justify-between group active:scale-98"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Hourglass className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-bold">Belum, Lagi Nunggu Klien</span>
                </div>
                <p className="text-xs text-amber-700">
                  Tertahan nunggu approval, DP/pelunasan, atau materi konten.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-full">
                Pindah ke Radar
              </span>
            </button>

            {/* 4. Mau Diparkir Dulu */}
            <button
              type="button"
              onClick={handleChooseParked}
              className="w-full text-left p-4 rounded-2xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100/80 text-zinc-800 transition-all flex items-center justify-between group active:scale-98"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <PauseCircle className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm font-semibold">Mau Diparkir Dulu</span>
                </div>
                <p className="text-xs text-zinc-500">
                  Prioritas diturunkan sementara dari radar aktif.
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-600 bg-zinc-200/70 px-2.5 py-1 rounded-full">
                Pindah ke Parked
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          QUESTION 3: LANGKAH KONKRIT & TIMEBOX (JIKA GASPOL)
          ========================================================================= */}
      {currentStep === 'ask_action' && selectedProject && (
        <form
          onSubmit={handleSaveActionAndLock}
          className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep('ask_status')}
              className="text-xs font-mono text-zinc-500 hover:text-black flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              LANGKAH TERAKHIR
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-mono font-bold uppercase text-zinc-500">
              PROJECT: {selectedProject.name}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
              Langkah konkrit apa yang HARUS lo beresin hari ini?
            </h2>
            <p className="text-xs text-zinc-500">
              Tulis aksi yang spesifik biar pas lo buka laptop langsung jalan tanpa mikir dua kali:
            </p>
          </div>

          {/* Action Input Box */}
          <div className="space-y-1.5">
            <textarea
              required
              rows={3}
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              placeholder="Contoh: Selesaikan slicing layout checkout & integrasikan API payment..."
              className="w-full p-3.5 text-sm bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all leading-relaxed"
              autoFocus
            />
          </div>

          {/* Timebox Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 block">
              Berapa lama mau kunci waktu di Kamar Fokus?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { mins: 25, label: '25m', desc: 'Sprint' },
                { mins: 45, label: '45m', desc: 'Standar' },
                { mins: 60, label: '60m', desc: 'Deep Work' },
                { mins: 90, label: '90m', desc: 'Ultra Focus' },
              ].map((item) => (
                <button
                  key={item.mins}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setTimeboxMinutes(item.mins);
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    timeboxMinutes === item.mins
                      ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                      : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                  }`}
                >
                  <strong className="block text-sm font-bold font-mono">{item.label}</strong>
                  <span className="text-[10px] block opacity-80">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Rule */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 font-semibold block">
              Aturan / Catatan Khusus (Opsional):
            </label>
            <input
              type="text"
              value={ruleInput}
              onChange={(e) => setRuleInput(e.target.value)}
              placeholder="Contoh: Matikan sosmed & tab lain selama sprint"
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-12 rounded-2xl bg-[#111111] hover:bg-zinc-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <span>Kunci Kerjaan & Tampilkan Hasil</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          SCREEN: ASK BLOCKER (JIKA LAGI NUNGGU KLIEN)
          ========================================================================= */}
      {currentStep === 'ask_blocker' && selectedProject && (
        <form
          onSubmit={handleSaveBlocker}
          className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep('ask_status')}
              className="text-xs font-mono text-zinc-500 hover:text-black flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
            <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider">
              PINDAH KE WAITING RADAR
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
              Apa yang lagi ditunggu dari klien bro?
            </h2>
            <p className="text-xs text-zinc-500">
              Project ini akan diparkir di Waiting Radar agar tidak membebani pikiran lo:
            </p>
          </div>

          {/* Quick chips for reasons */}
          <div className="flex flex-wrap gap-2">
            {[
              'Menunggu Pelunasan / DP',
              'Menunggu Revisi Desain',
              'Menunggu Bahan & Konten',
              'Menunggu Jadwal Meeting / Kickoff',
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setBlockerReason(chip)}
                className="px-3 py-1 rounded-full text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium transition-colors"
              >
                + {chip}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <input
              type="text"
              required
              value={blockerReason}
              onChange={(e) => setBlockerReason(e.target.value)}
              placeholder="Ketik alasan blocker..."
              className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
              autoFocus
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-11 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98"
            >
              <span>Pindahkan ke Radar Waiting</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          SCREEN: COMPLETED DONE & FULL SYNC REKAP CONFIRMATION
          ========================================================================= */}
      {currentStep === 'completed_done' && (
        <div className="bg-white border border-emerald-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-mono font-bold uppercase tracking-wider border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>STATUS TERSINKRON KE SELURUH SISTEM &amp; REKAP</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
              Mantap Bro! Pekerjaan Resmi Selesai! 🎉
            </h2>
            <p className="text-sm font-medium text-zinc-600">
              <strong className="text-zinc-900">
                {completedItem?.title || selectedProject?.name || displayedParsed?.title || 'Pekerjaan'}
              </strong>{' '}
              {completedItem?.client ? `(Klien: ${completedItem.client}) ` : ''}resmi tuntas 100%!
            </p>
          </div>

          {/* SINKRONISASI REKAP CARD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200/90 text-left space-y-3">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
              REKAP DATA YANG OTOMATIS TERSINKRON:
            </span>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-zinc-200/70 shadow-2xs">
                <span className="text-zinc-600 font-sans font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Papan Kanban (Board):
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                  KOLOM DONE (SELESAI) ✓
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-zinc-200/70 shadow-2xs">
                <span className="text-zinc-600 font-sans font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Target Hari Ini (Daily Standup):
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                  TUNTAS 100% ✓
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-zinc-200/70 shadow-2xs">
                <span className="text-zinc-600 font-sans font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Rekap &amp; Laporan Project:
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                  TERCATAT SELESAI ✓
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-zinc-200/70 shadow-2xs">
                <span className="text-zinc-600 font-sans font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Beban Kerja Aktif:
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                  OTOMATIS BERKURANG ✓
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setSelectedProject(null);
                setCompletedItem(null);
                setCurrentStep('select_project');
              }}
              className="w-full h-12 rounded-2xl bg-[#111111] hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <span>🎯 Lanjut Pilih Kerjaan Hari Ini Berikutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  window.location.hash = '#/lanes';
                }}
                className="h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <BarChart3 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Lihat di Board</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  window.location.hash = '#/updates';
                }}
                className="h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                <span>Lihat Rekap Laporan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN: NEW PROJECT FORM
          ========================================================================= */}
      {currentStep === 'new_project' && (
        <form
          onSubmit={handleCreateNewProject}
          className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep('select_project')}
              className="text-xs font-mono text-zinc-500 hover:text-black flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Batal</span>
            </button>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              TAMBAH PROJECT BARU
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
              Ketik Kerjaan / Klien Baru
            </h2>
            <p className="text-xs text-zinc-500">
              Project ini akan dibuatkan kartu di Kanban board dan langsung jadi fokus hari ini:
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 block">
                Nama Project & Klien
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi - Landing Page Web"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 block">
                Aksi Konkrit Pertama Hari Ini
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Bikin mockup header & sketsa sitemap..."
                value={newProjectAction}
                onChange={(e) => setNewProjectAction(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 block">
                Estimasi Waktu Fokus (Menit)
              </label>
              <input
                type="number"
                min="5"
                max="240"
                step="5"
                value={newProjectTimebox}
                onChange={(e) => setNewProjectTimebox(Number(e.target.value) || 45)}
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-12 rounded-2xl bg-[#111111] hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <span>Simpan & Kunci Hari Ini</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          SCREEN: SUMMARY LAUNCH PAD
          ========================================================================= */}
      {currentStep === 'summary' && displayedBlock && (
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
              ✓ FOKUS HARI INI BERHASIL DIKUNCI
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
              {displayedParsed?.title}
            </h2>
            {displayedParsed?.client && (
              <span className="text-xs font-mono font-bold text-zinc-500 block uppercase">
                // KLIEN: {displayedParsed.client}
              </span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-[#fefce8]/70 border border-[#fef08a] text-left space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#854d0e] uppercase tracking-wider block">
              AKSI UTAMA LO HARI INI:
            </span>
            <p className="text-sm sm:text-base font-bold text-[#111111] leading-relaxed">
              {displayedBlock.action}
            </p>
            <div className="flex items-center gap-1 text-xs font-mono text-zinc-500 pt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Target: {displayedBlock.timeboxMinutes} Menit</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onStartFocus(displayedBlock);
              }}
              className="w-full h-12 rounded-2xl bg-[#111111] hover:bg-zinc-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 group"
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
              <span>Langsung Sikat di Kamar Fokus</span>
              <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-white" />
            </button>

            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setCurrentStep('select_project');
                }}
                className="text-xs font-mono text-zinc-600 hover:text-black font-semibold"
              >
                📝 Update Project Lain
              </button>
              <span className="text-zinc-300">·</span>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setCurrentStep('ask_action');
                }}
                className="text-xs font-mono text-zinc-600 hover:text-black font-semibold"
              >
                ↺ Ubah Aksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
