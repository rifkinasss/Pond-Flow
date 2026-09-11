import Image from "next/image";
import Link from "next/link";

export function PublicNavbar({ current }: { current?: "download" }) {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#071b2a]/95 px-6 py-5 text-white shadow-lg shadow-slate-900/10 backdrop-blur-xl lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="PondFlow beranda"><Image src="/logo.png" alt="PondFlow" width={42} height={42} className="rounded-xl" priority /><span className="text-xl font-extrabold tracking-tight">Pond<span className="text-cyan-300">Flow</span></span></Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex"><Link href="/" className="transition hover:text-white">Fitur</Link><Link href="/" className="transition hover:text-white">Cara kerja</Link><Link href="/" className="transition hover:text-white">Teknologi</Link><Link href="/download" className={current === "download" ? "font-bold text-cyan-300" : "transition hover:text-white"}>Download</Link></div>
        <Link href="/register" className="rounded-full bg-cyan-300 px-4 py-2.5 text-sm font-bold text-[#082234] shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-200">Mulai gratis</Link>
      </div>
    </nav>
  );
}
