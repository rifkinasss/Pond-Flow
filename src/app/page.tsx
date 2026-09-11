import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Apple, ArrowRight, BarChart3, BrainCircuit, Check, ChevronDown, CircleDollarSign, Cpu, Database, Download, Gauge, Leaf, Radio, ShieldCheck, Smartphone, Waves } from "lucide-react";
import { createClient } from "@/shared/lib/app/server";
import { LandingScrollButton } from "./LandingScrollButton";
import { ProcessSection } from "./ProcessSection";
import { LandingConversionSections } from "./LandingConversionSections";

export const metadata = {
  title: "Kelola budidaya ikan dengan lebih terukur",
  description: "PondFlow membantu pembudidaya ikan mencatat biaya, memantau kolam, dan mengambil keputusan berdasarkan data.",
};

const features = [
  { icon: CircleDollarSign, title: "Keuangan yang rapi", description: "Catat pakan, benih, listrik, obat, dan pemasukan dalam satu tempat.", example: "Contoh: pakan Rp 2,4 jt · listrik Rp 350 rb", color: "text-amber-600", background: "bg-amber-100" },
  { icon: BarChart3, title: "HPP & laba otomatis", description: "Ketahui biaya produksi per kg dan performa setiap siklus panen.", example: "Contoh: HPP Rp 18.500/kg · margin 32%", color: "text-cyan-600", background: "bg-cyan-100" },
  { icon: BrainCircuit, title: "Insight yang actionable", description: "Dapatkan analisis FCR, margin, survival rate, dan saran perbaikan.", example: "Contoh: FCR 1,42 · efisiensi pakan bagus", color: "text-violet-600", background: "bg-violet-100" },
];

const steps = [
  ["01", "Catat aktivitas", "Masukkan data kolam, siklus, pengeluaran, dan panen dari mana saja."],
  ["02", "PondFlow menghitung", "Data dirangkum menjadi HPP, margin, FCR, dan tren performa."],
  ["03", "Ambil keputusan", "Gunakan insight untuk menekan biaya dan membuat siklus berikutnya lebih sehat."],
];

const tech = [
  [Database, "SQLite self-hosted", "Data tersimpan di server Anda sendiri."],
  [Cpu, "Next.js + TypeScript", "Cepat, modern, dan siap dikembangkan."],
  [Smartphone, "Capacitor JS", "Satu codebase untuk aplikasi Android dan iOS."],
  [Radio, "IoT — Coming Soon", "Eksperimen sensor dan auto-feeder untuk workflow pribadi."],
  [ShieldCheck, "Private by design", "Akses data dibatasi per akun dan sesi."],
];

