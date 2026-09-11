import Link from "next/link";
import { ArrowDownToLine, ArrowUpRight, Check, ChevronRight, History, Smartphone, Sparkles, Wrench } from "lucide-react";
import { PublicNavbar } from "../PublicNavbar";

const apkUrl = process.env.NEXT_PUBLIC_ANDROID_APK_URL ?? "https://github.com/rifkinasss/Pond-Flow/releases/download/v1.0.1/PondFlow-v1.0.1-release.apk";
const version = process.env.NEXT_PUBLIC_ANDROID_APK_VERSION ?? "1.0.1";
const releaseUrl = process.env.NEXT_PUBLIC_RELEASE_PAGE_URL ?? "https://github.com/rifkinasss/Pond-Flow/releases/tag/v1.0.1";

export const metadata = {
  title: "Download & Changelog",
  description: "Download aplikasi PondFlow dan lihat perubahan setiap rilis.",
};

const changes = [
  ["Fitur Logout Khusus Mobile & Desktop", "Menu dropdown avatar di sudut kanan atas header menyediakan akses cepat ke Profil Saya dan Keluar Akun. Kartu Keluar dari Akun juga ditambahkan di bagian paling bawah halaman Profil."],
  ["Transisi Loading Halaman Login yang Mulus (UX)", "Indikator loading Memproses… tetap aktif sampai halaman Dashboard selesai ter-render, sehingga mencegah layar mengedip kembali ke form login saat memuat data."],
  ["Penyelesaian Bug Notifikasi", "Badge angka notifikasi tidak lagi muncul kembali setelah halaman di-refresh atau polling otomatis berjalan. Status baca kini disimpan secara lokal di localStorage."],
  ["Indikator Visual Notifikasi Dibaca", "Notifikasi yang telah dibaca tampil lebih redup dengan opacity-60 agar mudah dibedakan dari pesan baru."],
  ["Label Versi Aplikasi", "Tulisan versi aplikasi v1.0.1 ditambahkan di bawah form halaman Login dan Register."],
  ["APK Rilis Ditandatangani Otomatis", "Penamaan Gradle dan auto-signing dikonfigurasi agar PondFlow-v1.0.1-release.apk siap dipasang di HP tanpa kendala paket tidak valid."],
];

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-[#f4f8fa] text-slate-900">
      <PublicNavbar current="download" />

      <section className="mx-auto max-w-6xl px-6 pb-12 pt-12 lg:px-10 lg:pt-16"><div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><div className="flex items-center gap-3"><span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-extrabold text-emerald-700">Rilis terbaru</span><span className="text-sm font-bold text-slate-400">v{version}</span></div><h1 className="mt-5 max-w-3xl text-4xl font-black tracking-[-.045em] text-slate-950 sm:text-6xl">PondFlow v{version}<br /><span className="text-teal-600">Perbaikan bug, UX, dan rilis mobile.</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-500">Perbaikan bug minor, penambahan informasi versi aplikasi, peningkatan animasi transisi halaman (UX), serta penambahan tombol Logout khusus Mobile.</p></div><div className="flex items-center gap-2 text-sm font-semibold text-slate-400"><History size={17} /> Release notes · v{version}</div></div></section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-16 lg:grid-cols-[1.35fr_.65fr] lg:px-10"><div className="rounded-[2rem] bg-[#092b3c] p-7 text-white shadow-xl shadow-slate-300/30 sm:p-10"><div className="flex items-center gap-3 text-cyan-300"><Smartphone size={20} /><p className="text-xs font-extrabold uppercase tracking-[.18em]">Android application</p></div><h2 className="mt-5 text-3xl font-black">Download PondFlow untuk Android</h2><p className="mt-4 max-w-xl leading-7 text-slate-300">APK resmi untuk perangkat Android. Pastikan Anda mengaktifkan izin instalasi dari sumber ini jika diperlukan oleh perangkat.</p><a href={apkUrl} className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3.5 text-sm font-extrabold text-[#082234] transition hover:bg-cyan-200"><ArrowDownToLine size={18} /> Download APK v{version}</a><p className="mt-4 text-xs text-slate-400">File release · PondFlow-v{version}-release.apk</p></div><div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><Sparkles size={21} /></div><h2 className="mt-5 text-xl font-extrabold">Yang berubah di rilis ini</h2><p className="mt-3 text-sm leading-7 text-slate-500">Fokus utama rilis v{version} adalah stabilitas notifikasi, UX login, dan kesiapan aplikasi mobile.</p><Link href={releaseUrl} target="_blank" className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-teal-700">Buka release GitHub <ArrowUpRight size={16} /></Link></div></section>

      <section className="mx-auto max-w-6xl px-6 pb-20 lg:px-10"><div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10"><div className="flex items-center gap-3"><Wrench className="text-teal-600" size={22} /><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-teal-600">Changelog</p><h2 className="mt-1 text-2xl font-black">Perbaikan & peningkatan fitur</h2></div></div><div className="mt-8 grid gap-x-12 gap-y-7 md:grid-cols-2">{changes.map(([title, description], index) => <div key={title} className="flex gap-4"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-500">{index + 1}</div><div><h3 className="font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></div></div>)}</div><div className="mt-10 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-6 text-sm font-semibold text-slate-500"><span className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> Android siap instal</span><span className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> Web/PWA tetap tersedia</span><span className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> IoT masih Coming Soon</span></div></div></section>

      <footer className="border-t border-slate-200 bg-white px-6 py-7 lg:px-10"><div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 text-sm text-slate-400 sm:flex-row"><p>© 2026 PondFlow · Dibuat oleh <a href="https://naslabs.my.id" target="_blank" rel="noreferrer" className="font-bold text-teal-600">NasLabs</a>.</p><Link href="/register" className="flex items-center gap-1 font-bold text-slate-600">Mulai menggunakan <ChevronRight size={15} /></Link></div></footer>
    </main>
  );
}
