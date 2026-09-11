import { ArrowDown, ArrowRight, BarChart3, Check, ClipboardPenLine, Lightbulb } from "lucide-react";

const processSteps = [
  { number: "01", icon: ClipboardPenLine, title: "Catat aktivitas", description: "Masukkan data kolam, siklus, pengeluaran, dan panen dari mana saja.", output: "Data tersimpan rapi" },
  { number: "02", icon: BarChart3, title: "PondFlow menghitung", description: "Data dirangkum menjadi HPP, margin, FCR, dan tren performa.", output: "Angka siap dianalisis" },
  { number: "03", icon: Lightbulb, title: "Ambil keputusan", description: "Gunakan insight untuk menekan biaya dan membuat siklus berikutnya lebih sehat.", output: "Aksi lebih terarah" },
];

export function ProcessSection() {
  return (
    <section data-section="cara-kerja" className="scroll-mt-24 overflow-hidden bg-[#0b2638] px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-[.78fr_1.22fr] lg:items-start lg:gap-24">
          <div className="lg:sticky lg:top-28">
            <p className="flex items-center gap-3 text-sm font-extrabold uppercase tracking-[.18em] text-cyan-300"><span className="h-px w-8 bg-cyan-300" /> Alur yang sederhana</p>
            <h2 className="mt-5 max-w-md text-4xl font-black leading-[1.05] tracking-[-.04em] sm:text-5xl">Fokus ke kolam. Biar angka yang bicara.</h2>
            <p className="mt-6 max-w-md text-base leading-8 text-slate-400">PondFlow mengikuti ritme kerja di lapangan—praktis saat mencatat, jelas saat membaca hasil, dan membantu Anda menentukan langkah berikutnya.</p>
            <div className="mt-9 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-slate-200"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-300/15 text-cyan-300"><Check size={16} /></span> Dari aktivitas harian menjadi insight bisnis</div>
          </div>

          <div className="relative">
            <div className="absolute bottom-12 left-6 top-12 w-px bg-gradient-to-b from-cyan-300/70 via-cyan-300/30 to-transparent" />
            <div className="space-y-4">
              {processSteps.map(({ number, icon: Icon, title, description, output }, index) => (
                <div key={number} className="group relative grid grid-cols-[52px_1fr] gap-5 rounded-3xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-300/30 hover:bg-white/[0.07] sm:grid-cols-[64px_1fr] sm:gap-7 sm:p-5">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/30 bg-[#0b2638] text-cyan-300 shadow-[0_0_0_7px_#0b2638] transition group-hover:bg-cyan-300 group-hover:text-[#0b2638]"><Icon size={20} /></div>
                  <div className="py-1"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="text-xs font-black tracking-[.18em] text-cyan-300">{number}</span><h3 className="text-xl font-extrabold text-white">{title}</h3></div><span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200">{output}</span></div><p className="mt-3 max-w-xl leading-7 text-slate-400">{description}</p>{index < processSteps.length - 1 && <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500"><ArrowDown size={14} className="text-cyan-300" /> lanjut ke tahap berikutnya</div>}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-4"><div><p className="text-xs font-bold uppercase tracking-wider text-cyan-200">Hasil akhirnya</p><p className="mt-1 text-sm font-extrabold text-white">Operasional lebih terkendali, keputusan lebih percaya diri.</p></div><ArrowRight className="hidden text-cyan-300 sm:block" size={20} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
