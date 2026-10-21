"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardPlus,
  FileSpreadsheet,
  LayoutDashboard,
  TrainFront,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/input", label: "Input", icon: ClipboardPlus },
  { href: "/import", label: "Impor", icon: FileSpreadsheet },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/5 bg-slate-950/60 px-4 py-6 backdrop-blur md:flex">
        <Link href="/" className="flex items-center gap-3 px-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
            <TrainFront className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-wide text-slate-100">
              Wheel Watch
            </span>
            <span className="block text-[11px] uppercase tracking-[0.18em] text-slate-500">
              CC205 Fleet
            </span>
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-white/10 font-medium text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                )}
              >
                <item.icon
                  className={cn(
                    "size-4",
                    active ? "text-amber-400" : "text-slate-500",
                  )}
                />
                {item.label === "Impor" ? "Impor data" : item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-[11px] leading-relaxed text-slate-500">
            Ambang batas mengikuti limit keausan roda. Data demo aktif bila
            database belum terhubung.
          </div>
          <p className="mt-3 text-center text-[10px] tracking-wide text-slate-600">
            Credit <span className="font-medium text-slate-400">zkvoid</span>
          </p>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-slate-950/85 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
              <TrainFront className="size-4" />
            </span>
            <span className="text-sm font-semibold">Wheel Watch</span>
          </Link>
          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            CC205 Fleet
          </span>
        </header>

        <main className="flex-1 px-3 pb-4 pt-4 sm:px-4 sm:pt-5 md:px-8 md:pb-8 md:pt-8">
          {children}
        </main>

        <footer className="border-t border-white/5 px-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-5 text-center text-[10px] tracking-wide text-slate-600 md:px-8 md:py-4 md:pb-4">
          CC205 Wheel Watch · Credit{" "}
          <span className="font-medium text-slate-400">zkvoid</span>
        </footer>
      </div>

      <nav
        aria-label="Navigasi bawah"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/95 shadow-[0_-8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden"
      >
        <div className="mx-auto flex max-w-lg items-stretch gap-1 px-3 pb-[calc(0.4rem+env(safe-area-inset-bottom))] pt-1.5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="flex min-h-[3.5rem] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1 transition active:scale-[0.97]"
              >
                <span
                  className={cn(
                    "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                    active
                      ? "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-400/25"
                      : "text-slate-500",
                  )}
                >
                  <item.icon
                    className="size-[22px]"
                    strokeWidth={active ? 2.4 : 2}
                  />
                </span>
                <span
                  className={cn(
                    "text-[10px] leading-none transition-colors",
                    active
                      ? "font-semibold text-amber-300"
                      : "font-medium text-slate-500",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
