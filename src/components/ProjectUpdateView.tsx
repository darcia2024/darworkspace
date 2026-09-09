import React, { useMemo, useState } from 'react';
import {
  Newspaper,
  Compass,
  ArrowUpRight,
  Clipboard,
  Download,
  Share2,
  Bookmark,
  ExternalLink,
  Search,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Eye,
  MessageCircle,
  FileText,
  SlidersHorizontal,
  Clock,
  Send,
  Layers,
  Sparkles
} from 'lucide-react';
import { DaruWorkOSState, ProjectCard } from '../types';

interface ProjectUpdateViewProps {
  state: DaruWorkOSState;
  onSelectTab: (tab: string) => void;
  onUpdateProject?: (project: ProjectCard) => void;
}

const laneLabelMap: Record<string, string> = {
  client_delivery: 'Client Delivery',
  maintenance: 'Maintenance',
  bizdev: 'Business Dev',
  own_product: 'Core Product',
  operations: 'Operations',
  parking_lot: 'Archive / Parked',
};

const columnBadgeMap: Record<string, { label: string; bg: string; text: string; border: string }> = {
  DOING: { label: 'In Production', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
  QUEUE: { label: 'Upcoming Sprint', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  WAITING: { label: 'Waiting Client', bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' },
  DONE: { label: '100% Deployed', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  PARKED: { label: 'Parked', bg: 'bg-zinc-100', text: 'text-zinc-600', border: 'border-zinc-200' },
};

// Fallback high-res editorial poster images per category / project type
const projectVisuals: Record<string, string> = {
  'p-el-massa': 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1400&auto=format&fit=crop', // Kaaba / Pilgrimage
  'p-pgs-tour': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1400&auto=format&fit=crop', // Luxury Travel / Airplane
  'p-umi-elly': 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1400&auto=format&fit=crop', // Education / LMS
  'p-barber': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1400&auto=format&fit=crop', // Barber / Grooming
  'p-hamasah-ai': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1400&auto=format&fit=crop', // Abstract AI Tech
  'p-kael-product': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1400&auto=format&fit=crop', // Dashboard / SaaS
  'p-ifdony-azharuna': 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1400&auto=format&fit=crop', // Calligraphy / Brand
  default: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1400&auto=format&fit=crop', // Modern architecture
};

const getProjectVisual = (project: ProjectCard) => {
  return projectVisuals[project.id] || projectVisuals.default;
};

// Generates an editorial headline with storytelling flair
const getEditorialHeadline = (project: ProjectCard) => {
  if (project.id === 'p-pgs-tour') {
    return 'Website PGS Tour & Travel 100% Siap Tayang: Dari Redesign Elegan Sampai Sistem Booking yang Lebih Meyakinkan!';
  }
  if (project.id === 'p-el-massa') {
    return 'Katalog Web El Massa 100% Siap Tempur: Dari 12 Paket Ibadah Live Sampai Mesin Konversi Otomatis!';
  }
  if (project.id === 'p-umi-elly') {
    return 'Sprint Modul LMS Azhariyah Bareng Umi Elly: Saatnya Kurikulum Digital Mengudara!';
  }
  if (project.id === 'p-barber') {
    return 'Sistem POS Kasir & Loyalty Barber Sukses Berlayar: Full Deployed & 100% Lunas Tanpa Drama';
  }
  if (project.id === 'p-kael-product') {
    return 'Bongkar Dapur KAEL SaaS: Setting Kasir, QRIS Static, & Jalur Demo Biar Cepat Closing';
  }
  if (project.id === 'p-ifdony-azharuna') {
    return 'Eksplorasi Identitas Visual Azharuna: Meramu Simbol Peradaban & Tipografi Modern';
  }
  if (project.id === 'p-dreammecca') {
    return 'DreamMecca Platform Beres Tuntas: Bebas Utang Deliverable & Pikiran Plong';
  }
  if (project.id === 'p-ibrahim-visa') {
    return 'Radar Visa Entry Student Kairo: Berkas Lengkap, Kawal Pembayaran Sampai Cair';
  }
  if (project.id === 'p-laptopbisnis') {
    return 'Branding Laptopbisnis Rampung: Desain Lunas, Handover Master Asset Tanpa Cela';
  }
  if (project.id === 'p-zalvice') {
    return 'Evolusi Identitas Zalvice: Visual Tuntas, Siap Meluncur ke Fase Produksi';
  }
  if (project.boardColumn === 'DONE') {
    return `Kisah Sukses ${project.name}: Tuntas di Garis Finis & Siap Buka Babak Baru`;
  }
  if (project.boardColumn === 'DOING') {
    return `Gaspol Dapur Produksi ${project.name}: Menembus Sasaran Utama & Kunci Kualitas`;
  }
  if (project.boardColumn === 'WAITING') {
    return `Kawal Radar ${project.name}: Menanti Respons Klien Sambil Jaga Ritme Kas`;
  }
  if (project.currentGoal && project.currentGoal.length > 15) {
    return `${project.name}: ${project.currentGoal.split('.')[0]}`;
  }
  return `Laporan Eksklusif & Catatan Lapangan: ${project.name}`;
};

// Generates dynamic storytelling body for any project
const getStorytellingBody = (project: ProjectCard): string => {
  if (project.newsArticle && project.newsArticle.trim().length > 30) {
    return project.newsArticle;
  }

  const laneName = laneLabelMap[project.lane] || project.lane;
  const isDone = project.boardColumn === 'DONE';
  const isDoing = project.boardColumn === 'DOING';
  const isWaiting = project.boardColumn === 'WAITING';
  const nominal = project.nominalNumeric > 0 ? `Rp${project.nominalNumeric.toLocaleString('id-ID')}` : null;
  const paid = project.paidNumeric > 0 ? `Rp${project.paidNumeric.toLocaleString('id-ID')}` : null;
  const unpaid = project.unpaidNumeric > 0 ? `Rp${project.unpaidNumeric.toLocaleString('id-ID')}` : null;

  return `Setiap proyek di workspace ini punya kisah perjuangannya sendiri, dan saat ini **${project.name}** lagi jadi sorotan utama di jalur **${laneName}**. Bukan sekadar tugas checklist biasa, ini adalah salah satu tumpuan strategis yang nentuin laju cashflow dan reputasi kerja nyata tim kita di mata klien.

### 1. Misi Utama & Tantangan yang Mau Ditaklukkan
Latar belakang kenapa proyek ini digarap bukan cuma buat kelihatan sibuk, tapi buat menyelesaikan problem nyata di lapangan:
- **Sasaran Utama**: ${project.currentGoal || 'Mengeksekusi deliverable utama dengan standar visual dan fungsi yang presisi.'}
${project.definitionOfDone ? `- **Kriteria Selesai (DoD)**: ${project.definitionOfDone}` : '- **Kriteria Selesai (DoD)**: Menyelesaikan seluruh checkpoint kerjaan tanpa ada bug atau komplain susulan.'}
${project.rule ? `- **Aturan Main Eksekusi**: "${project.rule}"` : ''}

### 2. Dapur Lapangan & Status Produksi Terkini
Saat ini proyek resmi berstatus **${project.status}** (${project.boardColumn}) dengan tingkat prioritas **${project.priority}**.
${isDone ? 'Kabar gembira! Semua tahapan pengerjaan utama sudah berhasil diselesaikan dengan hasil ciamik. Tim berhasil melewati fase revisi dan kini proyek sudah berada di garis finis dengan deliverable yang solid.' : isDoing ? 'Mesin produksi lagi dipacu kencang! Tim fokus membereskan deliverable inti dan memastikan setiap detail teknis maupun visual berjalan mulus tanpa membuang waktu.' : isWaiting ? 'Proyek lagi berada di fase radar penantian (waiting line). Bola saat ini ada di pihak eksternal, jadi kunci utamanya adalah menjaga ritme follow-up yang santun tapi tegas biar antrean gak membeku.' : 'Proyek tercatat rapi di antrean sprint dan siap disikat begitu slot kerja utama terbuka.'}

### 3. Radar Finansial & Garis Finis
${nominal ? `Secara komersial, proyek ini bernilai kontrak **${nominal}**${paid ? `, dengan dana yang sudah berhasil mendarat di kas sebesar **${paid}**` : ''}${unpaid ? `, dan sisa piutang yang wajib dikawal sebesar **${unpaid}**` : ''}.` : 'Proyek ini berperan sebagai aset strategis internal yang memperkuat pondasi ekosistem operasional tim.'}
${project.billingMilestone ? `Target pencapaian pembayaran berikutnya terkunci pada: **${project.billingMilestone}**.` : ''}`;
};

// Generates dynamic storytelling critique for any project
const getStorytellingCritique = (project: ProjectCard): string => {
  if (project.newsCritique && project.newsCritique.trim().length > 20) {
    return project.newsCritique;
  }

  if (project.unpaidNumeric > 0) {
    return `🔥 **Reality Check Redaksi**: Ada tagihan menggantung sebesar Rp${project.unpaidNumeric.toLocaleString('id-ID')}! Jangan pernah anggap pekerjaan ini beres cuma karena kodingan atau desain udah diserahkan. Cuan nyata adalah yang sudah mendarat di mutasi rekening. Kirim invoice resmi dan kunci tanggal komitmen transfer dari klien hari ini juga!`;
  }
  if (project.boardColumn === 'WAITING') {
    return `⚠️ **Peringatan Radar Redaksi**: Proyek ini lagi nunggu respons pihak luar. Hati-hati jebakan 'nunggu pasif'! Kalau dalam 2x24 jam gak ada kabar, segera layangkan follow-up santai via WhatsApp biar proyek gak mangkrak dan slot kerjaan lu gak terhambat.`;
  }
  if (!project.definitionOfDone) {
    return `⚠️ **Titik Buta Operasional**: Proyek ini belum punya Kriteria Selesai (DoD) yang eksplisit! Ini bahaya banget karena bisa memicu scope creep (klien nambah-nambah permintaan tanpa bayar ekstra). Tulis batasan selesai sekarang juga!`;
  }
  if (project.boardColumn === 'DONE') {
    return `✨ **Catatan Redaksi**: Proyek sudah berstatus tuntas dan aman. Jangan biarkan begitu saja—segera dokumentasikan hasil kerja ini ke format portofolio atau studi kasus buat amankan deal-deal berikutnya yang nilainya lebih gede!`;
  }
  return `Pertahankan fokus eksekusi satu arah. Hindari multitasking liar yang bikin energi terpecah, dan tuntaskan langkah berikutnya sebelum berpindah ke proyek lain.`;
};

// Inline formatting helper (supports **bold**, *italic*, `code`)
const renderInlineFormattedText = (text: string) => {
  if (!text) return null;
  const regex = /(\*\*[^*]+?\*\*|`[^`]+?`|\*[^*]+?\*)/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={idx} className="font-semibold text-zinc-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-[12px] sm:text-[13px] font-mono border border-zinc-200/70"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={idx} className="italic text-zinc-700">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
};

const parseTableRow = (line: string): string[] => {
  let cleaned = line.trim();
  if (cleaned.startsWith('|')) cleaned = cleaned.slice(1);
  if (cleaned.endsWith('|')) cleaned = cleaned.slice(0, -1);
  return cleaned.split('|').map((cell) => cell.trim());
};

const parseAlignments = (line: string): ('text-left' | 'text-center' | 'text-right')[] => {
  const cells = parseTableRow(line);
  return cells.map((cell) => {
    const trimmed = cell.trim();
    if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'text-center';
    if (trimmed.endsWith(':')) return 'text-right';
    return 'text-left';
  });
};

const isTableBlock = (text: string): boolean => {
  const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  return (
    lines.length >= 2 &&
    lines.some((l) => l.includes('|') && /\|?\s*[-:]{2,}/.test(l))
  );
};

const renderMarkdownTable = (block: string, key: number | string) => {
  const lines = block
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && l.includes('|'));

  if (lines.length < 2) return null;

  const sepIdx = lines.findIndex(
    (l) => l.includes('---') || /\|?\s*[-:]{2,}\s*\|/.test(l)
  );
  if (sepIdx <= 0) return null;

  const headerLine = lines[sepIdx - 1];
  const sepLine = lines[sepIdx];
  const dataLines = lines.slice(sepIdx + 1);

  const headers = parseTableRow(headerLine);
  const alignments = parseAlignments(sepLine);

  return (
    <div
      key={key}
      className="my-5 w-full overflow-x-auto rounded-xl border border-zinc-200/90 bg-white shadow-2xs"
    >
      <table className="w-full min-w-[580px] text-left text-xs sm:text-sm text-zinc-700 border-collapse">
        <thead className="bg-zinc-50/90 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-800 border-b border-zinc-200">
          <tr>
            {headers.map((h, hIdx) => (
              <th
                key={hIdx}
                className={`px-3.5 py-3 font-semibold ${alignments[hIdx] || 'text-left'}`}
              >
                {renderInlineFormattedText(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 text-xs sm:text-sm">
          {dataLines.map((rowLine, rIdx) => {
            const cells = parseTableRow(rowLine);
            return (
              <tr
                key={rIdx}
                className={
                  rIdx % 2 === 0
                    ? 'bg-white hover:bg-zinc-50/70 transition-colors'
                    : 'bg-zinc-50/35 hover:bg-zinc-50/70 transition-colors'
                }
              >
                {cells.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className={`px-3.5 py-2.5 leading-relaxed text-zinc-700 ${
                      alignments[cIdx] || 'text-left'
                    }`}
                  >
                    {renderInlineFormattedText(cell)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Formats content paragraphs, markdown tables, headers, dividers, quotes, and lists cleanly
const renderFormattedBody = (content: string) => {
  if (!content) return null;

  // Normalize newlines and ensure headers and dividers stand as separate sections
  const normalized = content
    .replace(/\r\n/g, '\n')
    .replace(/(^|\n)(#{2,3}\s+[^\n]+)/g, '$1\n$2\n')
    .replace(/(^|\n)(---|\*\*\*)(\n|$)/g, '$1\n$2\n$3');

  const sections = normalized
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-5 text-sm sm:text-[15px] font-normal leading-[1.8] text-zinc-600 tracking-[-0.01em]">
      {sections.map((section, idx) => {
        const trimmed = section;

        // Divider --- or ***
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={idx} className="my-7 border-t border-zinc-200" />;
        }

        // Heading 2 ##
        if (trimmed.startsWith('## ')) {
          return (
            <h2
              key={idx}
              className="mt-8 mb-4 text-base sm:text-lg font-medium tracking-tight text-zinc-900 border-b border-zinc-100 pb-2.5 flex items-center gap-2.5"
            >
              <span className="inline-block w-1.5 h-4 bg-rose-500 rounded-full shrink-0" />
              <span>{renderInlineFormattedText(trimmed.replace(/^##\s*/, ''))}</span>
            </h2>
          );
        }

        // Subheading ###
        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={idx}
              className="mt-6 mb-3 text-sm sm:text-base font-medium tracking-tight text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2"
            >
              <span className="inline-block w-1.5 h-3.5 bg-rose-400 rounded-full shrink-0" />
              <span>{renderInlineFormattedText(trimmed.replace(/^###\s*/, ''))}</span>
            </h3>
          );
        }

        // Blockquote >
        if (trimmed.startsWith('>')) {
          const quoteContent = trimmed
            .split('\n')
            .map((line) => line.replace(/^>\s?/, ''))
            .join(' ');
          return (
            <blockquote
              key={idx}
              className="my-5 rounded-xl border-l-4 border-rose-500 bg-rose-50/60 px-4 py-3 text-xs sm:text-sm font-medium text-zinc-800 leading-relaxed shadow-2xs"
            >
              {renderInlineFormattedText(quoteContent)}
            </blockquote>
          );
        }

        // Markdown Table
        if (isTableBlock(trimmed)) {
          return renderMarkdownTable(trimmed, idx);
        }

        // Numbered list (e.g. 1. , 2. )
        if (/^\d+\.\s/.test(trimmed)) {
          const lines = trimmed.split('\n');
          return (
            <ol key={idx} className="my-3 space-y-2.5 text-xs sm:text-sm leading-relaxed">
              {lines.map((line, lIdx) => {
                const match = line.trim().match(/^(\d+)\.\s+(.*)$/);
                if (!match) {
                  return line.trim() ? (
                    <p key={lIdx} className="text-zinc-600 pl-7">
                      {renderInlineFormattedText(line.trim())}
                    </p>
                  ) : null;
                }
                const num = match[1];
                const text = match[2];
                return (
                  <li key={lIdx} className="flex items-start gap-2.5 text-zinc-600">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                      {num}
                    </span>
                    <span className="flex-1 min-w-0">{renderInlineFormattedText(text)}</span>
                  </li>
                );
              })}
            </ol>
          );
        }

        // Bullet lists (- )
        if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
          const lines = trimmed.split('\n');
          return (
            <ul key={idx} className="my-3 space-y-2.5 text-xs sm:text-sm leading-relaxed">
              {lines.map((line, lIdx) => {
                const isBullet = line.trim().startsWith('- ');
                const text = isBullet ? line.trim().replace(/^-\s*/, '') : line.trim();
                if (!text) return null;

                return (
                  <li key={lIdx} className="flex items-start gap-2.5 text-zinc-600">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span className="flex-1 min-w-0">{renderInlineFormattedText(text)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Standard Paragraph
        return (
          <p key={idx} className="first-of-type:text-[15px] first-of-type:leading-relaxed text-zinc-700">
            {renderInlineFormattedText(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const ProjectUpdateView: React.FC<ProjectUpdateViewProps> = ({ state, onSelectTab }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedNotice, setCopiedNotice] = useState<string>('');
  const [savedBookmark, setSavedBookmark] = useState<boolean>(false);

  // Filter projects with content or meaningful update
  const allProjects = useMemo(() => {
    return state.projects || [];
  }, [state.projects]);

  // Active selected project
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    // Prefer p-el-massa or first doing project
    const elMassa = allProjects.find((p) => p.id === 'p-el-massa');
    if (elMassa) return elMassa.id;
    const doing = allProjects.find((p) => p.boardColumn === 'DOING');
    return doing ? doing.id : allProjects[0]?.id || '';
  });

  // Active project data
  const currentProject = useMemo(() => {
    return allProjects.find((p) => p.id === activeProjectId) || allProjects[0];
  }, [allProjects, activeProjectId]);

  // Filter categories
  const categories = useMemo(() => {
    const list = [
      { id: 'all', label: 'Semua Liputan', count: allProjects.length },
      { id: 'client_delivery', label: 'Client Delivery', count: allProjects.filter((p) => p.lane === 'client_delivery').length },
      { id: 'own_product', label: 'Core Product (SaaS)', count: allProjects.filter((p) => p.lane === 'own_product').length },
      { id: 'maintenance', label: 'Maintenance', count: allProjects.filter((p) => p.lane === 'maintenance').length },
      { id: 'bizdev', label: 'Business Dev', count: allProjects.filter((p) => p.lane === 'bizdev').length },
      { id: 'operations', label: 'Operations', count: allProjects.filter((p) => p.lane === 'operations').length },
    ];
    return list.filter((c) => c.count > 0 || c.id === 'all');
  }, [allProjects]);

  // Filter projects by category and search
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.lane === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.currentGoal && p.currentGoal.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.nextAction && p.nextAction.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [allProjects, selectedCategory, searchQuery]);

  // Related projects list (excluding current project)
  const relatedProjects = useMemo(() => {
    return allProjects.filter((p) => p.id !== currentProject?.id).slice(0, 6);
  }, [allProjects, currentProject]);

  // Copy handler
  const handleCopySummary = async () => {
    if (!currentProject) return;
    const shareText = `*${getEditorialHeadline(currentProject)}*\n\nStatus: ${currentProject.boardColumn} (${currentProject.status})\nTarget: ${currentProject.currentGoal}\nNext Action: ${currentProject.nextAction}\n\nVia Daru Work OS`;
    await navigator.clipboard.writeText(shareText);
    setCopiedNotice('Teks berita berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedNotice(''), 3000);
  };

  // Download handler
  const handleDownloadReport = () => {
    if (!currentProject) return;
    const content = `# ${getEditorialHeadline(currentProject)}
Tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
Kategori: ${laneLabelMap[currentProject.lane] || currentProject.lane}
Status: ${currentProject.boardColumn} (${currentProject.status})

## Rangkuman Laporan & Storytelling
${getStorytellingBody(currentProject)}

## Rekomendasi Langkah Nyata (Next Step)
${currentProject.nextAction || 'Tentukan langkah konkret eksekusi di board.'}

## Kritik & Evaluasi Redaksi
${getStorytellingCritique(currentProject)}
`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' }));
    link.download = `editorial-${currentProject.id}-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(link.href);
    setCopiedNotice('Dokumen editorial berhasil diunduh!');
    setTimeout(() => setCopiedNotice(''), 3000);
  };

  if (!currentProject) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center font-['Plus_Jakarta_Sans']">
        <Newspaper className="w-12 h-12 text-zinc-300 mb-3" />
        <p className="text-zinc-600 font-normal">Belum ada data project untuk dimuat.</p>
      </div>
    );
  }

  const badgeInfo = columnBadgeMap[currentProject.boardColumn] || columnBadgeMap.DOING;
  const projectImg = getProjectVisual(currentProject);

  return (
    <div className="w-full font-['Plus_Jakarta_Sans'] font-normal text-zinc-800 antialiased">
      {/* 1. TOP EDITORIAL BAR (Matching Reference Screenshot) */}
      <div className="w-full rounded-2xl border border-zinc-200/80 bg-white p-4 sm:px-6 sm:py-3.5 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand Logo & Editorial Section */}
          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-zinc-950">NEWS</span>
              <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                Dispatch
              </span>
            </div>

            {/* Quick Top Navigation Links */}
            <nav className="hidden md:flex items-center gap-5 text-xs text-zinc-500">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`transition-colors hover:text-zinc-900 ${
                  selectedCategory === 'all' ? 'font-semibold text-zinc-950' : ''
                }`}
              >
                Semua Proyek
              </button>
              <button
                onClick={() => setSelectedCategory('client_delivery')}
                className={`transition-colors hover:text-zinc-900 ${
                  selectedCategory === 'client_delivery' ? 'font-semibold text-zinc-950' : ''
                }`}
              >
                Client Delivery
              </button>
              <button
                onClick={() => onSelectTab('lanes')}
                className="transition-colors hover:text-zinc-900 flex items-center gap-1 text-zinc-500"
              >
                <span>Workflow Board</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </nav>
          </div>

          {/* Search Box & Board Jump Button */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari berita atau project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full border border-zinc-200 bg-zinc-50 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all font-normal"
              />
            </div>

            <button
              onClick={() => onSelectTab('lanes')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors border border-zinc-200 shrink-0"
              title="Buka Board Penuh"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN EDITORIAL THREE-COLUMN FLEXBOX LAYOUT (Resilient, No Collapsing) */}
      <div className="w-full flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
        
        {/* =========================================================================
            LEFT COLUMN (~220px): USER CAPSULE & CATEGORIES (Matches Reference Left)
            ========================================================================= */}
        <aside className="w-full lg:w-52 xl:w-56 shrink-0 space-y-4">
          {/* Author / Editorial Profile Capsule Card */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white font-medium text-xs shadow-xs">
                  DW
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-zinc-900 tracking-tight truncate">Daru Redaksi</h4>
                <p className="text-[11px] text-zinc-400 font-normal truncate">Lead OS Engine</p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Total Liputan</span>
              <span className="font-semibold text-zinc-900">{allProjects.length} Proyek</span>
            </div>
          </div>

          {/* Category Navigation List */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold tracking-tight text-zinc-900 uppercase">
              Category
            </h3>
            <nav className="space-y-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl transition-all text-left font-normal ${
                      isActive
                        ? 'bg-rose-50 text-rose-600 font-medium'
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                    }`}
                  >
                    <span className="truncate">{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-rose-500 text-white font-semibold'
                          : 'text-zinc-400 bg-zinc-100'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Context & Board Jump */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-zinc-900">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-medium">Navigasi Workspace</h4>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-500 font-normal">
              Liputan berita dipetakan otomatis dari database proyek dan radar keuangan aktif.
            </p>
            <div className="pt-2 border-t border-zinc-100 flex flex-col gap-1 text-xs">
              <button
                onClick={() => onSelectTab('lanes')}
                className="w-full text-left py-1 text-zinc-600 hover:text-zinc-950 flex items-center justify-between"
              >
                <span>Markas Project</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
              <button
                onClick={() => onSelectTab('waiting')}
                className="w-full text-left py-1 text-zinc-600 hover:text-zinc-950 flex items-center justify-between"
              >
                <span>Radar Tagihan</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
              <button
                onClick={() => onSelectTab('money')}
                className="w-full text-left py-1 text-zinc-600 hover:text-zinc-950 flex items-center justify-between"
              >
                <span>Cek Dompet & Kas</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
          </div>
        </aside>

        {/* =========================================================================
            CENTER COLUMN: MAIN ARTICLE & EDITORIAL PROSE (Matches Reference Center)
            flex-1 min-w-0 ensures no horizontal squishing
            ========================================================================= */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* Category Breadcrumb Kicker */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600">
              <span>{laneLabelMap[currentProject.lane] || currentProject.lane}</span>
              <span className="text-zinc-300">·</span>
              <span className="text-zinc-400 normal-case font-normal">Liputan Khusus Lapangan</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${badgeInfo.bg} ${badgeInfo.text} ${badgeInfo.border}`}
              >
                {badgeInfo.label}
              </span>
              <span className="text-[11px] text-zinc-400 font-normal">
                Prioritas {currentProject.priority}
              </span>
            </div>
          </div>

          {/* Hero Visual Card (16:9 ratio like reference) */}
          <div className="relative overflow-hidden rounded-2xl bg-zinc-950 aspect-video shadow-md border border-zinc-200/60 group">
            <img
              src={projectImg}
              alt={currentProject.name}
              className="w-full h-full object-cover object-center opacity-90 transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

            {/* Media floating tag */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-white border border-white/10">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Live Operational
              </span>
            </div>

            {/* Bottom media title strip */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-xs uppercase tracking-wider text-zinc-300 font-medium">
                {currentProject.valueText || 'Production Asset'}
              </p>
              <h3 className="text-base sm:text-lg font-medium text-white line-clamp-1">
                {currentProject.name}
              </h3>
            </div>
          </div>

          {/* Editorial Metadata Strip & Actions (Matching Screenshot) */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-b border-zinc-100 pb-4">
            {/* Stats badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-normal">
              <span className="inline-flex items-center gap-1 text-zinc-600">
                <Eye className="w-3.5 h-3.5 text-zinc-400" />
                100% Siap
              </span>
              <span className="inline-flex items-center gap-1 text-zinc-600">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {currentProject.followUpDeadline || 'Jadwal Hari Ini'}
              </span>
              <span className="inline-flex items-center gap-1 text-zinc-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Tersinkronisasi Git
              </span>
            </div>

            {/* Article Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSavedBookmark(!savedBookmark)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-normal border transition-colors ${
                  savedBookmark
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                }`}
                title="Simpan Catatan Berita"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{savedBookmark ? 'Tersimpan' : 'Simpan'}</span>
              </button>

              <button
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-normal bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 transition-colors"
                title="Bagikan Ringkasan"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan</span>
              </button>
            </div>
          </div>

          {/* Copied Notice Banner */}
          {copiedNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-between">
              <span>{copiedNotice}</span>
              <button
                onClick={() => setCopiedNotice('')}
                className="text-emerald-500 hover:text-emerald-900 font-medium text-xs"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Editorial Main Headline (Light / Regular Plus Jakarta Sans) */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-normal leading-[1.3] tracking-[-0.03em] text-zinc-950">
              {getEditorialHeadline(currentProject)}
            </h1>
            
            {/* Author byline */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-normal">
              <span>Oleh <strong className="font-medium text-zinc-700">Tim Redaksi Daru Work OS</strong></span>
              <span>·</span>
              <span>Diperbarui 10 September 2026</span>
            </div>
          </div>

          {/* Article Prose Body */}
          <div className="prose prose-zinc max-w-none pt-2">
            {renderFormattedBody(getStorytellingBody(currentProject))}
          </div>

          {/* =======================================================================
              CRITICAL SECTION 1: SARAN LANGKAH NYATA BERIKUTNYA (NEXT STEP)
              ======================================================================= */}
          <section className="rounded-2xl border border-emerald-200/90 bg-emerald-50/50 p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-emerald-950">
                  Saran Langkah Nyata Berikutnya (Next Step)
                </h3>
                <p className="text-xs text-emerald-700 font-normal">
                  Aksi konkret prioritas yang wajib dieksekusi selanjutnya
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-emerald-100 shadow-2xs space-y-2">
              <div className="text-sm text-zinc-800 font-normal leading-relaxed">
                {renderFormattedBody(
                  currentProject.nextAction ||
                    'Tentukan satu aksi konkret follow-up atau serah terima di board proyek.'
                )}
              </div>
              {currentProject.billingMilestone && (
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-medium text-zinc-700">Target Milestone:</span>
                  <span className="text-emerald-700 font-semibold">{currentProject.billingMilestone}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <button
                onClick={() => onSelectTab('lanes')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors shadow-xs"
              >
                <span>Buka di Board & Eksekusi</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              {currentProject.boardColumn === 'WAITING' && (
                <button
                  onClick={() => onSelectTab('waiting')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 font-normal transition-colors"
                >
                  <span>Cek Radar Tagihan</span>
                </button>
              )}
            </div>
          </section>

          {/* =======================================================================
              CRITICAL SECTION 2: KRITIK & EVALUASI REDAKSI (EDITORIAL CRITIQUE)
              ======================================================================= */}
          <section className="rounded-2xl border border-rose-200/90 bg-rose-50/50 p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-rose-950">
                  Kritik & Evaluasi Redaksi
                </h3>
                <p className="text-xs text-rose-700 font-normal">
                  Peringatan risiko, titik buta operasional, dan acuan evaluasi
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-rose-100 shadow-2xs">
              <div className="text-sm text-zinc-700 font-normal leading-relaxed">
                {renderFormattedBody(getStorytellingCritique(currentProject))}
              </div>
              {currentProject.unpaidNumeric > 0 && !currentProject.newsCritique && (
                <p className="mt-2.5 pt-2 border-t border-zinc-100 text-xs text-rose-600 font-medium">
                  ⚠️ Tagihan belum tertagih: Rp{currentProject.unpaidNumeric.toLocaleString('id-ID')} (Jaga arus kas nyata sebelum menganggap ini sebagai pendapatan masuk).
                </p>
              )}
            </div>
          </section>

          {/* Action Bar Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-200">
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadReport}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 text-white text-xs font-medium hover:bg-zinc-800 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Dokumen Berita (.md)</span>
              </button>
              <button
                onClick={handleCopySummary}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 text-xs font-normal hover:bg-zinc-50 transition-colors"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Salin Teks Berita</span>
              </button>
            </div>

            <button
              onClick={() => onSelectTab('lanes')}
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-normal"
            >
              <span>Kelola Status di Markas Proyek</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN (~280-320px): "RELATED NEWS" (Matches Reference Right)
            shrink-0 ensures no squishing
            ========================================================================= */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">
          {/* Column Header matching reference screenshot */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
            <h2 className="text-base font-bold tracking-tight text-zinc-950">
              Related <span className="font-light text-zinc-500">News</span>
            </h2>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-xs text-zinc-400 hover:text-zinc-900 font-normal transition-colors"
            >
              See all
            </button>
          </div>

          {/* List of Other Projects (Card format matching reference screenshot) */}
          <div className="space-y-3.5">
            {relatedProjects.map((project) => {
              const pBadge = columnBadgeMap[project.boardColumn] || columnBadgeMap.DOING;
              const pThumb = getProjectVisual(project);
              const isSelected = project.id === activeProjectId;

              return (
                <div
                  key={project.id}
                  onClick={() => {
                    setActiveProjectId(project.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`group cursor-pointer rounded-2xl border transition-all duration-200 p-3 bg-white hover:shadow-md ${
                    isSelected
                      ? 'border-rose-300 ring-2 ring-rose-100'
                      : 'border-zinc-200/80 hover:border-zinc-300'
                  }`}
                >
                  {/* Thumbnail banner */}
                  <div className="relative overflow-hidden rounded-xl bg-zinc-900 aspect-[16/9] mb-2.5">
                    <img
                      src={pThumb}
                      alt={project.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-medium text-white line-clamp-1">
                      {laneLabelMap[project.lane] || project.lane}
                    </span>
                  </div>

                  {/* Metadata & Tag */}
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${pBadge.bg} ${pBadge.text}`}
                    >
                      {pBadge.label}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      P{project.priority.replace('P', '')}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-medium text-zinc-900 leading-snug group-hover:text-rose-600 transition-colors line-clamp-2">
                    {getEditorialHeadline(project)}
                  </h4>

                  {/* Action sneak peek */}
                  <p className="mt-1.5 text-[11px] text-zinc-500 line-clamp-1 font-normal">
                    Next: {project.nextAction || 'Tinjau progres'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick Summary Widget */}
          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 space-y-2">
            <h4 className="text-xs font-semibold text-zinc-900">Tentang Redaksi Proyek</h4>
            <p className="text-[11px] leading-relaxed text-zinc-500 font-normal">
              Setiap proyek dipetakan menjadi format berita dengan narasi mendalam, saran aksi nyata berikutnya, dan catatan kritik redaksi agar tidak ada deliverable yang terbengkalai.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
