"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Imperative trigger (dapat dipanggil dari luar komponen) ────────────────
type TransitionCallback = () => void;
let _triggerFn: ((cb: TransitionCallback) => void) | null = null;

/**
 * Panggil fungsi ini untuk menampilkan animasi transisi, lalu
 * jalankan navigasi (atau aksi apapun) setelah overlay menutupi layar.
 *
 * Contoh:
 *   triggerPageTransition(() => router.push("/dashboard"));
 */
export function triggerPageTransition(onCovered: TransitionCallback) {
  if (_triggerFn) {
    _triggerFn(onCovered);
  } else {
    // Fallback jika provider belum mount
    onCovered();
  }
}

// ─── States ────────────────────────────────────────────────────────────────
type OverlayState = "hidden" | "covering" | "covered" | "revealing";

export function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [overlayState, setOverlayState] = useState<OverlayState>("hidden");
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bersihkan timer saat unmount
  useEffect(() => {
    return () => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  // Daftarkan fungsi trigger ke singleton global
  const trigger = useCallback((onCovered: TransitionCallback) => {
    // Batalkan animasi yang sedang berjalan
    if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);

    // Phase 1: Mulai slide-up dari bawah (hidden → covering)
    setOverlayState("covering");

    // Phase 2: Setelah overlay penuh menutupi layar, jalankan navigasi
    enterTimerRef.current = setTimeout(() => {
      setOverlayState("covered");
      onCovered(); // ← navigasi terjadi di sini, saat layar tertutup

      // Phase 3: Setelah sedikit delay (beri waktu halaman baru render), mulai reveal
      leaveTimerRef.current = setTimeout(() => {
        setOverlayState("revealing");

        // Phase 4: Overlay selesai keluar, reset ke hidden
        leaveTimerRef.current = setTimeout(() => {
          setOverlayState("hidden");
        }, 600);
      }, 200);
    }, 480);
  }, []);

  useEffect(() => {
    _triggerFn = trigger;
    return () => {
      _triggerFn = null;
    };
  }, [trigger]);

  // ─── Hitung transform berdasarkan state ──────────────────────────────────
  const getTransform = () => {
    switch (overlayState) {
      case "hidden":    return "translateY(100%)";   // di bawah layar
      case "covering":  return "translateY(0)";       // sedang naik
      case "covered":   return "translateY(0)";       // penuh menutupi
      case "revealing": return "translateY(-100%)";   // sedang turun ke atas
    }
  };

  const getTransition = () => {
    switch (overlayState) {
      case "hidden":    return "none";
      case "covering":  return "transform 500ms cubic-bezier(0.76, 0, 0.24, 1)";
      case "covered":   return "none";
      case "revealing": return "transform 550ms cubic-bezier(0.76, 0, 0.24, 1)";
    }
  };

  return (
    <>
      {children}

      {/* ── Luxury Transition Overlay ─────────────────────────── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden"
        style={{
          transform: getTransform(),
          transition: getTransition(),
          willChange: "transform",
        }}
      >
        {/* ── Background ────────────────────────────────────────── */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-[#0a1628] to-gray-950" />

        {/* ── Grid texture ──────────────────────────────────────── */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(14,165,233,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.3) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />

        {/* ── Glow orb — top left ───────────────────────────────── */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 480,
            height: 480,
            background:
              "radial-gradient(circle, rgba(14,165,233,0.25) 0%, transparent 65%)",
            top: "-80px",
            left: "-60px",
            filter: "blur(40px)",
            animation: "pulseOrb 2.4s ease-in-out infinite alternate",
          }}
        />

        {/* ── Glow orb — bottom right ───────────────────────────── */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 380,
            height: 380,
            background:
              "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 65%)",
            bottom: "-60px",
            right: "-40px",
            filter: "blur(40px)",
            animation: "pulseOrb 3s ease-in-out infinite alternate-reverse",
          }}
        />

        {/* ── Horizontal accent line ────────────────────────────── */}
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(14,165,233,0.5) 20%, rgba(6,182,212,0.8) 50%, rgba(14,165,233,0.5) 80%, transparent)",
            top: "50%",
            transform: "translateY(-60px)",
            opacity: 0.4,
          }}
        />

        {/* ── Center Brand Mark ─────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Spinning ring + logo */}
          <div className="relative flex items-center justify-center">
            {/* Outer spinning ring */}
            <svg
              className="absolute"
              style={{
                width: 112,
                height: 112,
                animation: "spinRing 1.4s linear infinite",
              }}
              viewBox="0 0 112 112"
            >
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(14,165,233,0)" />
                  <stop offset="50%" stopColor="rgba(14,165,233,0.9)" />
                  <stop offset="100%" stopColor="rgba(6,182,212,0)" />
                </linearGradient>
              </defs>
              <circle
                cx="56"
                cy="56"
                r="52"
                fill="none"
                stroke="url(#ringGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="120 212"
              />
            </svg>

            {/* Inner spinning ring (berlawanan arah) */}
            <svg
              className="absolute"
              style={{
                width: 88,
                height: 88,
                animation: "spinRing 2s linear infinite reverse",
                opacity: 0.45,
              }}
              viewBox="0 0 88 88"
            >
              <circle
                cx="44"
                cy="44"
                r="40"
                fill="none"
                stroke="rgba(6,182,212,0.7)"
                strokeWidth="1"
                strokeLinecap="round"
                strokeDasharray="40 211"
              />
            </svg>

            {/* Logo box */}
            <div
              className="w-16 h-16 rounded-2xl overflow-hidden border border-sky-400/40 shadow-[0_0_40px_rgba(14,165,233,0.4)]"
              style={{
                background: "linear-gradient(135deg, #38bdf8, #06b6d4)",
                animation: "logoFloat 2.2s ease-in-out infinite",
              }}
            >
              <img
                src="/logo.png"
                alt="PondFlow"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  const parent = el.parentElement;
                  if (parent && !parent.querySelector("span")) {
                    const span = document.createElement("span");
                    span.style.cssText =
                      "color:white;font-weight:800;font-size:1.5rem;display:flex;align-items:center;justify-content:center;height:100%;width:100%";
                    span.textContent = "P";
                    parent.appendChild(span);
                  }
                }}
              />
            </div>
          </div>

          {/* App name */}
          <div className="flex flex-col items-center gap-3">
            <p
              className="font-bold text-2xl tracking-tight select-none"
              style={{
                background: "linear-gradient(90deg, #e0f2fe, #38bdf8, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              PondFlow
            </p>

            {/* Bouncing dots */}
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="block rounded-full bg-sky-400"
                  style={{
                    width: i === 1 || i === 2 ? 6 : 5,
                    height: i === 1 || i === 2 ? 6 : 5,
                    animation: `bounceDot 1.1s ease-in-out ${i * 0.14}s infinite`,
                    opacity: 0.85,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom wave ───────────────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg
            viewBox="0 0 1440 100"
            className="w-full"
            style={{ height: 100, display: "block" }}
            preserveAspectRatio="none"
          >
            <path
              d="M0,50 C240,100 480,0 720,50 C960,100 1200,0 1440,50 L1440,100 L0,100 Z"
              fill="rgba(14,165,233,0.07)"
            />
            <path
              d="M0,70 C360,20 1080,100 1440,60 L1440,100 L0,100 Z"
              fill="rgba(6,182,212,0.05)"
            />
          </svg>
        </div>

        {/* ── Top wave ──────────────────────────────────────────── */}
        <div className="absolute top-0 left-0 right-0 pointer-events-none rotate-180">
          <svg
            viewBox="0 0 1440 80"
            className="w-full"
            style={{ height: 80, display: "block" }}
            preserveAspectRatio="none"
          >
            <path
              d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
              fill="rgba(14,165,233,0.05)"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
