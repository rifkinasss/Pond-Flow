import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Calculator, Check, ChevronDown, ClipboardList, Sparkles } from "lucide-react";

const useCases = [
  { icon: BriefcaseBusiness, title: "Pemilik usaha budidaya", text: "Pantau biaya, performa kolam, dan hasil panen tanpa harus membuka banyak catatan." },
  { icon: ClipboardList, title: "Manajer operasional", text: "Pastikan aktivitas harian, siklus, dan target panen setiap lokasi tetap terkendali." },
  { icon: Calculator, title: "Pembukuan bisnis", text: "Dapatkan data pengeluaran, pendapatan, HPP, dan margin yang siap menjadi laporan." },
];

const faqs = [
  ["Apakah PondFlow bisa digunakan dari HP?", "Bisa. PondFlow berjalan sebagai web app yang responsif, PWA, dan tersedia dalam bentuk aplikasi Android."],
  ["Apakah data usaha saya aman?", "Data dibatasi berdasarkan akun dan sesi pengguna. PondFlow juga menggunakan database SQLite self-hosted agar penyimpanan dapat dikontrol sendiri."],
  ["Apakah fitur IoT sudah tersedia?", "Integrasi IoT masih Coming Soon dan saat ini dipersiapkan untuk workflow pribadi menggunakan sensor dan auto-feeder ESP32."],
  ["Apakah PondFlow cocok untuk usaha kecil?", "Cocok. PondFlow dirancang mulai dari satu kolam, lalu dapat berkembang ke multi-lokasi dan banyak siklus."],
];

export function LandingConversionSections() {
  return (
    <>
      <section className="bg-[#f4fbfc] px-6 py-20 text-slate-900 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-sm font-extrabold uppercase tracking-[.18em] text-teal-600">Dibuat untuk pekerjaan nyata</p><h2 className="mt-4 text-4xl font-black tracking-[-.035em] sm:text-5xl">Satu platform untuk setiap peran di usaha budidaya.</h2></div><div className="mt-12 grid gap-5 md:grid-cols-3">{useCases.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><Icon size={22} /></div><h3 className="mt-6 text-xl font-extrabold">{title}</h3><p className="mt-3 leading-7 text-slate-500">{text}</p></div>)}</div></div>
      </section>

      <section className="bg-white px-6 py-20 text-slate-900 lg:px-10 lg:py-28"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-24"><div><p className="text-sm font-extrabold uppercase tracking-[.18em] text-teal-600">Pertanyaan umum</p><h2 className="mt-4 text-4xl font-black tracking-[-.035em] sm:text-5xl">Yang perlu Anda tahu sebelum mulai.</h2><p className="mt-5 leading-8 text-slate-500">Masih ingin melihat cara kerja PondFlow? Coba halaman demo atau langsung mulai dengan workspace Anda sendiri.</p><Link href="/demo" className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-teal-700">Lihat demo dashboard <ArrowRight size={16} /></Link></div><div className="divide-y divide-slate-200 rounded-3xl border border-slate-200 px-6">{faqs.map(([question, answer]) => <details key={question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-extrabold marker:content-none"><span>{question}</span><ChevronDown size={18} className="shrink-0 text-teal-600 transition group-open:rotate-180" /></summary><p className="max-w-2xl pt-3 text-sm leading-7 text-slate-500">{answer}</p></details>)}</div></div></section>

      <section className="px-6 py-20 lg:px-10 lg:py-28"><div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#092b3c] p-8 text-white shadow-2xl shadow-slate-300/30 sm:p-12"><div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]"><div><div className="flex items-center gap-3"><Sparkles className="text-cyan-300" size={21} /><p className="text-sm font-extrabold uppercase tracking-[.16em] text-cyan-300">Early access PondFlow</p></div><h2 className="mt-5 max-w-2xl text-3xl font-black tracking-[-.03em] sm:text-4xl">Mulai kelola siklus pertama Anda dengan lebih terukur.</h2><p className="mt-4 max-w-xl leading-7 text-slate-300">PondFlow sedang dikembangkan untuk membantu pelaku budidaya membangun kebiasaan operasional yang lebih rapi dan profitable.</p><div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold text-slate-300"><span className="flex items-center gap-2"><Check size={15} className="text-cyan-300" /> Akses web/PWA</span><span className="flex items-center gap-2"><Check size={15} className="text-cyan-300" /> Android tersedia</span><span className="flex items-center gap-2"><Check size={15} className="text-cyan-300" /> IoT segera hadir</span></div></div><Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 py-3.5 text-sm font-extrabold text-[#082234] transition hover:bg-cyan-200">Buat workspace gratis <ArrowRight size={17} /></Link></div></div></section>
    </>
  );
}