const androidApkVersion = process.env.NEXT_PUBLIC_ANDROID_APK_VERSION ?? "1.0.1";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen overflow-x-clip bg-[#071b2a] text-white selection:bg-cyan-300 selection:text-[#071b2a]">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#071b2a]/90 px-6 py-5 backdrop-blur-xl lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="PondFlow beranda"><Image src="/logo.png" alt="" width={42} height={42} className="rounded-xl" priority /><span className="text-xl font-extrabold tracking-tight">Pond<span className="text-cyan-300">Flow</span></span></Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex"><LandingScrollButton target="fitur" className="transition hover:text-white">Fitur</LandingScrollButton><LandingScrollButton target="cara-kerja" className="transition hover:text-white">Cara kerja</LandingScrollButton><LandingScrollButton target="teknologi" className="transition hover:text-white">Teknologi</LandingScrollButton><Link href="/download" className="transition hover:text-white">Download</Link></div>
          <Link href="/register" className="rounded-full bg-cyan-300 px-4 py-2.5 text-sm font-bold text-[#082234] shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-200">Mulai gratis</Link>
        </div>
      </nav>
      <div className="relative isolate">
        <div className="pointer-events-none absolute -left-48 top-24 -z-10 h-[34rem] w-[34rem] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-64 top-0 -z-10 h-[40rem] w-[40rem] rounded-full bg-blue-500/10 blur-3xl" />
        <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-14 lg:grid-cols-[1.03fr_.97fr] lg:px-10 lg:pb-32 lg:pt-20">
          <div className="max-w-2xl"><div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3.5 py-2 text-xs font-semibold text-cyan-200"><span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />Platform Operasional Budidaya Perikanan · Aquaculture Operations Management</div><h1 className="text-5xl font-black leading-[1.04] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">Budidaya lebih terukur. <span className="text-cyan-300">Panen lebih yakin.</span></h1><p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">PondFlow menyatukan catatan kolam, keuangan, dan data operasional agar Anda tahu apa yang terjadi di setiap siklus—dan tahu langkah berikutnya.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="group inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 py-3.5 text-sm font-extrabold text-[#082234] shadow-xl shadow-cyan-500/10 transition hover:-translate-y-0.5 hover:bg-cyan-200">Mulai kelola kolam <ArrowRight size={17} className="transition group-hover:translate-x-1" /></Link><LandingScrollButton target="cara-kerja" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-bold text-white transition hover:border-white/30 hover:bg-white/5">Lihat cara kerjanya <ChevronDown size={17} /></LandingScrollButton></div><div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-400"><span className="flex items-center gap-2"><Check size={15} className="text-cyan-300" /> Berbasis data</span><span className="flex items-center gap-2"><Check size={15} className="text-cyan-300" /> Mobile-ready</span><span className="flex items-center gap-2"><Check size={15} className="text-cyan-300" /> Data Anda tetap privat</span></div></div>

          <div className="relative mx-auto w-full max-w-[550px] lg:ml-auto"><div className="absolute -inset-10 -z-10 rounded-full bg-cyan-300/10 blur-3xl" /><div className="rounded-[2rem] border border-white/10 bg-[#102f43]/90 p-3 shadow-2xl shadow-black/30 backdrop-blur"><div className="overflow-hidden rounded-[1.4rem] bg-[#f5fafc] text-slate-900"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Ringkasan usaha</p><p className="mt-1 text-lg font-extrabold">Halo, Kinas 👋</p></div><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700"><Waves size={18} /></div></div><div className="grid grid-cols-2 gap-3 p-5"><div className="rounded-2xl bg-[#dff8f4] p-4"><p className="text-[10px] font-bold uppercase text-teal-700">Laba bulan ini</p><p className="mt-2 text-2xl font-black text-teal-950">Rp 8,4 jt</p><p className="mt-1 text-[11px] font-semibold text-teal-700">↑ 12,8% dari bulan lalu</p></div><div className="rounded-2xl bg-[#e5f1ff] p-4"><p className="text-[10px] font-bold uppercase text-blue-700">Kolam aktif</p><p className="mt-2 text-2xl font-black text-blue-950">12 <span className="text-sm font-bold">kolam</span></p><div className="mt-2 flex gap-1"><span className="h-1.5 w-8 rounded-full bg-blue-500" /><span className="h-1.5 w-5 rounded-full bg-blue-200" /></div></div></div><div className="mx-5 mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-slate-500">Performa siklus berjalan</p><p className="mt-1 text-sm font-extrabold">Kolam Nila A-03</p></div><span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">Hari ke-47</span></div><div className="mt-5 flex items-end gap-1.5"><div className="h-8 flex-1 rounded-t bg-cyan-100" /><div className="h-12 flex-1 rounded-t bg-cyan-200" /><div className="h-10 flex-1 rounded-t bg-cyan-300" /><div className="h-16 flex-1 rounded-t bg-cyan-400" /><div className="h-20 flex-1 rounded-t bg-cyan-500" /><div className="h-24 flex-1 rounded-t bg-[#0c9bb5]" /><div className="h-28 flex-1 rounded-t bg-[#087d99]" /></div><div className="mt-3 flex items-center justify-between text-[10px] font-semibold text-slate-400"><span>Biaya produksi</span><span className="text-slate-700">Rp 5.240.000</span></div></div></div></div><div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#153a51] px-4 py-3 shadow-xl sm:flex"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300"><Gauge size={18} /></div><div><p className="text-[10px] font-bold text-slate-400">FCR siklus ini</p><p className="text-sm font-extrabold">1.42 <span className="text-[10px] text-emerald-300">Bagus</span></p></div></div></div>
        </section>
        <div className="border-y border-white/10 bg-white/[0.03]">
          <div className="mx-auto grid max-w-7xl gap-px px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
            <div className="flex items-center gap-3 border-white/10 py-5 sm:border-r sm:px-6 lg:px-8"><span className="text-lg font-black text-cyan-300">01</span><span className="text-xs font-semibold uppercase tracking-[.14em] text-slate-300">Kelola kolam</span></div>
            <div className="flex items-center gap-3 border-white/10 py-5 sm:px-6 lg:border-r lg:px-8"><span className="text-lg font-black text-cyan-300">02</span><span className="text-xs font-semibold uppercase tracking-[.14em] text-slate-300">Kontrol biaya</span></div>
            <div className="flex items-center gap-3 border-white/10 py-5 sm:border-r sm:px-6 lg:px-8"><span className="text-lg font-black text-cyan-300">03</span><span className="text-xs font-semibold uppercase tracking-[.14em] text-slate-300">Analisis panen</span></div>
            <div className="flex items-center gap-3 py-5 sm:px-6 lg:px-8"><span className="text-lg font-black text-cyan-300">04</span><span className="text-xs font-semibold uppercase tracking-[.14em] text-slate-300">Siap mobile</span></div>
          </div>
        </div>
      </div>

      <section data-section="fitur" className="scroll-mt-24 bg-[#f4fbfc] px-6 py-20 text-slate-900 lg:px-10 lg:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-sm font-extrabold uppercase tracking-[.18em] text-teal-600">Satu dashboard, banyak kepastian</p><h2 className="mt-4 text-4xl font-black tracking-[-.035em] sm:text-5xl">Satu sistem operasional untuk keputusan bisnis yang lebih baik.</h2><p className="mt-5 text-lg leading-8 text-slate-500">Satukan aktivitas lapangan, angka keuangan, dan performa panen dalam satu alur kerja yang jelas. PondFlow membuat data budidaya mudah dicatat dan mudah dipahami.</p></div><div className="mt-14 grid gap-5 md:grid-cols-3">{features.map(({ icon: Icon, title, description, example, color, background }) => <div key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${background} ${color}`}><Icon size={22} /></div><h3 className="mt-6 text-xl font-extrabold">{title}</h3><p className="mt-3 leading-7 text-slate-500">{description}</p><p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold leading-5 text-slate-600">{example}</p><Link href="/demo" className="mt-6 flex items-center gap-2 text-sm font-bold text-teal-700 transition hover:text-teal-800">Lihat demo <ArrowRight size={16} /></Link></div>)}</div></div></section>

      <ProcessSection />

      <section data-section="teknologi" className="scroll-mt-24 bg-white px-6 py-20 text-slate-900 lg:px-10 lg:py-28"><div className="mx-auto max-w-7xl"><div className="grid items-end gap-8 lg:grid-cols-[.85fr_1.15fr]"><div><p className="text-sm font-extrabold uppercase tracking-[.18em] text-teal-600">Dibangun untuk bertumbuh</p><h2 className="mt-4 text-4xl font-black tracking-[-.035em] sm:text-5xl">Teknologi yang kuat, tetap terasa sederhana.</h2></div><p className="max-w-xl text-lg leading-8 text-slate-500">PondFlow dirancang sebagai fondasi digital untuk usaha budidaya—mulai dari satu kolam sampai multi-lokasi dan perangkat IoT. Web app-nya juga dapat dipasang sebagai PWA atau dikemas menjadi aplikasi mobile Android dan iOS.</p></div><div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{tech.map(([Icon, title, description]) => <div key={title as string} className="rounded-3xl border border-slate-200 p-6"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><Icon size={20} /></div><h3 className="mt-5 font-extrabold">{title as string}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{description as string}</p></div>)}</div><div className="mt-14 overflow-hidden rounded-[2rem] bg-[#dff8f4] p-8 sm:p-12"><div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]"><div><div className="flex items-center gap-3"><Leaf className="text-teal-700" size={22} /><p className="font-extrabold text-teal-950">Siap untuk langkah berikutnya</p></div><h3 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-teal-950">Mulai membangun usaha budidaya yang lebih sehat dan menguntungkan.</h3></div><Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#092b3c] px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#123f54]">Coba PondFlow <ArrowRight size={17} /></Link></div></div></div></section>


      <LandingConversionSections />

      

<section className="bg-[#f4fbfc] px-6 py-20 text-slate-900 lg:px-10 lg:py-24"><div className="mx-auto max-w-7xl"><div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12"><div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]"><div><p className="text-sm font-extrabold uppercase tracking-[.18em] text-teal-600">PondFlow di perangkat Anda</p><h2 className="mt-4 text-3xl font-black tracking-[-.035em] sm:text-4xl">Akses PondFlow di mana saja.</h2><p className="mt-4 leading-7 text-slate-500">Gunakan versi web sekarang atau download APK Android. Aplikasi iOS sedang disiapkan untuk rilis berikutnya.</p></div><div className="grid gap-3 sm:grid-cols-3"><Link href="/download" className="rounded-2xl border border-teal-200 bg-teal-50 p-4 transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-sm"><Download className="text-teal-700" size={21} /><p className="mt-4 text-sm font-extrabold">Android APK</p><p className="mt-1 text-xs text-teal-700">Download v{androidApkVersion} →</p></Link><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><Apple className="text-slate-700" size={21} /><p className="mt-4 text-sm font-extrabold">iOS App</p><p className="mt-1 text-xs text-slate-500">Segera hadir</p></div><Link href="/register" className="rounded-2xl bg-[#092b3c] p-4 text-white transition hover:bg-[#123f54]"><Smartphone size={21} className="text-cyan-300" /><p className="mt-4 text-sm font-extrabold">Versi web/PWA</p><p className="mt-1 text-xs text-slate-300">Gunakan sekarang →</p></Link></div></div></div></div></section>

      <footer className="bg-[#071b2a] px-6 py-8 text-slate-400 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 font-bold text-white"><Image src="/logo.png" alt="" width={26} height={26} className="rounded-lg" /> Pond<span className="text-cyan-300">Flow</span></div><p>© 2026 PondFlow · Dibuat oleh <a href="https://naslabs.my.id" target="_blank" rel="noreferrer" className="font-semibold text-cyan-300 transition hover:text-cyan-200">NasLabs</a>.</p><div className="flex gap-4"><Link href="/login" className="transition hover:text-white">Masuk</Link><Link href="/register" className="transition hover:text-white">Daftar</Link></div></div></footer>
    </main>
  );
}
